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
* Chain class
* @class org.helm.webeditor.Chain
*/
org.helm.webeditor.Chain = scil.extend(scil._base, {
    /**
    * Contructor of Chain
    * @constructor Chain
    */
    constructor: function (id) {
        this.id = id;
        this.bonds = [];
        this.atoms = [];
        this.basebonds = [];
        this.bases = [];
    },

    /**
    * Get the complementary of a given node
    * @function getComplementary
    * @param {Atom} a - the input Node
    */
    getComplementary: function (a) {
        var m = org.helm.webeditor.Monomers.getMonomer(a);
        switch (m.na) {
            case "A":
                return "T";
            case "G":
                return "C";
            case "T":
            case "U":
                return "A";
            case "C":
                return "G";
            default:
                return "U";
        }
    },

    /**
    * Create the complementary strand (internal use)
    * @function makeComplementaryStrand
    */
    makeComplementaryStrand: function (m, bondlength) {
        var ret = new org.helm.webeditor.Chain(null);

        var lasta2 = null;
        var lastsugar = null;
        var d = bondlength * org.helm.webeditor.bondscale;
        for (var i = 0; i < this.atoms.length; ++i) {
            var a = this.atoms[i];
            var b = this.bases[i];

            var a2 = a.clone();
            ret.atoms.splice(0, 0, a2);
            a2.p.y += 3 * d;
            a2.bio.annotation = null;
            m.addAtom(a2);
            if (b != null) {
                var b2 = b.clone();
                ret.bases.splice(0, 0, b2);
                b2.p.y += d;
                b2.elem = this.getComplementary(b);
                m.addAtom(b2);

                var bond = new JSDraw2.Bond(a2, b2);
                ret.basebonds.splice(0, 0, bond);
                bond.r1 = 3;
                bond.r2 = 1;
                m.addBond(bond);

                bond = new JSDraw2.Bond(b, b2, JSDraw2.BONDTYPES.UNKNOWN);
                m.addBond(bond);
            }
            else {
                ret.bases.splice(0, 0, null);
            }

            if (lasta2 != null) {
                var bond = new JSDraw2.Bond(lasta2, a2);
                ret.bonds.splice(0, 0, bond);
                bond.r1 = 1;
                bond.r2 = 2;
                m.addBond(bond);
            }

            lasta2 = a2;
            if (a2.biotype() == org.helm.webeditor.HELM.SUGAR) {
                lastsugar = a2;
                a2.elem = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.SUGAR);
            }
            else if (a2.biotype() == org.helm.webeditor.HELM.LINKER) {
                a2.elem = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.LINKER);
            }
        }

        if (lastsugar != null)
            lastsugar.bio.annotation = "5'";

        ret.resetIDs();
        return ret;
    },

    /**
    * Get separated polymer from this fragment(chain) (internal use)
    * @function _getPolymers
    */
    _getPolymers: function () {
        var ret = [];

        var polymer = null;
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var biotype = a.biotype();
            if (biotype == org.helm.webeditor.HELM.AA) {
                if (polymer != null && polymer.type != "Peptide")
                    polymer = null;

                if (polymer == null) {
                    polymer = { type: "Peptide", atoms: [] };
                    ret.push(polymer);
                }
                polymer.atoms.push(a);
            }
            else if (biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.HELM_LINKER) {
                if (polymer != null && polymer.type != "RNA")
                    polymer = null;

                if (biotype == org.helm.webeditor.HELM.SUGAR) {
                    var b = this.bases[i];
                    if (b != null) {
                        if (polymer == null) {
                            polymer = { type: "RNA", atoms: [] };
                            ret.push(polymer);
                        }
                        polymer.atoms.push(b);
                    }
                }
            }
            else {
                polymer = null;
            }
        }

        return ret;
    },

    /**
    * Get whole chain as an expanded molecule (internal use)
    * @function getMol
    */
    getMol: function (a, plugin) {
        var mon = org.helm.webeditor.Monomers.getMonomer(a);
        var molfile = org.helm.webeditor.monomers.getMolfile(mon);
        var m = org.helm.webeditor.Interface.createMol(molfile);

        if (plugin != null) {
            for (var r in mon.at) {
                if (plugin.hasSpareR(a, r))
                    org.helm.webeditor.MolViewer.capRGroup(m, r, mon);
            }
        }

        for (var i = 0; i < m.atoms.length; ++i)
            m.atoms[i]._helmgroup = a;

        return m;
    },

    /**
    * Expaned backbond (internal use)
    * @function _expandBackbone
    */
    _expandBackbone: function (mol, plugin) {
        var m1 = null;
        var m2 = null;
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var b = this.bases[i];

            a.f = true;
            m2 = this.getMol(a, plugin);

            if (b != null) {
                var m3 = this.getMol(b, plugin);
                org.helm.webeditor.MolViewer.mergeMol(m2, "R3", m3, "R1", a, b);
            }

            if (m1 == null) {
                m1 = m2;
            }
            else {
                var r1, r2;
                var a1, a2;
                var bond = this.bonds[i - 1];
                if (bond.a2 == a) {
                    r2 = bond.r2;
                    r1 = bond.r1;
                    a1 = bond.a1;
                    a2 = bond.a2;
                }
                else {
                    r2 = bond.r1;
                    r1 = bond.r2;
                    a1 = bond.a2;
                    a2 = bond.a1;
                }

                org.helm.webeditor.MolViewer.mergeMol(m1, "R" + r1, m2, "R" + r2, a1, a2);
            }
        }

        if (this.isCircle()) {
            var bond = this.bonds[n - 1];

            // circle
            var t = org.helm.webeditor.MolViewer.findR(m1, "R" + bond.r1, bond.a1);
            var s = org.helm.webeditor.MolViewer.findR(m1, "R" + bond.r2, bond.a2);
            if (t != null && s != null) {
                m1.atoms.splice(scil.Utils.indexOf(m1.atoms, t.a1), 1);
                m1.atoms.splice(scil.Utils.indexOf(m1.atoms, s.a1), 1);
                m1.bonds.splice(scil.Utils.indexOf(m1.bonds, s.b), 1);

                if (t.b.a1 == t.a1)
                    t.b.a1 = s.a0;
                else
                    t.b.a2 = s.a0;
            }
        }

        mol.atoms = mol.atoms.concat(m1.atoms);
        mol.bonds = mol.bonds.concat(m1.bonds);
    },

    /**
    * Connect branches to the backbone (internal use)
    * @function _connectBranches
    */
    _connectBranches: function (m, plugin, branches) {
        if (branches == null || branches.bonds == null)
            return;

        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            this._connectBranches2(m, a, branches, plugin);

            var b = this.bases[i];
            if (b != null)
                this._connectBranches2(m, b, branches, plugin);
        }
    },

    /**
    * Inner loop of connecting branches (internal use)
    * @function _connectBranches2
    */
    _connectBranches2: function (m, a, branches, plugin) {
        var r1 = null;
        var r2 = null;
        var a1 = null;
        var a2 = null;
        for (var i = 0; i < branches.bonds.length; ++i) {
            var b = branches.bonds[i];
            if (b == null)
                continue;

            if (b.a1 == a && !b.a2.f) {
                r1 = b.r1;
                r2 = b.r2;
                a1 = b.a1;
                a2 = b.a2;
            }
            else if (b.a2 == a && !b.a1.f) {
                r1 = b.r2;
                r2 = b.r1;
                a1 = b.a2;
                a2 = b.a1;
            }

            if (a2 != null) {
                b.f = true;
                break;
            }
        }

        if (a2 == null)
            return;

        var m2 = this.getMol(a2, plugin);
        org.helm.webeditor.MolViewer.mergeMol(m, "R" + r1, m2, "R" + r2, a, a2);
    },

    /**
    * Check if this chain is a circle
    * @function isCircle
    */
    isCircle: function () {
        return this.atoms.length >= 3 && this.atoms[0] == this.atoms[this.atoms.length - 1];
    },

    /**
    * Reset chain monomer IDs
    * @function resetIDs
    */
    resetIDs: function () {
        var aaid = 0;
        var baseid = 0;

        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var biotype = a.biotype();
            if (biotype == org.helm.webeditor.HELM.AA) {
                a.bio.id = ++aaid;
                if (aaid == 1)
                    a.bio.annotation = "n";
                else
                    a.bio.annotation = null;
                baseid = 0;
            }
            else if (biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.LINKER) {
                if (biotype == org.helm.webeditor.HELM.SUGAR && this.bases[i] != null) {
                    this.bases[i].bio.id = ++baseid;
                    if (baseid == 1) {
                        if (a.bio.annotation != "5'ss" && a.bio.annotation != "5'as")
                            a.bio.annotation = "5'";
                    }
                    else {
                        a.bio.annotation = null;
                    }
                }
                aaid = 0;
            }
            else {
                aaid = 0;
                baseid = 0;
            }
        }
    },

    /**
    * Set internal flags for all nodes and bonds (internal use)
    * @function setFlag
    */
    setFlag: function (f) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].f = f;
        for (var i = 0; i < this.bonds.length; ++i)
            this.bonds[i].f = f;
    },

    /**
    * Test if the chain contains a node (internal use)
    * @function containsAtom
    */
    containsAtom: function (a) {
        return scil.Utils.indexOf(this.atoms, a) != -1;
    },

    /**
    * Layout the chain as a line (internal use)
    * @function layoutLine
    */
    layoutLine: function (bondlength) {
        var rect = this.getRect();

        var delta = org.helm.webeditor.bondscale * bondlength;
        var a = this.atoms[0];
        a.p = org.helm.webeditor.Interface.createPoint(rect.left, rect.top);
        for (var i = 1; i < this.atoms.length; ++i) {
            var p = a.p;
            a = this.atoms[i];
            a.p = org.helm.webeditor.Interface.createPoint(p.x + delta, p.y);
        }
    },

    /**
    * Layout the chain as a circle (internal use)
    * @function layoutCircle
    */
    layoutCircle: function (bondlength) {
        org.helm.webeditor.Layout.layoutCircle(this.atoms, bondlength, 0);
        //var delta = org.helm.webeditor.bondscale * bondlength;
        //var deg = 360 / (this.atoms.length - 1);
        //var radius = (delta / 2) / Math.sin((deg / 2) * Math.PI / 180);

        //var a = this.atoms[0];
        //a.p = org.helm.webeditor.Interface.createPoint(origin.x + radius, origin.y);
        //for (var i = 1; i < this.atoms.length - 1; ++i)
        //    this.atoms[i].p = this.atoms[i - 1].p.clone().rotateAround(origin, -deg);
    },

    /**
    * Rotate chain (internal use)
    * @function rotate
    */
    rotate: function (deg, origin) {
        if (deg == 0)
            return;

        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            if (origin != null)
                this.atoms[i].p.rotateAround(origin, deg);
            else
                this.atoms[i].p.rotate(deg);

            var a = this.bases[i];
            if (a != null) {
                if (origin != null)
                    a.p.rotateAround(origin, deg);
                else
                    a.p.rotate(deg);
            }
        }
    },

    /**
    * Move chain's coordinates (internal use)
    * @function move
    */
    move: function (delta) {
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            this.atoms[i].p.offset2(delta);
            var a = this.bases[i];
            if (a != null)
                a.p.offset2(delta);
        }
    },

    /**
    * Layout bases in a RNA chain (internal use)
    * @function layoutBases
    */
    layoutBases: function () {
        var circle = this.isCircle();
        var n = circle ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.bases[i];
            if (a == null)
                continue;

            var center = this.atoms[i];
            var b1 = null;
            var b2 = null;
            if (i == 0) {
                if (circle)
                    b1 = this.bonds[this.bonds.length - 1];
                b2 = this.bonds[i];
            }
            else {
                b1 = this.bonds[i - 1];
                b2 = this.bonds[i];
            }

            if (b1 != null && b2 != null) {
                var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                var a2 = b2.a1 == center ? b2.a2 : b2.a1;

                var ang = center.p.angleAsOrigin(a1.p, a2.p);
                if (Math.abs(ang - 180) > 10)
                    a.p = a1.p.clone().rotateAround(center.p, 180 + ang / 2);
                else
                    a.p = a1.p.clone().rotateAround(center.p, -90);
            }
            else if (b1 != null) {
                var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                a.p = a1.p.clone().rotateAround(center.p, -90);
            }
            else if (b2 != null) {
                var a2 = b2.a1 == center ? b2.a2 : b2.a1;
                a.p = a2.p.clone().rotateAround(center.p, 90);
            }
        }
    },

    /**
    * Get the rectangle of the chain (internal use)
    * @function getRect
    */
    getRect: function () {
        return org.helm.webeditor.Layout.getRect(this.atoms);
    },

    /**
    * Get the sequence of natural analog of the chain
    * @function getSequence
    */
    getSequence: function (highlightselection) {
        var s = "";
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        var lastbt = null;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var bt = a.biotype();
            if (bt == org.helm.webeditor.HELM.AA) {
                var mon = org.helm.webeditor.Monomers.getMonomer(a);
                if (mon != null) {
                    if (lastbt != org.helm.webeditor.HELM.AA) {
                        if (s.length > 0 && s.substr(s.length - 1) != "-")
                            s += "-";
                    }
                    var c = scil.Utils.isNullOrEmpty(mon.na) ? "?" : mon.na;
                    if (highlightselection && a.selected)
                        c = "<span style='background:#bbf;'>" + c + "</span>";
                    s += c;
                }
            }
            else if (bt == org.helm.webeditor.HELM.SUGAR) {
                var b = this.bases[i];
                var mon = org.helm.webeditor.Monomers.getMonomer(b);
                if (mon != null) {
                    if (lastbt != org.helm.webeditor.HELM.SUGAR && lastbt != org.helm.webeditor.HELM.LINKER) {
                        if (s.length > 0 && s.substr(s.length - 1) != "-")
                            s += "-";
                    }
                    var c = scil.Utils.isNullOrEmpty(mon.na) ? "?" : mon.na;
                    if (highlightselection && b.selected)
                        c = "<span style='background:#bbf;'>" + c + "</span>";
                    s += c;
                }
            }
            lastbt = bt;
        }

        return s;
    },

    /**
    * Get HELM notation (internal use)
    * @function getHelm
    */
    getHelm: function (ret, highlightselection) {
        var sequence = "";
        var aaid = 0;
        var firstseqid = null;
        var lastseqid = null;
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        var chn = [];
        var lastbt = null;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];

            var bt = a.biotype();

            if (bt == org.helm.webeditor.HELM.LINKER || bt == org.helm.webeditor.HELM.SUGAR)
                bt = org.helm.webeditor.HELM.BASE;
            if (bt != lastbt || bt == org.helm.webeditor.HELM.CHEM) {
                var seqid = null;
                if (bt == org.helm.webeditor.HELM.BASE)
                    seqid = "RNA";
                else if (bt == org.helm.webeditor.HELM.AA)
                    seqid = "PEPTIDE";
                else if (bt == org.helm.webeditor.HELM.CHEM)
                    seqid = "CHEM";
                seqid = seqid + (++ret.chainid[seqid]);

                if (i == 0 && a.biotype() == org.helm.webeditor.HELM.SUGAR) {
                    if (a.bio.annotation == "5'ss" || a.bio.annotation == "5'as")
                        ret.annotations[seqid] = { strandtype: a.bio.annotation.substr(2) };
                }

                if (i > 0) {
                    var lasta = this.atoms[i - 1];
                    var b = this.bonds[i - 1];
                    var r1 = b.a1 == lasta ? b.r1 : b.r2;
                    var r2 = b.a1 == lasta ? b.r2 : b.r1;

                    a._aaid = 1;
                    conn = lasta._aaid + ":R" + r1 + "-" + a._aaid + ":R" + r2;
                    if (lastseqid != null) {
                        var tag = "";
                        if (!scil.Utils.isNullOrEmpty(b.tag))
                            tag = '\"' + b.tag.replace(/"/g, "\\\"") + '\"';

                        ret.connections.push(lastseqid + "," + seqid + "," + conn + tag);
                        ret.sequences[lastseqid] = sequence;
                        ret.chains[lastseqid] = chn;
                    }
                }

                if (firstseqid == null)
                    firstseqid = seqid;

                chn = [];
                aaid = 0;
                sequence = "";
                lastseqid = seqid;
                lastbt = bt;
            }

            a._aaid = ++aaid;
            chn.push(a);

            if (aaid > 1 && !(i > 0 && a.biotype() == org.helm.webeditor.HELM.LINKER && this.atoms[i - 1].biotype() == org.helm.webeditor.HELM.SUGAR)) {
                sequence += ".";
                //if (a.biotype() == org.helm.webeditor.HELM.LINKER)
                //    sequence += "()";
            }
            sequence += org.helm.webeditor.IO.getCode(a, highlightselection);

            if (this.bases[i] != null) {
                var b = this.bases[i];
                sequence += org.helm.webeditor.IO.getCode(b, highlightselection, true);
                b._aaid = ++aaid;
                chn.push(b);
            }
        }

        if (sequence != null) {
            ret.sequences[lastseqid] = sequence;
            ret.chains[lastseqid] = chn;
        }

        if (this.isCircle()) {
            var b = this.bonds[this.bonds.length - 1];
            // RNA1,RNA1,1:R1-21:R2
            var conn;
            if (this.atoms[0] == b.a1)
                conn = b.a1._aaid + ":R" + b.r1 + "-" + b.a2._aaid + ":R" + b.r2;
            else
                conn = b.a2._aaid + ":R" + b.r2 + "-" + b.a1._aaid + ":R" + b.r1;

            var tag = "";
            if (!scil.Utils.isNullOrEmpty(b.tag))
                tag = '\"' + b.tag.replace(/"/g, "\\\"") + '\"';

            ret.connections.push(firstseqid + "," + lastseqid + "," + conn);
        }
    },

    /**
    * Get a node by its Monomer ID (internal use)
    * @function getAtomByAAID
    */
    getAtomByAAID: function (aaid) {
        if (!(aaid > 0))
            return null;

        for (var i = 0; i < this.atoms.length; ++i) {
            if (this.atoms[i]._aaid == aaid)
                return this.atoms[i];
        }
        for (var i = 0; i < this.bases.length; ++i) {
            if (this.bases[i]._aaid == aaid)
                return this.bases[i];
        }

        return null;
    }
});

scil.apply(org.helm.webeditor.Chain, {
    /**
    * Get the chain of a given node (internal use)
    * @function getChain
    */
    getChain: function (m, startatom) {
        if (startatom == null)
            return null;
        var chains = this._getChains(m, startatom);
        return chains == null ? null : chains[0];
    },

    /**
    * Get all chains (internal use)
    * @function getChains
    */
    getChains: function (m, branchcollection) {
        return this._getChains(m, null, branchcollection);
    },

    /**
    * Set Chain ID (internal use)
    * @function _setChainID
    */
    _setChainID: function (chain, chainid) {
        for (var k = 0; k < chain.atoms.length; ++k) {
            chain.atoms[k]._chainid = chainid;
            if (chain.bases[k] != null)
                chain.bases[k]._chainid = chainid;
        }
    },

    /**
    * Remove Chain ID (internal use)
    * @function _removeChainID
    */
    _removeChainID: function (atoms) {
        for (var i = 0; i < atoms.length; ++i)
            delete atoms[i]._chainid;
    },

    /**
    * Inner loop getting chains (internal use)
    * @function _getChains
    */
    _getChains: function (m, startatom, branchcollection) {
        var b0 = null;
        var bonds = [];
        var branches = [];
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.r1 == 1 && b.r2 == 2 || b.r1 == 2 && b.r2 == 1) {
                bonds.push(b);
                if (b0 == null && startatom != null && b.a1 == startatom || b.a2 == startatom)
                    b0 = bonds.length - 1;
            }
            else {
                branches.push(b);
            }
        }

        if (startatom != null && b0 == null)
            return null;

        var chains = [];
        while (bonds.length > 0) {
            var chain = new org.helm.webeditor.Chain();
            chains.splice(0, 0, chain);

            var b = null;
            if (b0 == null) {
                b = bonds[bonds.length - 1];
                bonds.splice(bonds.length - 1, 1);
            }
            else {
                b = bonds[b0];
                bonds.splice(b0, 1);
                b0 = null;
            }
            
            var head = b.r1 == 2 ? b.a1 : b.a2;
            var tail = b.r2 == 1 ? b.a2 : b.a1;

            chain.bonds.push(b);
            chain.atoms.push(head);
            chain.atoms.push(tail);

            while (bonds.length > 0) {
                var found = 0;
                for (var i = bonds.length - 1; i >= 0; --i) {
                    b = bonds[i];
                    if (b.a1 == head || b.a2 == head) {
                        bonds.splice(i, 1);
                        head = b.a1 == head ? b.a2 : b.a1;
                        chain.bonds.splice(0, 0, b);
                        chain.atoms.splice(0, 0, head);

                        ++found;
                    }
                    else if (b.a1 == tail || b.a2 == tail) {
                        bonds.splice(i, 1);
                        tail = b.a1 == tail ? b.a2 : b.a1;
                        chain.bonds.push(b);
                        chain.atoms.push(tail);

                        ++found;
                    }
                }

                if (found == 0)
                    break;
            }

            if (startatom != null)
                break;
        }

        m.clearFlag();
        for (var i = 0; i < chains.length; ++i) {
            var atoms = chains[i].atoms;
            for (var k = 0; k < atoms.length; ++k)
                atoms[k].f = true;
        }

        if (startatom == null) {
            var atoms = m.atoms;
            for (var k = 0; k < atoms.length; ++k) {
                var a = atoms[k];
                if (a.f)
                    continue;

                if (a.biotype() == org.helm.webeditor.HELM.AA || a.biotype() == org.helm.webeditor.HELM.SUGAR || a.biotype() == org.helm.webeditor.HELM.LINKER) {
                    a.f = true;
                    var chain = new org.helm.webeditor.Chain();
                    chains.splice(0, 0, chain);
                    chain.atoms.push(a);
                }
            }
        }

        for (var i = 0; i < chains.length; ++i) {
            var atoms = chains[i].atoms;
            var bonds = chains[i].bonds;

            if (chains[i].isCircle()) {
                // rotate circle if the first atom is a linker (P)
                if (atoms[0].biotype() == org.helm.webeditor.HELM.LINKER && atoms[1].biotype() == org.helm.webeditor.HELM.SUGAR) {
                    atoms.splice(0, 1);
                    atoms.push(atoms[0]);

                    bonds.push(bonds[0]);
                    bonds.splice(0, 1);
                }

                // rotate if RNA/PEPTIDE/CHEM circle
                for (var j = 0; j < atoms.length - 1; ++j) {
                    var bt1 = atoms[j].biotype();
                    if (bt1 == org.helm.webeditor.HELM.LINKER)
                        bt1 = org.helm.webeditor.HELM.SUGAR;

                    var bt2 = atoms[j + 1].biotype();
                    if (bt2 == org.helm.webeditor.HELM.LINKER)
                        bt2 = org.helm.webeditor.HELM.SUGAR;

                    if (bt1 != bt2) {
                        for (var k = 0; k <= j; ++k) {
                            atoms.splice(0, 1);
                            atoms.push(atoms[0]);

                            bonds.push(bonds[0]);
                            bonds.splice(0, 1);
                        }
                        break;
                    }
                }
            }

            // detect bases
            for (var k = 0; k < atoms.length; ++k) {
                var a = atoms[k];
                if (a.biotype() == org.helm.webeditor.HELM.SUGAR) {
                    for (var j = branches.length - 1; j >= 0; --j) {
                        var at = null;
                        var b = branches[j];
                        if (b.a1 == a && b.r1 == 3 && b.r2 == 1 && b.a2.biotype() == org.helm.webeditor.HELM.BASE)
                            at = chains[i].bases[k] = b.a2;
                        else if (b.a2 == a && b.r2 == 3 && b.r1 == 1 && b.a1.biotype() == org.helm.webeditor.HELM.BASE)
                            at = chains[i].bases[k] = b.a1;

                        if (at != null) {
                            chains[i].basebonds.push(b);
                            branches.splice(j, 1);
                            at.f = true;
                        }
                    }
                }
            }
        }

        if (branchcollection != null) {
            var list = [];
            for (var i = 0; i < branches.length; ++i) {
                var b = branches[i];
                if (!b.a1.f) {
                    b.a1.f = true;
                    list.push(b.a1);
                }
                if (!b.a2.f) {
                    b.a2.f = true;
                    list.push(b.a2);
                }
            }

            branchcollection.bonds = branches;
            branchcollection.atoms = list;
        }

        return chains;
    }
});