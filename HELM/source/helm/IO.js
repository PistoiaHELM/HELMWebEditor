//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* IO class
* @class org.helm.webeditor.IO
*/
org.helm.webeditor.IO = {
    getHelm: function (m, highlightselection) {
        var branches = {};
        var chains = org.helm.webeditor.Chain.getChains(m, branches);

        for (var i = 0; i < m.atoms.length; ++i)
            m.atoms[i]._aaid = null;

        var ret = { chainid: { RNA: 0, PEPTIDE: 0, CHEM: 0 }, sequences: {}, connections: [], chains: {}, annotations: [] };
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
            if (b.type == JSDraw2.BONDTYPES.UNKNOWN) {
                var c1 = this.findChainID(ret.chains, b.a1);
                var c2 = this.findChainID(ret.chains, b.a2);
                var s = c1 + "," + c2 + "," + b.a1._aaid + ":pair-" + b.a2._aaid + ":pair";
                pairs.push(s);
            }
            else {
                var c1 = this.findChainID(ret.chains, b.a1);
                var c2 = this.findChainID(ret.chains, b.a2);
                var s = c1 + "," + c2 + "," + b.a1._aaid + ":R" + b.r1 + "-" + b.a2._aaid + ":R" + b.r2;
                ret.connections.push(s);
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
        for (var i = 0; i < ret.annotations.length; ++i)
            s += (i > 0 ? "|" : "") + ret.annotations[i];

        s += "$";
        return s;
    },

    getSequence: function(m, highlightselection) {
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

    getCode: function (a, highlightselection, bracket) {
        var s = typeof(a) == "string" ? a : a.elem;
        if (s.length > 1)
            s = "[" + s + "]";
        if (bracket)
            s = "(" + s + ")";
        if (highlightselection && a.selected)
            s = "<span style='background:#bbf;'>" + s + "</span>";
        return s;
    },

    findChainID: function (chains, a) {
        for (var k in chains) {
            var atoms = chains[k];
            if (scil.Utils.indexOf(atoms, a) >= 0)
                return k;
        }
        return null;
    },

    read: function (plugin, s, format, renamedmonomers, sugar, linker) {
        if (scil.Utils.isNullOrEmpty(s))
            return 0;

        if (scil.Utils.isNullOrEmpty(format)) {
            if (/^((RNA)|(PEPTIDE)|(CHEM))[0-9]+/.test(s))
                format = "HELM";
            else if (/^[A|G|T|C|U]+[>]?$/.test(s))
                format = "RNA";
            else if (/^[A|C-I|K-N|P-T|V|W|Y|Z]+[>]?$/.test(s))
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
            var ss = this.splitChars(s);
            return this.addAAs(plugin, ss, chain, origin);
        }
        else if (format == "RNA") {
            var chain = new org.helm.webeditor.Chain();
            var ss = this.splitChars(s);
            return this.addRNAs(plugin, ss, chain, origin, sugar, linker);
        }

        return 0;
    },

    parseHelm: function (plugin, s, origin, renamedmonomers) {
        var n = 0;
        var p = s.indexOf("$");
        var conn = s.substr(p + 1);

        // sequence
        s = s.substr(0, p);
        var chains = {};
        var seqs = s.split('|');
        for (var i = 0; i < seqs.length; ++i) {
            s = seqs[i];
            p = s.indexOf("{");
            var sid = s.substr(0, p);
            var type = sid.replace(/[0-9]+$/, "");
            var id = parseInt(sid.substr(type.length));

            var chain = new org.helm.webeditor.Chain(sid);
            chains[sid] = chain;
            chain.type = type;

            s = s.substr(p + 1);
            p = s.indexOf('}');
            s = s.substr(0, p);

            var n2 = 0;
            var ss = s.split('.');
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

        // connection
        var remained = null;
        p = conn.indexOf("$");
        if (p >= 0) {
            s = conn.substr(0, p);
            remained = conn.substr(p + 1);
            var ss = s == "" ? [] : s.split('|');

            // RNA1,RNA1,1:R1-21:R2
            for (var i = 0; i < ss.length; ++i) {
                var c = this.parseConnection(ss[i]);
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
                plugin.addBond(atom1, atom2, r1, r2);
            }
        }

        // pairs, hydrogen bonds
        // RNA1,RNA2,2:pair-9:pair|RNA1,RNA2,5:pair-6:pair|RNA1,RNA2,8:pair-3:pair
        p = remained == null ? -1 : remained.indexOf("$");
        if (p >= 0) {
            s = remained.substr(0, p);
            remained = remained.substr(p + 1);
            var ss = s == "" ? [] : s.split("|");
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
        p = remained == null ? -1 : remained.indexOf("$");
        if (p >= 0) {
            s = remained.substr(0, p);
            remained = remained.substr(p + 1);

            var ss = s == "" ? [] : s.split("|");
            for (var i = 0; i < ss.length; ++i) {
                var s = ss[i];
                p = s.indexOf("{");
                var chn = s.substr(0, p);
                s = s.substr(p);
                if (s == "{ss}" || s == "{as}")
                {
                    var chain = chains[chn];
                    if (chain != null && chain.type == "RNA")
                        chain.atoms[0].bio.annotation = "5'" + s.substr(1, s.length - 2);
                }
            }
        }

        return n;
    },

    parseConnection: function(s) {
        var tt = s.split(',');
        if (tt.length != 3)
            return null; // error

        var tt2 = tt[2].split('-');
        if (tt2.length != 2)
            return null;// error

        var c1 = tt2[0].split(':');
        var c2 = tt2[1].split(':');
        if (c1.length != 2 || c2.length != 2)
            return null;// error

        return { chain1: tt[0], chain2: tt[1], a1: parseInt(c1[0]), r1: c1[1], a2: parseInt(c2[0]), r2: c2[1] };
    },

    splitChars: function (s) {
        var ss = [];
        for (var i = 0; i < s.length; ++i)
            ss.push(s.substr(i, 1));
        return ss;
    },

    trimBracket: function(s) {
        if (s != null && scil.Utils.startswith(s, "[") && scil.Utils.endswith(s, "]"))
            return  s.substr(1, s.length - 2);
        return s;
    },

    getRenamedMonomer: function(type, elem, monomers) {
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

    addNode: function (plugin, chain, atoms, p, type, elem, renamedmonomers) {
        a2 = plugin.addNode(p, type, this.getRenamedMonomer(type, elem, renamedmonomers));
        if (a2 == null)
            throw "";

        atoms.push(a2);
        a2._aaid = chain.atoms.length + chain.bases.length;
        return a2;
    },

    addChem: function (plugin, name, chain, origin, renamedmonomers) {
        this.addNode(plugin, chain, chain.atoms, origin.clone(), org.helm.webeditor.HELM.CHEM, name, renamedmonomers);
        return 1;
    },

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

    addHELMRNAs: function (plugin, ss, chain, origin, renamedmonomers) {
        var n = 0;
        var a1 = null;
        var a2 = null;
        var m = plugin.jsd.m;
        var delta = org.helm.webeditor.bondscale * plugin.jsd.bondlength;
        var p = origin.clone();
        for (var i = 0; i < ss.length; ++i) {
            var s = ss[i];
            var sugar = null;
            var base = null;
            var linker = null;

            // handle all cases:
            // RNA1{RP.[fR]P.[fR](A)P.[fR](A)}$$$$
            // RNA1{R.P.[fR].P.[fR](A)P.[fR](A)}$$$$
            // RNA1{R()P.[fR]()P.[fR](A)P.[fR](A)}$$$$
            var k1 = s.indexOf('(');
            var k2 = s.indexOf(')');
            if (k1 >= 0 && k2 >= 0) {
                sugar = s.substr(0, k1);
                base = s.substr(k1 + 1, k2 - k1 - 1);
                linker = s.substr(k2 + 1);
            }
            else {
                if (s.substr(0, 1) == "[") {
                    var k = s.indexOf("]");
                    if (k > 0) {
                        sugar = s.substr(0, k + 1);
                        linker = s.substr(k + 1);
                    }
                    else {
                        sugar = s;
                    }
                }
                else {
                    sugar = s.substr(0, 1);
                    linker = s.substr(1);
                }
            }

            if (scil.Utils.isNullOrEmpty(base)) {
                if (scil.Utils.isNullOrEmpty(sugar) && !scil.Utils.isNullOrEmpty(linker)) {
                    if (org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.SUGAR, linker) != null) {
                        sugar = linker;
                        linker = null;
                    }
                } 
                else if (scil.Utils.isNullOrEmpty(linker) && !scil.Utils.isNullOrEmpty(sugar)) {
                    if (org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.LINKER, sugar) != null) {
                        linker = sugar;
                        sugar = null;
                    }
                }
            }

            // 1. sugar (Order does matter)
            if (!scil.Utils.isNullOrEmpty(sugar)) {
                p.x += delta;
                a2 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.SUGAR, sugar, renamedmonomers);
                if (a1 != null)
                    chain.bonds.push(plugin.addBond(a1, a2, 2, 1));
                a1 = a2;
            }

            // 2. base
            if (!scil.Utils.isNullOrEmpty(base)) {
                a3 = this.addNode(plugin, chain, chain.bases, org.helm.webeditor.Interface.createPoint(p.x, p.y + delta), org.helm.webeditor.HELM.BASE, base, renamedmonomers);

                plugin.addBond(a2, a3, 3, 1);
                a3.bio.id = ++n;
            }

            // 3. linker
            if (!scil.Utils.isNullOrEmpty(linker)) {
                p.x += delta;
                a0 = this.addNode(plugin, chain, chain.atoms, p.clone(), org.helm.webeditor.HELM.LINKER, linker, renamedmonomers);
                chain.bonds.push(plugin.addBond(a1, a0, 2, 1));
                a1 = a0;
            }
        }

        return n;
    },

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
