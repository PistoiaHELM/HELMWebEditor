/*******************************************************************************
* Copyright (C) 2018, The Pistoia Alliance
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
        // I#12164
        for (var i = 0; i < m.atoms.length; ++i) {
            var a = m.atoms[i];
            if (!org.helm.webeditor.isHelmNode(a) && !a.hidden)
                return null;
        }

        var ret = { chainid: { RNA: 0, PEPTIDE: 0, CHEM: 0, BLOB: 0, G: 0 }, sequences: {}, connections: [], chains: {}, pairs: [], groupatoms: [], groups: {}, annotations: {}, singletons: {}, ratios: {} };
        this.getHelm2(m, highlightselection, ret);

        for (var k in ret.chains) {
            var chain = ret.chains[k];
            var a = chain[0];
            if (chain.length == 1 && a.biotype() == org.helm.webeditor.HELM.BLOB && !scil.Utils.isNullOrEmpty(a.tag))
                chain.annotation = a.tag;
        }

        for (var k in ret.groups) {
            if (ret.groups[k].length == 1)
                ret.singletons[k] = ret.groups[k][0];
        }

        for (var k in ret.singletons)
            delete ret.groups[k];

        return this.getHelmString(ret, highlightselection);
    },

    getHelm2: function (m, highlightselection, ret, groupatom) {
        var branches = {};
        var chains = org.helm.webeditor.Chain.getChains(m, branches);

        for (var i = 0; i < m.atoms.length; ++i)
            m.atoms[i]._aaid = null;

        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];
            chain.getHelm(ret, highlightselection, m, groupatom);
        }

        for (var i = 0; i < branches.atoms.length; ++i) {
            var a = branches.atoms[i];
            if (a.biotype() == org.helm.webeditor.HELM.CHEM) {
                var id = "CHEM" + (++ret.chainid.CHEM);
                ret.sequences[id] = this.getCode(a, highlightselection);
                ret.chains[id] = [a];
                a._aaid = 1;
            }
            else if (a.biotype() == org.helm.webeditor.HELM.BLOB) {
                var id;
                if (a.elem == "Group") {
                    id = "G" + (++ret.chainid.G);
                    this.getGroupHelm(ret, id, a, highlightselection);
                }
                else {
                    id = "BLOB" + (++ret.chainid.BLOB);
                    ret.sequences[id] = this.getCode(a, highlightselection);
                }
                ret.chains[id] = [a];
                a._aaid = 1;
            }
            else {
                // error
                return null;
            }
        }

        var groups = [];
        for (var i = 0; i < m.graphics.length; ++i) {
            var g = JSDraw2.Group.cast(m.graphics[i]);
            if (g != null)
                groups.push(g);
        }

        for (var i = 0; i < groups.length; ++i) {
            var g = groups[i];
            if (scil.Utils.isNullOrEmpty(g.tag))
                continue;

            for (var c in ret.chains) {
                if (this.allBelongToGroup(ret.chains[c], g)) {
                    ret.chains[c].annotation = g.tag;
                    break;
                }
            }
        }

        for (var id in ret.groupatoms) {
            var a = ret.groupatoms[id];
            for (var i = 0; i < groups.length; ++i) {
                var g = groups[i];
                if (g.a == a) {
                    groups.splice(i, 1);
                    this._scanGroup(ret, g, id);
                    break;
                }
            }
        }

        var groupids = [];
        for (var i = 0; i < groups.length; ++i) {
            var g = groups[i];

            var prefix = "G";
            var id = prefix + (++ret.chainid[prefix]);
            groupids[i] = id;

            this._scanGroup(ret, g, id);
        }

        for (var i = 0; i < groups.length; ++i) {
            var g = groups[i];
            var combo = ret.groups[groupids[i]];
            if (combo == null)
                continue;

            for (var j = 0; j < groups.length; ++j) {
                var g2 = groups[j];
                if (g2.group == g) {
                    var id = groupids[j];
                    if (scil.Utils.indexOf(combo, id) < 0)
                        combo.push(id);
                }
            }

            for (var id in ret.groupatoms) {
                var a = ret.groupatoms[id];
                if (a.group == g) {
                    if (scil.Utils.indexOf(combo, id) < 0)
                        combo.push(id);
                    break;
                }
            }
        }

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
                ret.pairs.push(s + tag);
            }
            else {
                var c1 = this.findChainID(ret.chains, b.a1);
                var c2 = this.findChainID(ret.chains, b.a2);
                this.addConnection(ret, c1, c2, b.a1, b.a2, b.r1, b.r2, b.ratio1, b.ratio2, b.tag, highlightselection && b.selected);
            }
        }
    },

    _scanGroup: function (ret, g, id) {
        var combo = [];
        for (var c in ret.chains) {
            if (this.allBelongToGroup(ret.chains[c], g)) {
                combo.push(c);
                if (!scil.Utils.isNullOrEmpty(g.ratio))
                    ret.ratios[c] = g.ratio;
            }
        }

        ret.groups[id] = combo;
        ret.ratios[id] = g.ratio;
    },

    getGroupHelm: function (ret, id, a, highlightselection) {
        var existing = {};
        for (var k in ret.sequences)
            existing[k] = true;

        var m = a.superatom;
        if (a.hidden) {
            ret.groupatoms[id] = a;
        }
        else {
            this.getHelm2(m, highlightselection, ret, a);

            var combo = [];
            for (var k in ret.sequences) {
                if (!existing[k])
                    combo.push(k); //{ chain: k, ratio: a.ratio });
            }

            ret.groups[id] = combo;
        }
    },

    addConnection: function (ret, c1, c2, a1, a2, r1, r2, ratio1, ratio2, tag, h) {
        ret.connections.push({ c1: c1, c2: c2, ai1: a1._aaid, ai2: a2._aaid, r1: r1, r2: r2, ratio1: ratio1, ratio2: ratio2, tag: tag, h: h });
    },

    renderConnection: function (ret, conn) {
        // if it is G1(PEPTID1), then directly use PEPTIDE1, and not G1
        if (ret.singletons[conn.c1] != null) {
            conn.c1 = ret.singletons[conn.c1];
            if (conn.ai1 > 0)
                conn.ai1 = "?";
        }
        if (ret.singletons[conn.c2] != null) {
            conn.c2 = ret.singletons[conn.c2];
            if (conn.ai2 > 0)
                conn.ai2 = "?";
        }

        var c = conn.c1 + "," + conn.c2;
        c += "," + org.helm.webeditor.IO.connectionStr(conn.ai1, conn.r1, conn.ai2, conn.r2);

        if (!scil.Utils.isNullOrEmpty(conn.tag))
            c += '\"' + conn.tag.replace(/"/g, "\\\"") + '\"';

        if (conn.h)
            c = "<span style='background:#bbf;'>" + c + "</span>";
        return c;
    },

    connectionStr: function (aaid1, r1, aaid2, r2) {
        return this.rStr(aaid1, r1) + "-" + this.rStr(aaid2, r2);
    },

    rStr: function (aaid, r) {
        if (typeof (r) == "string" && r.indexOf(':') > 0)
            return r;

        var s = aaid + ":";
        if (r == "*" || r == "?")
            return s + r;
        return s + "R" + r;
    },

    allBelongToGroup: function (atoms, g) {
        for (var i = 0; i < atoms.length; ++i) {
            if (atoms[i].group != g)
                return false;
        }
        return true;
    },

    getHelmString: function (ret, highlightselection) {
        var s = "";
        var keys = [];
        for (var k in ret.sequences)
            keys.push(k);
        keys.sort();
        for (var i = 0; i < keys.length; ++i) {
            var k = keys[i];
            s += (s == "" ? "" : "|") + k + "{" + ret.sequences[k] + "}";
            var chain = ret.chains[k];
            if (chain != null && !scil.Utils.isNullOrEmpty(chain.annotation))
                s += this.wrapAnnotation(chain.annotation);
        }

        if (s == "")
            return s;

        var count = 0;

        s += "$";
        var groups = [];
        for (var i = 0; i < ret.connections.length; ++i) {
            var c = ret.connections[i];
            s += (++count > 1 ? "|" : "") + this.renderConnection(ret, c);
            if ((c.ratio1 > 0 || c.ratio1 == "?") && (c.ratio2 > 0 || c.ratio1 == "?")) {
                var s2 = c.c1 + ":" + c.ratio1 + "+" + c.c2 + ":" + c.ratio2;
                id = "G" + (++ret.chainid.G);
                groups.push(id + "(" + s2 + ")");
            }
        }
        for (var i = 0; i < ret.pairs.length; ++i)
            s += (++count > 1 ? "|" : "") + ret.pairs[i];

        s += "$";
        var list = [];
        for (var id in ret.groups) {
            var s2 = "";
            var list = ret.groups[id];
            for (var i = 0; i < list.length; ++i) {
                var c = list[i];
                if (ret.singletons[c] != null)
                    c = ret.singletons[c];
                var ratio = ret.ratios[c];
                var separator = ret.ratios[id] == "or" ? "," : "+";
                s2 += (i > 0 ? separator : "") + c + (scil.Utils.isNullOrEmpty(ratio) ? "" : ":" + ratio);
            }
            groups.push(id + "(" + s2 + ")");
        }
        for (var i = 0; i < groups.length; ++i)
            s += (i > 0 ? "|" : "") + groups[i];

        s += "$";

        //RNA1{R(C)P.R(A)P.R(T)}$$$RNA1{ss}$
        var ann = scil.Utils.json2str(ret.annotations, null, true);
        s += ann == "null" || ann == "{}" ? "" : ann;

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
        var blob = false;
        if (typeof (a) == "object" && a.biotype() == org.helm.webeditor.HELM.BLOB) {
            blob = true;
            if (a.elem == "Group") {
                s = "Group";
            }
            else {
                s = a.bio != null && scil.Utils.isNullOrEmpty(a.bio.blobtype) ? "" : a.bio.blobtype;
            }
        }
        else {
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
                s = a.bio.ambiguity == null ? "?" : a.bio.ambiguity;
            else if (s.length > 1)
                s = "[" + s + "]";
        }

        if (!blob)
            s += this.wrapAnnotation(a.tag);

        if (bracket)
            s = "(" + s + ")";
        if (highlightselection && a.selected)
            s = "<span style='background:#bbf;'>" + s + "</span>";
        return s;
    },

    wrapAnnotation: function (s) {
        if (!scil.Utils.isNullOrEmpty(s))
            return '\"' + s.replace(/"/g, "\\\"") + '\"';
        return "";
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
            if (/^((RNA)|(PEPTIDE)|(CHEM)|(BLOB))[0-9]+/.test(s2))
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

        var gi = 100;
        var groups = {};
        var groupannotations = {};

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
                else if (type == "BLOB")
                    n2 = this.addBlob(plugin, s, chain, origin, renamedmonomers, e.tag);

                if (n2 > 0) {
                    n += n2;
                    origin.y += 4 * plugin.jsd.bondlength;
                }

                if (!scil.Utils.isNullOrEmpty(e.tag) && groups[sid] == null) {
                    ++gi;
                    var g = "G" + gi;
                    sections[2] += "|" + g + "(" + sid + ")";
                    groups[sid] = g;
                    groupannotations[g] = e.tag;
                }
            }
        }

        // hydrogenpairs
        var hydrogenpairs = [];
        var connections = [];
        var connatoms = {};

        s = sections[1];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var ss = s == "" ? [] : this.split(s, '|');
            // RNA1,RNA1,1:R1-21:R2
            for (var i = 0; i < ss.length; ++i) {
                if (ss[i].indexOf("pair") > 0) {
                    hydrogenpairs.push(ss[i]);
                    continue;
                }

                var e = this.detachAnnotation(ss[i]);
                var c = this.parseConnection(e.str);
                if (c == null)
                    continue;

                if (isNaN(c.a1) && !/^G[0-9]+$/.test(c.chain1) && !scil.Utils.startswith(c.chain1, "BLOB")) {
                    // create group
                    if (groups[c.chain1] == null) {
                        ++gi;
                        var g = "G" + gi;
                        sections[2] += "|" + g + "(" + c.chain1 + ")";
                        groups[c.chain1] = g;
                    }
                    c.chain1 = groups[c.chain1];
                }
                if (isNaN(c.a2) && !/^G[0-9]+$/.test(c.chain2) && !scil.Utils.startswith(c.chain2, "BLOB")) {
                    // create group
                    if (groups[c.chain2] == null) {
                        ++gi;
                        var g = "G" + gi;
                        sections[2] += "|" + g + "(" + c.chain2 + ")";
                        groups[c.chain2] = g;
                    }
                    c.chain2 = groups[c.chain2];
                }

                c.tag = e.tag;
                connections.push(c);
                connatoms[c.chain1] = true;
                connatoms[c.chain2] = true;
            }
        }

        // groups, pairs, hydrogen bonds
        // RNA1,RNA2,2:pair-9:pair|RNA1,RNA2,5:pair-6:pair|RNA1,RNA2,8:pair-3:pair
        s = sections[2];
        var bondratios = [];
        if (!scil.Utils.isNullOrEmpty(s)) {
            var ss = s == "" ? [] : this.split(s, '|');
            for (var i = 0; i < ss.length; ++i) {
                if (scil.Utils.endswith(ss[i], ")") && /^[G|g][0-9]+[\(]/.test(ss[i])) {
                    // group
                    var p = ss[i].indexOf('(');
                    var c = ss[i].substr(p + 1, ss[i].length - p - 2);
                    var id = ss[i].substr(0, p);
                    if (connatoms[id] != null) {
                        var chain = this.createGroupForChains(plugin, chains, id, c);
                        if (chain != null)
                            chains[id] = chain;
                    }
                    else if (!this.parseBondRatios(bondratios, c)) { // bond ratio
                        // then group
                        var chain = this.createGroupForChains(plugin, chains, id, c, groupannotations[id]);
                        if (chain != null && chain.atoms.length == 1)
                            plugin.groupExpand(chain.atoms[0]);
                    }
                }
                else {
                    // pair
                    hydrogenpairs.push(ss[i]);
                }
            }
        }

        for (var i = 0; i < hydrogenpairs.length; ++i) {
            // pair
            var c = this.parseConnection(hydrogenpairs[i]);
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

        // connection
        for (var i = 0; i < connections.length; ++i) {
            var c = connections[i];
            if (c == null || chains[c.chain1] == null || chains[c.chain2] == null)
                continue; //error

            if (groups[c.chain1] != null)
                c.chain1 = groups[c.chain1];
            if (groups[c.chain2] != null)
                c.chain2 = groups[c.chain2];

            var chain1 = chains[c.chain1];
            var chain2 = chains[c.chain2];
            var atom1, atom2;
            var a1 = parseInt(c.a1);
            var a2 = parseInt(c.a2);
            if (a1 > 0 && !scil.Utils.startswith(c.chain1, "G") && !scil.Utils.startswith(c.chain1, "BLOB")) {
                atom1 = chain1.getAtomByAAID(c.a1);
            }
            else {
                atom1 = chain1.atoms[0];
                c.r1 = c.a1 + ":" + c.r1;
            }
            if (a2 > 0 && !scil.Utils.startswith(c.chain2, "G") && !scil.Utils.startswith(c.chain2, "BLOB")) {
                atom2 = chain2.getAtomByAAID(c.a2);
            }
            else {
                atom2 = chain2.atoms[0];
                c.r2 = c.a2 + ":" + c.r2;
            }
            if (atom1 == null || atom2 == null)
                continue; //error

            if (c.r1 == null || c.r2 == null)
                continue; // error
            var r1 = scil.Utils.startswith(c.r1, "R") ? parseInt(c.r1.substr(1)) : c.r1;
            var r2 = scil.Utils.startswith(c.r2, "R") ? parseInt(c.r2.substr(1)) : c.r2;
            var b = plugin.addBond(atom1, atom2, r1, r2);
            if (b != null) {
                b.tag = c.tag;
                var bondratio = this.findBondRatio(bondratios, groups, c.chain1, c.chain2);
                if (bondratio != null) {
                    b.ratio1 = bondratio.ratio1 != null ? bondratio.ratio1 : org.helm.webeditor.defaultbondratio;
                    b.ratio2 = bondratio.ratio2 != null ? bondratio.ratio2 : org.helm.webeditor.defaultbondratio;
                }
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

    findBondRatio: function (bondratios, groups, c1, c2) {
        for (var i = 0; i < bondratios.length; ++i) {
            var r = bondratios[i];
            var a1 = r.c1;
            var a2 = r.c2;
            if (groups[a1] != null)
                a1 = groups[a1];
            if (groups[a2] != null)
                a2 = groups[a2];

            if (a1 == c1 && a2 == c2)
                return { ratio1: r.ratio1, ratio2: r.ratio2 };
            else if (a1 == c2 && a2 == c1)
                return { ratio1: r.ratio2, ratio2: r.ratio1 };
        }
        return null;
    },

    parseBondRatios: function (bondratios, s) {
        var p = s.indexOf('+');
        if (p < 0)
            p = s.indexOf(',');
        if (p <= 0)
            return false;

        var ret = {};
        var s1 = s.substr(0, p);
        var s2 = s.substr(p + 1);

        p = s1.indexOf(':');
        if (p > 0) {
            ret.c1 = s1.substr(0, p);
            ret.ratio1 = s1.substr(p + 1);
        }
        else {
            ret.c1 = s1;
        }

        p = s2.indexOf(':');
        if (p > 0) {
            ret.c2 = s2.substr(0, p);
            ret.ratio2 = s2.substr(p + 1);
        }
        else {
            ret.c2 = s2;
        }

        bondratios.push(ret);
        return true;
    },

    createGroupForChains: function (plugin, chains, chainid, c, tag) {
        var logic = null;
        var ss = this.splitString(c, "+");
        if (ss.length > 1) {
            logic = "and";
        }
        else {
            ss = this.splitString(c, ",");
            if (ss.length > 1)
                logic = "or";
        }

        var allatoms = [];
        var atom = null;
        for (var i = 0; i < ss.length; ++i) {
            var ratio = null;

            var s = ss[i];
            var p = s.indexOf(':');
            if (p > 0) {
                ratio = s.substr(p + 1);
                s = s.substr(0, p);
            }

            var chain = chains[s];
            if (chain == null)
                continue; // error

            var atoms = [];
            for (var k = 0; k < chain.atoms.length; ++k) {
                atoms.push(chain.atoms[k]);
                if (chain.bases[k] != null)
                    atoms.push(chain.bases[k]);
            }

            //allatoms = allatoms.concat(atoms);
            var g2 = plugin.createGroup2(atoms, false);
            if (g2 != null) {
                g2.ratio = ratio;
                g2.tag = tag;

                var a2 = plugin.collapseGroup(g2);
                a2._aaid = 1;
                allatoms.push(a2);

                atom = a2;
            }
        }

        if (allatoms.length > 1) {
            var g = plugin.createGroup2(allatoms, false);
            if (g == null)
                return null;

            g.ratio = logic;
            g.tag = tag;
            atom = plugin.collapseGroup(g);
            atom._aaid = 1;
        }

        var chain = new org.helm.webeditor.Chain(ss[chainid]);
        chain.atoms.push(atom);
        return chain;
    },

    splitString: function (s, separators) {
        var ret = [];
        var w = "";
        for (var i = 0; i < s.length; ++i) {
            var c = s.substr(i, 1);
            if (separators.indexOf(c) >= 0) {
                ret.push(w);
                w = "";
            }
            else {
                w += c;
            }
        }

        if (ret.length == 0 || w.length > 0)
            ret.push(w);
        return ret;
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
        var braces = 0;
        var quote = 0;
        for (var i = 0; i < s.length; ++i) {
            var c = s.substr(i, 1);
            if (c == sep && bracket == 0 && parentheses == 0 && braces == 0 && quote == 0) {
                ret.push(frag);
                frag = "";
            }
            else {
                frag += c;
                if (quote > 0) {
                    if (c == '\\' && i + 1 < s.length) {
                        ++i;
                        var c2 = s.substr(i, 1);
                        frag += c2;
                        c += c2;
                    }
                }

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
                else if (c == '{')
                    ++braces;
                else if (c == '}')
                    --braces;
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

        return { chain1: tt[0], chain2: tt[1], a1: c1[0], r1: c1[1], a2: c2[0], r2: c2[1] };
        //return { chain1: tt[0], chain2: tt[1], a1: parseInt(c1[0]), r1: c1[1], a2: parseInt(c2[0]), r2: c2[1] };
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
        var ret = this._detachAppendix(s, '\"');
        if (ret.tag != null)
            return ret;

        var r = this._detachAppendix(s, '\'');
        return { tag: ret.tag, repeat: r.tag, str: r.str };
    },

    _detachAppendix: function (s, c) {
        var tag = null;
        if (scil.Utils.endswith(s, c)) {
            var p = s.length - 1;
            while (p > 0) {
                p = s.lastIndexOf(c, p - 1);
                if (p <= 0 || s.substr(p - 1, 1) != '\\')
                    break;
            }

            if (p > 0 && p < s.length - 1) {
                tag = s.substr(p + 1, s.length - p - 2);
                s = s.substr(0, p);
            }
        }
        if (tag != null)
            tag = tag.replace(new RegExp("\\" + c, "g"), c);
        return { tag: this.unescape(tag), str: s };
    },

    unescape: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return s;

        return s.replace(/[\\]./g, function (m) {
            switch (m) {
                case "\\r":
                    return "\r";
                case "\\n":
                    return "\n";
                case "\\t":
                    return "\t";
                default:
                    return m.substr(1);
            }
        });
    },

    escape: function (s) {
        if (scil.Utils.isNullOrEmpty(s))
            return s;

        return s.replace(/[\"|\'|\\|\r|\n|\t]/g, function (m) {
            switch (m) {
                case "\r":
                    return "\\r";
                case "\n":
                    return "\\n";
                case "\t":
                    return "\\t";
                default:
                    return "\\" + m;
            }
        });
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
    * Add a BLOB node (internal use)
    * @function addBlob
    */
    addBlob: function (plugin, name, chain, origin, renamedmonomers, annotation) {
        var e = this.detachAnnotation(name);
        var a = this.addNode(plugin, chain, chain.atoms, origin.clone(), org.helm.webeditor.HELM.BLOB, "Blob", renamedmonomers);
        a.bio.blobtype = e.str == "Blob" || e.str == "[Blob]" ? null : e.str;
        if (!scil.Utils.isNullOrEmpty(a.tag))
            a.tag = e.tag;
        else if (!scil.Utils.isNullOrEmpty(annotation))
            a.tag = annotation;
        return 1;
    },

    /**
    * Add Amino Acid (internal use)
    * @function addAAs
    */
    addAAs: function (plugin, ss, chain, origin, renamedmonomers) {
        var mol = plugin.jsd.m;
        var loop = { n: 0, firstatom: null, a1: null, a2: null, p: origin.clone(), delta: org.helm.webeditor.bondscale * plugin.jsd.bondlength };
        for (var i = 0; i < ss.length; ++i) {
            if (i == ss.length - 1 && ss[i] == ">") {
                if (loop.firstatom != loop.a1)
                    chain.bonds.push(plugin.addBond(loop.a1, loop.firstatom, 2, 1));
                break;
            }

            var e = this.detachAnnotation(ss[i]);
            if (scil.Utils.startswith(e.str, "(") && scil.Utils.endswith(e.str, ")")) {
                // dealing with repeat: PEPTIDE1{S.(D.F)'2-13'.A.S.D.F}$$$$V2.0
                var atoms = [];
                var rect = new JSDraw2.Rect(loop.p.x + loop.delta / 2, loop.p.y - loop.delta, 0, loop.delta * 2);

                var ss2 = this.splitChars(e.str.substr(1, e.str.length - 2), '.');
                if (ss2.length == 1) {
                    atoms.push(this._addOneAA(plugin, chain, e.str, null, renamedmonomers, loop));
                }
                else {
                    for (var k = 0; k < ss2.length; ++k)
                        atoms.push(this._addOneAA(plugin, chain, ss2[k], null, renamedmonomers, loop));
                }

                if (!scil.Utils.isNullOrEmpty(e.repeat)) {
                    rect.width = loop.p.x + loop.delta / 2 - rect.left;
                    var br = new JSDraw2.Bracket(null, rect);
                    br.atoms = atoms;
                    mol.addGraphics(br);
                    br.createSubscript(mol, e.repeat);
                }
            }
            else {
                this._addOneAA(plugin, chain, e.str, e.tag, renamedmonomers, loop);
            }
        }

        return loop.n;
    },

    _addOneAA: function (plugin, chain, s, tag, renamedmonomers, loop) {
        loop.p.x += loop.delta;
        var a = this.addNode(plugin, chain, chain.atoms, loop.p.clone(), org.helm.webeditor.HELM.AA, s, renamedmonomers);
        loop.a2 = a;
        loop.a2.tag = tag;

        if (loop.a1 != null)
            chain.bonds.push(plugin.addBond(loop.a1, loop.a2, 2, 1));

        if (loop.firstatom == null)
            loop.firstatom = loop.a2;

        loop.a1 = loop.a2;
        loop.a1.bio.id = ++loop.n;
        return a;
    },

    /**
    * Add RNA HELM string (internal use)
    * @function addHELMRNAs
    */
    addHELMRNAs: function (plugin, ss, chain, origin, renamedmonomers) {
        var mol = plugin.jsd.m;
        var loop = { n: 0, count: 0, firstatom: null, a1: null, a2: null, a3: null, p: origin.clone(), delta: org.helm.webeditor.bondscale * plugin.jsd.bondlength };
        for (var i = 0; i < ss.length; ++i) {
            var e = this.detachAnnotation(ss[i]);
            if (scil.Utils.startswith(e.str, "(") && scil.Utils.endswith(e.str, ")")) {
                var atoms = [];
                var rect = new JSDraw2.Rect(loop.p.x + loop.delta / 2, loop.p.y - loop.delta, 0, loop.delta * 3);

                var ss2 = this.splitChars(e.str.substr(1, e.str.length - 2), '.');
                for (var k = 0; k < ss2.length; ++k)
                    this._addOneHELMRNA(plugin, chain, ss2[k], renamedmonomers, loop, atoms);

                if (!scil.Utils.isNullOrEmpty(e.repeat)) {
                    rect.width = loop.p.x + loop.delta / 2 - rect.left;
                    var br = new JSDraw2.Bracket(null, rect);
                    br.atoms = atoms;
                    mol.addGraphics(br);
                    br.createSubscript(mol, e.repeat);
                }
            }
            else {
                this._addOneHELMRNA(plugin, chain, ss[i], renamedmonomers, loop, []);
            }
        }

        return loop.count;
    },

    _addOneHELMRNA: function (plugin, chain, s, renamedmonomers, loop, atoms) {
        var combo = this.splitCombo(s);
        for (var k = 0; k < combo.length; ++k) {
            var c = combo[k];
            var m = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.SUGAR, c.symbol);
            if (m != null) {
                // sugar
                loop.p.x += loop.delta;
                loop.a2 = this.addNode(plugin, chain, chain.atoms, loop.p.clone(), org.helm.webeditor.HELM.SUGAR, c.symbol, renamedmonomers);
                if (loop.a1 != null)
                    chain.bonds.push(plugin.addBond(loop.a1, loop.a2, 2, 1));
                loop.a1 = loop.a2;

                if (!scil.Utils.isNullOrEmpty(c.base)) {
                    // base
                    loop.a3 = this.addNode(plugin, chain, chain.bases, org.helm.webeditor.Interface.createPoint(loop.p.x, loop.p.y + loop.delta), org.helm.webeditor.HELM.BASE, c.base, renamedmonomers);
                    plugin.addBond(loop.a1, loop.a3, 3, 1);
                    loop.a3.bio.id = ++loop.n;
                    ++loop.count;

                    atoms.push(loop.a3);
                }
            }
            else {
                if (!scil.Utils.isNullOrEmpty(c.base))
                    throw "Base attached to Linker: " + s;

                // linker
                var biotype = s == "*" ? org.helm.webeditor.HELM.NUCLEOTIDE : org.helm.webeditor.HELM.LINKER;
                loop.p.x += loop.delta;
                loop.a2 = this.addNode(plugin, chain, chain.atoms, loop.p.clone(), biotype, c.symbol, renamedmonomers);
                chain.bonds.push(plugin.addBond(loop.a1, loop.a2, 2, 1));
                loop.a1 = loop.a2;
                ++loop.count;
            }

            atoms.push(loop.a1);
            loop.a1.tag = c.tag;
        }
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

                if (ret[ret.length - 1].base == null)
                    ret[ret.length - 1].base = s.substr(i + 1, p - i - 1);
                else
                    ret.push({ symbol: s.substr(i, p - i + 1) });

                i = p;
            }
            else if (c == '[') {
                var p = s.indexOf(']', i + 1);
                if (p <= i)
                    throw "Invalid combo: " + s;
                ret.push({ symbol: s.substr(i, p - i + 1) });
                i = p;
            }
            else if (c == '\"') {
                var p = s.indexOf('\"', i + 1);
                if (p <= i)
                    throw "Invalid combo: " + s;
                ret[ret.length - 1].tag = s.substr(i + 1, p - i - 1);
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
