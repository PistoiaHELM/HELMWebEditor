/*******************************************************************************
* Copyright C 2017, The Pistoia Alliance
* Created by Scilligence, built on JSDraw.Lite
* 
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the 
* following conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*******************************************************************************/

/**
* IO class
* @class org.helm.webeditor.IO
*/
org.helm.webeditor.IO = {
    kVersion: "V2.0",

    /**
    * Get HELM Notation
    * @function getHelm
    */
    getHelm: function (m, highlightselection) {
        var branches = {};
        var chains = org.helm.webeditor.Chain.getChains(m, branches);

        for (var i = 0; i < m.atoms.length; ++i)
            m.atoms[i]._aaid = null;

        var ret = { chainid: { RNA: 0, PEPTIDE: 0, CHEM: 0 }, sequences: {}, connections: [], chains: {}, annotations: {} };
        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];
            chain.getHelm(ret, highlightselection);
        }

        for (var i = 0; i < branches.atoms.length; ++i) {
            var a = branches.atoms[i];
            if (a.biotype() != org.helm.webeditor.HELM.CHEM) {
                // error
                return null;
            }

            var id = "CHEM" + (++ret.chainid.CHEM);
            ret.sequences[id] = this.getCode(a, highlightselection);
            ret.chains[id] = [a];
            a._aaid = 1;
        }

        var pairs = [];
        // RNA1,RNA2,5:pair-11:pair
        for (var i = 0; i < branches.bonds.length; ++i) {
            var b = branches.bonds[i];

            var tag = "";
            if (!scil.Utils.isNullOrEmpty(b.tag))
                tag = '\"' + b.tag.replace(/"/g, "\\\"") + '\"';

            if (b.type == JSDraw2.BONDTYPES.UNKNOWN) {
                var c1 = this.findChainID(ret.chains, b.a1);
                var c2 = this.findChainID(ret.chains, b.a2);
                var s = c1 + "," + c2 + "," + b.a1._aaid + ":pair-" + b.a2._aaid + ":pair";
                pairs.push(s + tag);
            }
            else {
                var c1 = this.findChainID(ret.chains, b.a1);
                var c2 = this.findChainID(ret.chains, b.a2);
                var s = c1 + "," + c2 + "," + b.a1._aaid + ":R" + b.r1 + "-" + b.a2._aaid + ":R" + b.r2;
                ret.connections.push(s + tag);
            }
        }

        var s = "";
        for (var k in ret.sequences)
            s += (s == "" ? "" : "|") + k + "{" + ret.sequences[k] + "}";

        if (s == "")
            return s;

        s += "$";
        for (var i = 0; i < ret.connections.length; ++i)
            s += (i > 0 ? "|" : "") + ret.connections[i];

        s += "$";
        for (var i = 0; i < pairs.length; ++i)
            s += (i > 0 ? "|" : "") + pairs[i];

        s += "$";

        //RNA1{R(C)P.R(A)P.R(T)}$$$RNA1{ss}$
        var ann = scil.Utils.json2str(ret.annotations, null, true);
        s += ann == "null" ? "" : ann;

        s += "$";
        return s + this.kVersion;
    },

    /**
    * Get the natural sequence of the molecule
    * @function getSequence
    */
    getSequence: function (m, highlightselection) {
        var branches = {};
        var chains = org.helm.webeditor.Chain.getChains(m, branches);
        if (chains == null)
            return null;

        var s = "";
        for (var i = 0; i < chains.length; ++i) {
            var s2 = chains[i].getSequence(highlightselection);
            if (scil.Utils.isNullOrEmpty(s2))
                continue;
            if (s != "")
                s += "\r\n";
            s += s2;
        }

        return s;
    },

    /**
    * Get XHELM
    * @function getXHelm
    */
    getXHelm: function (m) {
        var s = this.getHelm(m);
        if (scil.Utils.isNullOrEmpty(s))
            return s;

        var s = "<Xhelm>\n<HelmNotation>" + scil.Utils.escXmlValue(s) + "</HelmNotation>\n";

        var list = this.getMonomers(m);
        if (list != null) {
            s += "<Monomers>\n";
            for (var i in list)
                s += org.helm.webeditor.Monomers.writeOne(list[i]);
            s += "</Monomers>\n";
        }
        s += "</Xhelm>";
        return s;
    },

    /**
    * Get all monomers of a molecule
    * @function getMonomers
    */
    getMonomers: function (m) {
        var ret = {};
        var atoms = m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            var biotype = a.biotype();
            if (!org.helm.webeditor.isHelmNode(a))
                continue;

            var m = org.helm.webeditor.Monomers.getMonomer(a);
            var t = biotype + " " + a.elem;
            if (ret[t] == null) {
                var type = null;
                var mt = null;
                if (biotype == org.helm.webeditor.HELM.CHEM) {
                    type = "CHEM";
                    mt = "Undefined"
                }
                else if (biotype == org.helm.webeditor.HELM.AA) {
                    type = "PEPTIDE";
                    mt = "Undefined"
                }
                else if (biotype == org.helm.webeditor.HELM.SUGAR) {
                    type = "RNA";
                    mt = "Backbone"
                }
                else if (biotype == org.helm.webeditor.HELM.BASE) {
                    type = "RNA";
                    mt = "Branch"
                }
                else if (biotype == org.helm.webeditor.HELM.LINKER) {
                    type = "RNA";
                    mt = "Backbone"
                }
                ret[t] = { id: a.elem, mt: mt, type: type, m: m };
            }
        }

        return ret;
    },

    /**
    * Get HELM Code of a monomer (internal use)
    * @function getCode
    */
    getCode: function (a, highlightselection, bracket) {
        var s;
        if (typeof (a) == "string") {
            s = a;
        }
        else {
            var m = org.helm.webeditor.Monomers.getMonomer(a);
            if (m.issmiles)
                s = m.smiles;
            else
                s = a.elem;
        }

        if (s == "?" && a.bio != null)
            s = a.bio.ambiguity;
        else if (s.length > 1)
            s = "[" + s + "]";

        if (!scil.Utils.isNullOrEmpty(a.tag))
            s += '\"' + a.tag.replace(/"/g, "\\\"") + '\"';

        if (bracket)
            s = "(" + s + ")";
        if (highlightselection && a.selected)
            s = "<span style='background:#bbf;'>" + s + "</span>";
        return s;
    },

    /**
    * Find the chain ID based on monomer (internal use)
    * @function findChainID
    */
    findChainID: function (chains, a) {
        for (var k in chains) {
            var atoms = chains[k];
            if (scil.Utils.indexOf(atoms, a) >= 0)
                return k;
        }
        return null;
    },

    /**
    * Read a generic string (internal use)
    * @function read
    */
    read: function (plugin, s, format, renamedmonomers, sugar, linker, separator) {
        if (scil.Utils.isNullOrEmpty(s))
            return 0;

        var s2 = s.toUpperCase();
        if (scil.Utils.isNullOrEmpty(format)) {
            if (/^((RNA)|(PEPTIDE)|(CHEM))[0-9]+/.test(s2))
                format = "HELM";
            else if (/^[A|G|T|C|U]+[>]?$/.test(s2))
                format = "RNA";
            else if (/^[A|C-I|K-N|P-T|V|W|Y|Z]+[>]?$/.test(s2))
                format = "Peptide";
            else
                throw "Cannot detect the format using nature monomer names";
        }

        var origin = org.helm.webeditor.Interface.createPoint(0, 0);
        if (format == "HELM") {
            return this.parseHelm(plugin, s, origin, renamedmonomers);
        }
        else if (format == "Peptide") {
            var chain = new org.helm.webeditor.Chain();
            var circle = scil.Utils.endswith(s, ">");
            if (circle)
                s = s.substr(0, s.length - 1);
            var ss = this.splitChars(s, separator);
            if (circle)
                ss.push(">");
            return this.addAAs(plugin, ss, chain, origin);
        }
        else if (format == "RNA") {
            var chain = new org.helm.webeditor.Chain();
            var ss = this.splitChars(s, separator);
            return this.addRNAs(plugin, ss, chain, origin, sugar, linker);
        }

        return 0;
    },

    /**
    * Parse a HELM string (internal use)
    * @function parseHelm
    */
    parseHelm: function (plugin, s, origin, renamedmonomers) {
        var n = 0;
        var sections = this.split(s, '$');
        var chains = {};

        // sequence
        s = sections[0];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var seqs = this.split(s, '|');
            for (var i = 0; i < seqs.length; ++i) {
                var e = this.detachAnnotation(seqs[i]);
                s = e.str;

                p = s.indexOf("{");
                var sid = s.substr(0, p);
                var type = sid.replace(/[0-9]+$/, "").toUpperCase();
                var id = parseInt(sid.substr(type.length));

                var chain = new org.helm.webeditor.Chain(sid);
                chains[sid] = chain;
                chain.type = type;

                s = s.substr(p + 1);
                p = s.indexOf('}');
                s = s.substr(0, p);

                var n2 = 0;
                var ss = this.split(s, '.');
                if (type == "PEPTIDE")
                    n2 = this.addAAs(plugin, ss, chain, origin, renamedmonomers);
                else if (type == "RNA")
                    n2 = this.addHELMRNAs(plugin, ss, chain, origin, renamedmonomers);
                else if (type == "CHEM")
                    n2 = this.addChem(plugin, s, chain, origin, renamedmonomers);

                if (n2 > 0) {
                    n += n2;
                    origin.y += 4 * plugin.jsd.bondlength;
                }
            }
        }

        // connection
        s = sections[1];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var ss = s == "" ? [] : this.split(s, '|');
            // RNA1,RNA1,1:R1-21:R2
            for (var i = 0; i < ss.length; ++i) {
                var e = this.detachAnnotation(ss[i]);
                var c = this.parseConnection(e.str);
                if (c == null || chains[c.chain1] == null || chains[c.chain2] == null)
                    continue; //error

                var atom1 = chains[c.chain1].getAtomByAAID(c.a1);
                var atom2 = chains[c.chain2].getAtomByAAID(c.a2);
                if (atom1 == null || atom2 == null)
                    continue; //error

                if (c.r1 == null || c.r2 == null || !/^R[0-9]+$/.test(c.r1) || !/^R[0-9]+$/.test(c.r2))
                    continue; //error
                var r1 = parseInt(c.r1.substr(1));
                var r2 = parseInt(c.r2.substr(1));
                if (!(r1 > 0 && r2 > 0))
                    continue; //error

                //chain.bonds.push(plugin.addBond(atom1, atom2, r1, r2));
                var b = plugin.addBond(atom1, atom2, r1, r2);
                b.tag = e.tag;
            }
        }

        // pairs, hydrogen bonds
        // RNA1,RNA2,2:pair-9:pair|RNA1,RNA2,5:pair-6:pair|RNA1,RNA2,8:pair-3:pair
        s = sections[2];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var ss = s == "" ? [] : this.split(s, '|');
            for (var i = 0; i < ss.length; ++i) {
                var c = this.parseConnection(ss[i]);
                if (c == null || chains[c.chain1] == null || chains[c.chain2] == null || !scil.Utils.startswith(c.chain1, "RNA") || !scil.Utils.startswith(c.chain2, "RNA"))
                    continue; //error

                var atom1 = chains[c.chain1].getAtomByAAID(c.a1);
                var atom2 = chains[c.chain2].getAtomByAAID(c.a2);
                if (atom1 == null || atom2 == null)
                    continue; //error

                if (c.r1 != "pair" || c.r2 != "pair")
                    continue; //error

                //chain.bonds.push(plugin.addBond(atom1, atom2, r1, r2));
                plugin.addHydrogenBond(atom1, atom2);
            }
        }

        // annotation
        s = sections[3];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var ann = scil.Utils.eval(s);
            if (ann != null) {
                // HELM 2.0
                for (var k in ann) {
                    var chain = chains[k];
                    if (chain != null && chain.type == "RNA") {
                        var strandtype = ann[k].strandtype;
                        if (strandtype == "ss" || strandtype == "as")
                            chain.atoms[0].bio.annotation = "5'" + strandtype;
                    }
                }
            }
            else {
                // HELM 1.0
                var ss = this.split(s, '|');
                for (var i = 0; i < ss.length; ++i) {
                    var s = ss[i];
                    p = s.indexOf("{");
                    var chn = s.substr(0, p);
                    s = s.substr(p);
                    if (s == "{ss}" || s == "{as}") {
                        var chain = chains[chn];
                        if (chain != null && chain.type == "RNA")
                            chain.atoms[0].bio.annotation = "5'" + s.substr(1, s.length - 2);
                    }
                }
            }
        }

        return n;
    },

    /**
    * Split components (internal use)
    * @function split
    */
    split: function (s, sep) {
        var ret = [];
        // PEPTIDE1{G.[C[13C@H](N[*])C([*])=O |$;;;_R1;;_R2;$|].T}$$$$

        var frag = "";
        var parentheses = 0;
        var bracket = 0;
        var quote = 0;
        for (var i = 0; i < s.length; ++i) {
            var c = s.substr(i, 1);
            if (c == sep && bracket == 0 && parentheses == 0 && quote == 0) {
                ret.push(frag);
                frag = "";
            }
            else {
                frag += c;
                if (c == '\"') {
                    if (!(i > 0 && s.substr(i - 1, 1) == '\\'))
                        quote = quote == 0 ? 1 : 0;
                }
                else if (c == '[')
                    ++bracket;
                else if (c == ']')
                    --bracket;
                else if (c == '(')
                    ++parentheses;
                else if (c == ')')
                    --parentheses;
            }
        }

        ret.push(frag);
        return ret;
    },

    /**
    * Parse HELM connection (internal use)
    * @function parseConnection
    */
    parseConnection: function (s) {
        var tt = s.split(',');
        if (tt.length != 3)
            return null; // error

        var tt2 = tt[2].split('-');
        if (tt2.length != 2)
            return null; // error

        var c1 = tt2[0].split(':');
        var c2 = tt2[1].split(':');
        if (c1.length != 2 || c2.length != 2)
            return null; // error

        return { chain1: tt[0], chain2: tt[1], a1: parseInt(c1[0]), r1: c1[1], a2: parseInt(c2[0]), r2: c2[1] };
    },

    /**
    * Split chars (internal use)
    * @function splitChars
    */
    splitChars: function (s, separator) {
        var ss = [];
        if (separator == null) {
            for (var i = 0; i < s.length; ++i)
                ss.push(s.substr(i, 1));
        }
        else {
            ss = s.split(separator);
        }
        return ss;
    },

    /**
    * Remove bracket (internal use)
    * @function trimBracket
    */
    trimBracket: function (s) {
        if (s != null && scil.Utils.startswith(s, "[") && scil.Utils.endswith(s, "]"))
            return s.substr(1, s.length - 2);
        return s;
    },

    /**
    * Make a renamed monomer (internal use)
    * @function getRenamedMonomer
    */
    getRenamedMonomer: function (type, elem, monomers) {
        if (monomers == null || monomers.length == 0)
            return elem;

        elem = org.helm.webeditor.IO.trimBracket(elem);
        for (var i = 0; i < monomers.length; ++i) {
            var m = monomers[i];
            if (m.oldname == elem)
                return m.id;
        }
        return elem;
    },

    /**
    * Remove annotation (internal use)
    * @function detachAnnotation
    */
    detachAnnotation: function (s) {
        var tag = null;
        if (scil.Utils.endswith(s, '\"')) {
            var p = s.length - 1;
            while (p > 0) {
                p = s.lastIndexOf('\"', p - 1);
                if (p <= 0 || s.substr(p - 1, 1) != '\\')
                    break;
            }

            if (p > 0 && p < s.length - 1) {
                tag = s.substr(p + 1, s.length - p - 2);
                s = s.substr(0, p);
            }
        }

        if (tag != null)
            tag = tag.replace(/\\"/g, '\"');
        return { tag: tag, str: s };
    },

    /**
    * Add a monomer (internal use)
    * @function addNode
    */
    addNode: function (plugin, chain, atoms, p, type, elem, renamedmonomers) {
        var e = this.detachAnnotation(elem);
        a2 = plugin.addNode(p, type, this.getRenamedMonomer(type, e.str, renamedmonomers));
        if (a2 == null)
            throw "Failed to creating node: " + e.str;

        a2.tag = e.tag;
        atoms.push(a2);
        a2._aaid = chain.atoms.length + chain.bases.length;
        return a2;
    },

    /**
    * Add a CHEM node (internal use)
    * @function addChem
    */
    addChem: function (plugin, name, chain, origin, renamedmonomers) {
        this.addNode(plugin, chain, chain.atoms, origin.clone(), org.helm.webeditor.HELM.CHEM, name, renamedmonomers);
        return 1;
    },

    /**
    * Add Amino Acid (internal use)
    * @function addAAs
    */
    addAAs: function (plugin, ss, chain, origin, renamedmonomers) {
        var n = 0;

        var firstatom = null;
        var a1 = null;
        var a2 = null;
        var m = plugin.jsd.m;
        var delta = org.helm.webeditor.bondscale * plugin.jsd.bondlength;
        var p = origin.clone();
        for (var i = 0; i < ss.length; ++i) {
            if (i == ss.length - 1 && ss[i] == ">") {
                if (firstatom != a1)
                    chain.bonds.push(plugin.addBond(a1, firstatom, 2, 1));
                break;
            }

            p.x += delta;
            a2 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.AA, ss[i], renamedmonomers);

            if (a1 != null)
                chain.bonds.push(plugin.addBond(a1, a2, 2, 1));

            if (firstatom == null)
                firstatom = a2;

            a1 = a2;
            a1.bio.id = ++n;
        }

        return n;
    },

    /**
    * Split a RNA Combo (internal use)
    * @function splitCombo
    */
    splitCombo: function (s) {
        var ret = [];

        var m = null;
        var i = 0;
        while (i < s.length) {
            var c = s.substr(i, 1);
            if (c == '(') {
                if (i == 0)
                    throw "Invalid combo: " + s;
                var p = s.indexOf(')', i + 1);
                if (p <= i)
                    throw "Invalid combo: " + s;

                ret[ret.length - 1].base = s.substr(i + 1, p - i - 1);
                i = p;
            }
            else if (c == '[') {
                var p = s.indexOf(']', i + 1);
                if (p <= i)
                    throw "Invalid combo: " + s;
                ret.push({ symbol: s.substr(i, p - i + 1) });
                i = p;
            }
            else {
                ret.push({ symbol: c });
            }

            ++i;
        }

        return ret;
    },

    /**
    * Add RNA HELM string (internal use)
    * @function addHELMRNAs
    */
    addHELMRNAs: function (plugin, ss, chain, origin, renamedmonomers) {
        var n = 0;
        var a1 = null;
        var a2 = null;
        var m = plugin.jsd.m;
        var delta = org.helm.webeditor.bondscale * plugin.jsd.bondlength;
        var p = origin.clone();
        for (var i = 0; i < ss.length; ++i) {
            var s = ss[i];
            var combo = this.splitCombo(s);
            for (var k = 0; k < combo.length; ++k) {
                var c = combo[k];
                var m = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.SUGAR, c.symbol);
                if (m != null) {
                    // sugar
                    p.x += delta;
                    a2 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.SUGAR, c.symbol, renamedmonomers);
                    if (a1 != null)
                        chain.bonds.push(plugin.addBond(a1, a2, 2, 1));
                    a1 = a2;

                    if (!scil.Utils.isNullOrEmpty(c.base)) {
                        m = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.BASE, c.base);
                        if (m == null)
                            throw "Unknown base: " + c.base;

                        // base
                        a3 = this.addNode(plugin, chain, chain.bases, org.helm.webeditor.Interface.createPoint(p.x, p.y + delta), org.helm.webeditor.HELM.BASE, c.base, renamedmonomers);
                        plugin.addBond(a1, a3, 3, 1);
                        a3.bio.id = ++n;
                    }
                }
                else {
                    m = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.LINKER, c.symbol);
                    if (m != null) {
                        if (!scil.Utils.isNullOrEmpty(c.base))
                            throw "Base attached to Linker: " + s;
                        // linker
                        p.x += delta;
                        a2 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.LINKER, c.symbol, renamedmonomers);
                        chain.bonds.push(plugin.addBond(a1, a2, 2, 1));
                        a1 = a2;
                    }
                }
            }
        }

        return n;
    },

    /**
    * Add RNA sequence (internal use)
    * @function addRNAs
    */
    addRNAs: function (plugin, ss, chain, origin, sugar, linker) {
        var n = 0;

        if (scil.Utils.isNullOrEmpty(sugar))
            sugar = "R";
        if (scil.Utils.isNullOrEmpty(linker) || linker == "null")
            linker = "P";

        var firstatom = null;
        var a1 = null;
        var a2 = null;
        var m = plugin.jsd.m;
        var delta = org.helm.webeditor.bondscale * plugin.jsd.bondlength;
        var p = origin.clone();
        for (var i = 0; i < ss.length; ++i) {
            if (i == ss.length - 1 && ss[i] == ">") {
                if (firstatom != a1) {
                    // linker
                    p.x += delta;
                    var a0 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.LINKER, linker);
                    chain.bonds.push(plugin.addBond(a1, a0, 2, 1));

                    chain.bonds.push(plugin.addBond(a0, firstatom, 2, 1));
                }
                break;
            }

            // 1. linker
            if (a1 != null) {
                p.x += delta;
                var a0 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.LINKER, linker);
                chain.bonds.push(plugin.addBond(a1, a0, 2, 1));
                a1 = a0;
            }

            // 2. sugar
            p.x += delta;
            a2 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.SUGAR, sugar);
            if (a1 != null)
                chain.bonds.push(plugin.addBond(a1, a2, 2, 1));
            a1 = a2;

            if (firstatom == null)
                firstatom = a1;

            // 3. base
            a3 = this.addNode(plugin, chain, chain.bases, org.helm.webeditor.Interface.createPoint(p.x, p.y + delta), org.helm.webeditor.HELM.BASE, ss[i]);
            plugin.addBond(a1, a3, 3, 1);

            a3.bio.id = ++n;
        }

        return n;
    },

    /**
    * Compress a string using Pako (internal use)
    * @function compressGz
    */
    compressGz: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return null;

        if (typeof pako != "undefined") {
            try {
                var buf = pako.deflate(s, { gzip: true });
                return btoa(String.fromCharCode.apply(null, buf));
            }
            catch (e) {
            }
        }
        return null;
    },

    /**
    * Decompress a string using pako (internal use)
    * @function uncompressGz
    */
    uncompressGz: function (b64Data) {
        if (scil.Utils.isNullOrEmpty(b64Data))
            return null;

        if (typeof pako == "undefined")
            return null;

        try {
            var strData = atob(b64Data);
            var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
            var binData = new Uint8Array(charData);
            var data = pako.inflate(binData);
            return String.fromCharCode.apply(null, new Uint16Array(data));
        }
        catch (e) {
            return null;
        }
    }
};
