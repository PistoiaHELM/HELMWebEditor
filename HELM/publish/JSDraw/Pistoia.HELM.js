﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
// 2.0.0-2016-09-20
//
//////////////////////////////////////////////////////////////////////////////////


// https://github.com/PistoiaHELM/HELMEditor/blob/master/resources/conf/DefaultMonomerCategorizationTemplate.xml
// 

if (typeof (org) == "undefined")
    org = {};
if (org.helm == null)
    org.helm = {};

org.helm.webeditor = {
    kVersion: "2.0.0",
    atomscale: 2,
    bondscale: 1.6,

    HELM: {
        BASE: "HELM_BASE",
        SUGAR: "HELM_SUGAR",
        LINKER: "HELM_LINKER",
        AA: "HELM_AA",
        CHEM: "HELM_CHEM"
    },

    isHelmNode: function (a) {
        if (a == null)
            return false;

        var biotype = typeof(a) == "string" ? a : a.biotype();
        return biotype == org.helm.webeditor.HELM.BASE || biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.LINKER ||
            biotype == org.helm.webeditor.HELM.AA || biotype == org.helm.webeditor.HELM.CHEM;
    },

    monomerTypeList: function() {
        var monomertypes = { "": "" };
        monomertypes[org.helm.webeditor.HELM.BASE] = "Base";
        monomertypes[org.helm.webeditor.HELM.SUGAR] = "Sugar";
        monomertypes[org.helm.webeditor.HELM.LINKER] = "Linker";
        monomertypes[org.helm.webeditor.HELM.AA] = "Amino Acid";
        monomertypes[org.helm.webeditor.HELM.CHEM] = "Chem";
        return monomertypes;
    },

    about: function () {
        var me = this;
        if (this.about == null) {
            var div = scil.Utils.createElement(null, "div");
            scil.Utils.createElement(div, "img", null, { width: 425, height: 145 }, { src: scil.Utils.imgSrc("img/helm.png") });

            scil.Utils.createElement(div, "div", "Built on <a target=_blank href='http://www.jsdraw.com'>JSDraw.Lite " + JSDraw2.kFileVersion + "</a>, by <a target=_blank href='http://www.scillignece.com'>Scilligence</a>", { textAlign: "right", paddingRight: "26px" });
            var tbody = scil.Utils.createTable(div, null, null, { borderTop: "solid 1px gray", width: "100%" });
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", this.kVersion);
            scil.Utils.createElement(tr, "td", "&copy; 2016, <a target='_blank' href='http://www.pistoiaalliance.org/'>http://www.pistoiaalliance.org/</a>", { textAlign: "center" });
            scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", "&nbsp;");
            var btn = scil.Utils.createElement(scil.Utils.createElement(div, "div", null, { textAlign: "center" }), "button", "OK", { width: scil.Utils.buttonWidth + "px" });

            me.about = new JSDraw2.Dialog("About HELM Web Editor", div);
            scil.connect(btn, "onclick", function (e) { me.about.hide(); e.preventDefault(); });
        }
        this.about.show();
    }
};

if (JSDraw2.Security.kEdition == "Lite")
    JSDraw2.Editor.showAbout = org.helm.webeditor.about;

scil.helm = org.helm.webeditor;
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Interface = {
    createCanvas: function(div, args) {
        return new JSDraw2.Editor(div, args);
    },

    createMol: function(molfile) {
        var m = new JSDraw2.Mol();
        m.setMolfile(molfile);
        return m;
    },

    createPoint: function (x, y) {
        return new JSDraw2.Point(x, y);
    },

    createRect: function (l, t, w, h) {
        return new JSDraw2.Rect(l, t, w, h);
    },

    createAtom: function (m, p) {
        return m.addAtom(new JSDraw2.Atom(p));
    },

    createBond: function (m, a1, a2) {
        return m.addBond(new JSDraw2.Bond(a1, a2, JSDraw2.BONDTYPES.SINGLE));
    },

    getAtomStats: function(m, atoms) {
        var mol = { atoms: atoms, bonds: m.bonds };
        var ret = JSDraw2.FormulaParser.getAtomStats(m);
        return ret == null ? null : ret.elements;
    },

    molEquals: function (m1, m2) {
        var mol1 = m1.mol != null ? m1.mol : (m1.mol = this.createMol(scil.helm.Monomers.getMolfile(m1)));
        var mol2 = m2.mol != null ? m2.mol : (m2.mol = this.createMol(scil.helm.Monomers.getMolfile(m2)));
        return mol2.fullstructureMatch(mol1);
    },

    molStats: function(molfile) {
        var mol = this.createMol(molfile);
        mol.calcHCount();
        return JSDraw2.FormulaParser.getAtomStats(mol).elements;
    },

    getElementMass: function(e) {
        return JSDraw2.PT[e].m;
    },

    getCurrentAtom: function(jsd) {
        return JSDraw2.Atom.cast(jsd.curObject)
    },

    scaleCanvas: function(jsd) {
        var scale = JSDraw2.Editor.BONDLENGTH / jsd.bondlength;
        if (JSDraw2.Editor.BONDLENGTH / jsd.bondlength > 1)
            jsd.scale(JSDraw2.Editor.BONDLENGTH / jsd.bondlength);
    },

    drawMonomer: function (surface, a, p, fontsize, linewidth, color) {
        color = null;
        var biotype = a.biotype();
        var c = scil.Utils.isNullOrEmpty(color) ? org.helm.webeditor.Monomers.getColor(a) : color;
        var w = fontsize * org.helm.webeditor.atomscale;
        var lw = linewidth / 2;//(c.nature ? 1 : 2);
        if (biotype == org.helm.webeditor.HELM.LINKER)
            JSDraw2.Drawer.drawEllipse(surface, org.helm.webeditor.Interface.createRect(p.x - w / 2, p.y - w / 2, w, w), c.linecolor, lw).setFill(c.backgroundcolor);
        else if (biotype == org.helm.webeditor.HELM.SUGAR)
            JSDraw2.Drawer.drawRect(surface, org.helm.webeditor.Interface.createRect(p.x - w / 2, p.y - w / 2, w, w), c.linecolor, lw, linewidth * 3).setFill(c.backgroundcolor);
        else if (biotype == org.helm.webeditor.HELM.BASE)
            JSDraw2.Drawer.drawDiamond(surface, org.helm.webeditor.Interface.createRect(p.x - w / 2, p.y - w / 2, w, w), c.linecolor, lw).setFill(c.backgroundcolor);
        else if (biotype == org.helm.webeditor.HELM.AA)
            JSDraw2.Drawer.drawHexgon(surface, org.helm.webeditor.Interface.createRect(p.x - w / 2, p.y - w / 2, w, w), c.linecolor, lw, linewidth * 3).setFill(c.backgroundcolor);
        else if (biotype == org.helm.webeditor.HELM.CHEM)
            JSDraw2.Drawer.drawRect(surface, org.helm.webeditor.Interface.createRect(p.x - w / 2, p.y - w / 2, w, w), c.linecolor, lw).setFill(c.backgroundcolor);
        p.offset(0, -1);
        JSDraw2.Drawer.drawLabel(surface, p, a.elem, c.textcolor, fontsize * (a.elem.length > 1 ? 2 / a.elem.length : 1.0), null, null, null, false);

        if (a.bio.id > 0) {
            var p1 = p.clone();
            p1.offset(-fontsize * 1.2, -fontsize * 1.2);
            JSDraw2.Drawer.drawLabel(surface, p1, a.bio.id, "green", fontsize, null, null, null, false);
        }
        if (!scil.Utils.isNullOrEmpty(a.bio.annotation)) {
            var p1 = p.clone();
            p1.offset(-fontsize * 2, -fontsize * 1.5);
            JSDraw2.Drawer.drawLabel(surface, p1, a.bio.annotation, "orange", fontsize, null, null, null, false);
        }
    },

    addToolbar: function (buttons, flat, sub, options) {
        var sub = [
                { c: "helm_base", t: "Base", label: "Base" },
                { c: "helm_sugar", t: "Sugar", label: "Sugar" },
                { c: "helm_linker", t: "Linker", label: "Linker" },
                { c: "helm_aa", t: "Peptide", label: "Peptide" },
                { c: "helm_chem", t: "Chemistry", label: "Chemistry" }
        ];

        var main = { c: "helm_nucleotide", t: "Nucleotide", label: "Nucleotide", sub: sub, hidden: true };
        buttons.push(main);

        buttons.push({ c: "open", t: "Load", label: "Load" });
        buttons.push({ c: "save", t: "Save", label: "Save" });
        buttons.push({ c: "|" });
    },

    getHelmToolbar: function (buttons, filesubmenus, selecttools, options) {
        this.addToolbar(buttons, true, null, options);

        buttons.push({ c: "undo", t: "Undo", label: "Undo" });
        buttons.push({ c: "redo", t: "Redo", label: "Redo" });
        buttons.push({ c: "|" });
        buttons.push({ c: "eraser", t: "Eraser", label: "Eraser" });
        buttons.push({ c: "|" });
        buttons.push({ c: "select", t: "Box Selection", label: "Select", sub: selecttools });
        buttons.push({ c: "|" });
        buttons.push({ c: "helm_find", t: "Find/Replace", label: "Find/Replace" });
        buttons.push({ c: "helm_layout", t: "Layout", label: "Layout" });
        buttons.push({ c: "|" });
        buttons.push({ c: "zoomin", t: "Zoom in", label: "Zoom" });
        buttons.push({ c: "zoomout", t: "Zoom out", label: "Zoom" });
        buttons.push({ c: "|" });
        buttons.push({ c: "center", t: "Move to center", label: "Center" });
        buttons.push({ c: "moveview", t: "Move/View", label: "Move" });
    },

    onContextMenu: function (ed, e, viewonly) {
        var items = [];

        if (ed.options.helmtoolbar) {
            var a = JSDraw2.Atom.cast(ed.curObject);
            if (a != null && a.biotype() == scil.helm.HELM.SUGAR && a.bio.annotation != null) {
                items.push({ caption: "Set as Sense", key: "helm_set_sense" });
                items.push({ caption: "Set as Antisense", key: "helm_set_antisense" });
                items.push({ caption: "Clear Annotation", key: "helm_set_clear" });
                return items;
            }
            return null;
        }

        items.push({ caption: "Copy Molfile V2000", key: "copymolfile2000" });
        items.push({ caption: "Copy Molfile V3000", key: "copymolfile3000" });
        //items.push({ caption: "Paste Mol File", key: "pastemolfile" });
        items.push({ caption: "Copy SMILES", key: "copysmiles" });

        return items;
    }
};
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.MonomerColors = {
    bases: {
        A: "#A0A0FF",
        G: "#FF7070",
        T: "#A0FFA0",
        C: "#FF8C4B",
        U: "#FF8080"
    },

    linkers: {
        P: "#9aa5e1",
        p: "#9aa5e1"
    },

    sugars: {
        R: "#7a85c1",
        r: "#7a85c1"
    },

    aas: {
        A: "#C8C8C8",
        R: "#145AFF",
        N: "#00DCDC",
        D: "#E60A0A",
        C: "#E6E600",
        E: "#00DCDC",
        Q: "#E60A0A",
        G: "#EBEBEB",
        H: "#8282D2",
        I: "#0F820F",
        L: "#0F820F",
        K: "#145AFF",
        M: "#E6E600",
        F: "#3232AA",
        P: "#DC9682",
        S: "#FA9600",
        T: "#FA9600",
        W: "#B45AB4",
        Y: "#3232AA",
        V: "#0F820F"
    },

    chems: {
        R: "#eeeeee",
    }
};
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////


org.helm.webeditor.Monomers = {
    defaultmonomers: { HELM_BASE: null, HELM_SUGAR: null, HELM_LINKER: null, HELM_AA: null, HELM_CHEM: null },

    clear: function () {
        this.sugars = {};
        this.linkers = {};
        this.bases = {};
        this.aas = {};
        this.chems = {};
    },

    getDefaultMonomer: function (monomertype) {
        var r = this.defaultmonomers[monomertype];
        if (r != null)
            return r;

        if (monomertype == org.helm.webeditor.HELM.BASE)
            return this._getFirstKey(org.helm.webeditor.Monomers.bases, "a", "A");
        else if (monomertype == org.helm.webeditor.HELM.SUGAR)
            return this._getFirstKey(org.helm.webeditor.Monomers.linkers, "r", "R");
        else if (monomertype == org.helm.webeditor.HELM.LINKER)
            return this._getFirstKey(org.helm.webeditor.Monomers.linkers, "p", "P");
        else if (monomertype == org.helm.webeditor.HELM.AA)
            return this._getFirstKey(org.helm.webeditor.Monomers.aas, "A");
        else if (monomertype == org.helm.webeditor.HELM.CHEM)
            return this._getFirstKey(org.helm.webeditor.Monomers.chems, "R");
        return "?";
    },

    _getFirstKey: function(set, key1, key2) {
        if (key1 != null && set[key1] != null)
            return key1;
        if (key2 != null && set[key2] != null)
            return key2;

        for (var k in set)
            return k;
        return "?";
    },

    saveTextDB: function(url) {
        var cols = ["id", "symbol", "name", "naturalanalog", "molfile", "smiles", "polymertype", "monomertype", "r1", "r2", "r3", "r4", "r5", "author", "createddate"];
        var s = "";
        var n = { n: 0 };
        s += this.saveMonomersAsText(this.aas, "PEPTIDE", "Undefined", cols, n);
        s += this.saveMonomersAsText(this.sugars, "RNA", "Backbone", cols, n);
        s += this.saveMonomersAsText(this.linkers, "RNA", "Backbone", cols, n);
        s += this.saveMonomersAsText(this.bases, "RNA", "Branch", cols, n);
        s += this.saveMonomersAsText(this.chems, "CHEM", "Undefined", cols, n);

        s = n.n + "\n" + s;
        if (url == null)
            return s;

        var args = { client: "jsdraw", wrapper: "none", filename: "monomers.txt", directsave: 1, contents: s };
        scil.Utils.post(url, args, "_blank");
    },

    saveMonomerDB: function(url) {
        var s = "<MONOMER_DB>\n";
        s += "<PolymerList>\n";

        s += "<Polymer polymerType='PEPTIDE'>\n";
        s += this.saveMonomers(this.aas, "PEPTIDE", "Undefined");
        s += "</Polymer>\n";

        s += "<Polymer polymerType='RNA'>\n";
        s += this.saveMonomers(this.sugars, "RNA", "Backbone");
        s += this.saveMonomers(this.linkers, "RNA", "Backbone");
        s += this.saveMonomers(this.bases, "RNA", "Branch");
        s += "</Polymer>\n";

        s += "<Polymer polymerType='CHEM'>\n";
        s += this.saveMonomers(this.chems, "CHEM", "Undefined");
        s += "</Polymer>\n";

        s += "</PolymerList>\n";
        s += "</MONOMER_DB>";

        if (url == null)
            return s;

        var args = { client: "jsdraw", wrapper: "none", filename: "HELMMonomerDB.xml", directsave: 1, contents: s };
        scil.Utils.post(url, args, "_blank");
    },

    saveMonomersAsText: function (set, type, mt, cols, n) {
        var ret = "";
        for (var id in set) {
            var s = this.writeOneAsText({ id: ++n.n, symbol: id, monomertype: mt, polymertype: type, name: set[id].n, naturalanalog: set[id].na, m: set[id] }, cols);
            ret += JSDraw2.Base64.encode(s) + "\n";
        }

        return ret;
    },

    saveMonomers: function (set, type, mt) {
        var s = "";
        for (var id in set)
            s += this.writeOne({ id: id, mt: mt, type: type, m: set[id] });
        return s;
    },

    loadFromUrl: function (url, callback) {
        var fn = function (xml) {
            org.helm.webeditor.monomers.loadFromXml(xml);
            if (callback != null)
                callback();
        };
        scil.Utils.download(url, fn);
    },

    loadFromXml: function (s) {
        var doc = scil.Utils.parseXml(s);
        if (doc == null)
            return false;
        this.loadMonomers(doc);
    },

    loadDB: function (list) {
        this.clear();

        for (var i = 0; i < list.length; ++i) {
            var x = list[i];
            var m = { id: x.symbol, n: x.name, na: x.naturalanalog, type: x.polymertype, mt: x.monomertype, m: x.molfile };

            m.at = {};
            var rs = 0;
            for (var r = 1; r <= 5; ++r) {
                if (x["r" + r]) {
                    m.at["R" + r] = x["r" + r];
                    ++rs;
                }
            }
            m.rs = rs;

            this.addOneMonomer(m);
        }
    },

    loadMonomers: function(doc, callback) {
        var list = doc.getElementsByTagName("Monomer");
        if (list == null || list.length == 0)
            return false;

        if (callback == null) {
            for (var i = 0; i < list.length; ++i) {
                var m = this.readOne(list[i]);
                if (m != null)
                    this.addOneMonomer(m);
            }
            return true;
        }

        var newmonomers = [];
        var overlapped = [];
        for (var i = 0; i < list.length; ++i) {
            var m = this.readOne(list[i]);
            var old = this.getMonomer(this.helm2Type(m), m.id);
            if (old == null)
                newmonomers.push(m);
            else {
                if (!org.helm.webeditor.Interface.molEquals(old, m))
                    overlapped.push(m);
            }
        }

        var me = this;
        this.renameNextMonomer(newmonomers, overlapped, function () {
            var renamed = [];
            for (var i = 0; i < newmonomers.length; ++i) {
                var m = newmonomers[i];
                me.addOneMonomer(m);
                if (m.oldname != null)
                    renamed.push(m);
            }
            callback(renamed);
        });
    },

    renameNextMonomer: function (newmonomers, overlapped, callback) {
        if (overlapped.length == 0) {
            callback();
            return;
        }

        var me = this;
        var m = overlapped[0];

        scil.Utils.prompt2({
            caption: "Duplicate Monomer",
            message: "Monomer name, " + m.id + ", is used. Please enter a new name for it:",
            callback: function (s) {
                if (me.getMonomer(m.type, s) == null) {
                    m.oldname = m.id;
                    m.id = s;
                    newmonomers.push(m);
                    overlapped.splice(0, 1);
                }
                me.renameNextMonomer(newmonomers, overlapped, callback);
            }
        });
    },

    getMonomerSet: function (a) {
        if (a == null)
            return null;
        if (a.T == "ATOM")
            a = a.biotype();
        if (a == org.helm.webeditor.HELM.BASE)
            return org.helm.webeditor.monomers.bases;
        else if (a == org.helm.webeditor.HELM.SUGAR)
            return org.helm.webeditor.monomers.sugars;
        else if (a == org.helm.webeditor.HELM.LINKER)
            return org.helm.webeditor.monomers.linkers;
        else if (a == org.helm.webeditor.HELM.AA)
            return org.helm.webeditor.monomers.aas;
        else if (a == org.helm.webeditor.HELM.CHEM)
            return org.helm.webeditor.monomers.chems;
        return null;
    },

    getMonomerColors: function (a) {
        if (a == null)
            return null;
        if (a.T == "ATOM")
            a = a.biotype();
        if (a == org.helm.webeditor.HELM.BASE)
            return org.helm.webeditor.MonomerColors.bases;
        else if (a == org.helm.webeditor.HELM.SUGAR)
            return org.helm.webeditor.MonomerColors.sugars;
        else if (a == org.helm.webeditor.HELM.LINKER)
            return org.helm.webeditor.MonomerColors.linkers;
        else if (a == org.helm.webeditor.HELM.AA)
            return org.helm.webeditor.MonomerColors.aas;
        else if (a == org.helm.webeditor.HELM.CHEM)
            return org.helm.webeditor.MonomerColors.chems;
        return null;
    },

    getMonomerList: function(a) {
        var set = this.getMonomerSet(a);
        return set == null ? null : scil.Utils.getDictKeys(set);
    },

    getMonomer: function (a, name) {
        if (a == null && name == null)
            return null;

        var set = this.getMonomerSet(a);
        var s = name == null ? a.elem : org.helm.webeditor.IO.trimBracket(name);
        return set == null ? null : set[s];
    },

    hasR: function(type, name, r) {
        var m = this.getMonomer(type, name);
        return m != null && m.at != null && m.at[r] != null;
    },

    getColor: function (a) {
        var m = this.getMonomer(a, a.elem);
        if (m == null)
            m = {};

        var mc = this.getMonomerColors(a);
        if (mc == null)
            mc = {};
        var color = mc[m.na];

        return {
            linecolor: m.linecolor == null ? "#000" : m.linecolor,
            backgroundcolor: m.backgroundcolor == null ? (color == null ? "#eee" : color) : m.backgroundcolor,
            textcolor: m.textcolor == null ? "#000" : m.textcolor,
            nature: m.nature
        };
    },

    getColor2: function (type, name) {
        var m = this.getMonomer(type, name);
        if (m == null)
            m = {};

        var mc = this.getMonomerColors(type);
        if (mc == null)
            mc = {};
        var color = mc[m.na];

        return {
            linecolor: m.linecolor == null ? "#000" : m.linecolor,
            backgroundcolor: m.backgroundcolor == null ? (color == null ? "#eee" : color) : m.backgroundcolor,
            textcolor: m.textcolor == null ? "#000" : m.textcolor,
            nature: m.nature
        };
    },

    getMolfile: function (m) {
        if (m != null && m.m == null && m.mz != null)
            m.m = org.helm.webeditor.IO.uncompressGz(m.mz);
        return m == null ? null : m.m;
    },

    helm2Type: function (m) {
        if (m.type == "PEPTIDE")
            return org.helm.webeditor.HELM.AA;
        else if (m.type == "CHEM")
            return org.helm.webeditor.HELM.CHEM;
        else if (m.type == "RNA") {
            if (m.mt == "Branch")
                return org.helm.webeditor.HELM.BASE;
            if (m.mt == "Backbone") {
                if (m.na == "P" || m.na == "p")
                    return org.helm.webeditor.HELM.LINKER;
                else
                    return org.helm.webeditor.HELM.SUGAR;
            }
        }
        return null;
    },

    addOneMonomer: function (m) {
        var set = this.getMonomerSet(this.helm2Type(m));
        if (set == null)
            return false;

        delete m.type;
        delete m.mt;

        set[m.id] = m;
        return true;
    },

    writeOneAsText: function (m, cols) {
        var molfile = m.m.mz;
        if (scil.Utils.isNullOrEmpty(molfile) && m.m.m != null)
            molfile = m.m.m;

        m.molfile = molfile;
        if (m.m.at != null) {
            for (var x in m.m.at)
                m[x.toLowerCase()] = m.m.at[x];
        }

        var s = "";
        for (var i = 0; i < cols.length; ++i) {
            if (i > 0)
                s += "|";
            var k = cols[i];
            s += m[k] == null ? "" : m[k];
        }
        return s;
    },

    writeOne: function (m) {
        var molfile = m.m.mz;
        if (scil.Utils.isNullOrEmpty(molfile) && m.m.m != null)
            molfile = org.helm.webeditor.IO.compressGz(m.m.m); // compress molfile

        var s = "<Monomer>\n";
        s += "<MonomerID>" + scil.Utils.escXmlValue(m.id) + "</MonomerID>\n";
        s += "<MonomerSmiles>" + scil.Utils.escXmlValue(m.smiles) + "</MonomerSmiles>\n";
        s += "<MonomerMolFile>" + scil.Utils.escXmlValue(molfile) + "</MonomerMolFile>\n";
        s += "<NaturalAnalog>" + scil.Utils.escXmlValue(m.m.na) + "</NaturalAnalog>\n";
        s += "<MonomerType>" + scil.Utils.escXmlValue(m.mt) + "</MonomerType>\n";
        s += "<PolymerType>" + scil.Utils.escXmlValue(m.type) + "</PolymerType>\n";
        if (m.m.at != null) {
            s += "<Attachments>\n";
            for (var r in m.m.at) {
                var cap = m.m.at[r];
                s += "<Attachment>\n";
                s += "<AttachmentID>" + r + "-" + cap + "</AttachmentID>\n";
                s += "<AttachmentLabel>" + r + "</AttachmentLabel>\n";
                s += "<CapGroupName>" + cap + "</CapGroupName>\n";
                s += "<CapGroupSmiles></CapGroupSmiles>\n";
                s += "</Attachment>\n";
            }
            s += "</Attachments>\n";
        }
        s += "</Monomer>\n";
        return s;
    },

    readOne: function (e) {
        var s = this.readValue(e, "MonomerMolFile");
        var m = null;
        var mz = null;
        if (s != null) {
            if (s.indexOf("M  END") > 0)
                m = s; // uncompressed molfile
            else
                mz = s; // compressed molfile
        }

        var m = {
            type: this.readValue(e, "PolymerType"),
            mt: this.readValue(e, "MonomerType"),
            id: this.readValue(e, "MonomerID"),
            n: this.readValue(e, "MonomerName"),
            na: this.readValue(e, "NaturalAnalog"),
            mz: mz,
            m: m,
            at: {}
        };

        var rs = 0;
        var list = e.getElementsByTagName("Attachment");
        if (list != null) {
            for (var i = 0; i < list.length; ++i) {
                var a = list[i];
                var r = this.readValue(a, "AttachmentLabel");
                var cap = this.readValue(a, "CapGroupName");
                if (m.at[r] == null)
                    ++rs;
                m.at[r] = cap;
            }
        }

        m.rs = rs;
        return m;
    },

    readValue: function(e, name) {
        var list = e.getElementsByTagName(name);
        if (list == null || list.length == 0)
            return null;
        return scil.Utils.getInnerText(list[0]);
    }
};

org.helm.webeditor.monomers = org.helm.webeditor.Monomers;


org.helm.webeditor.Monomerssugars = {
    'mph': { n: 'morpholino', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 11 11  0  0  0  0            999 V2000\n    2.8579    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.3163    2.4751    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0626    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.4751    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  1  6  1  0  0  0  0\n  2  7  1  1  0  0  0\n  6  8  1  1  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  4 11  1  0  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    'MOE': { n: '2\'-O-Methoxyethyl ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 16 16  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3772    0.1429    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.0916    0.5554    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8061    0.1429    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5206    0.5554    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  7 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'LR': { n: '2,\'4\'-locked-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 13 14  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2315    1.3786    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2406    0.7893    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  2 12  1  6  0  0  0\n 12 13  1  0  0  0  0\n  5 13  1  6  0  0  0\n  4  6  1  6  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    'SGNA': { n: 'S Propanetriol (GNA sugar)', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    1.4106    1.2465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2061    1.6958    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2061    2.5208    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4000    0.4216    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1092    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7007    1.6669    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7099    2.4919    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.9123    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  6  0  0  0\n  2  3  1  0  0  0  0\n  1  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  1  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\nA    3\nR3\nA    5\nR2\nA    8\nR1\nM  END\n' },
    'tR': { n: 'Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    0.7138    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.2146    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2165    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.2158    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2177    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4277    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.9171    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9322    0.1429    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  1  0  0  0\n  5  7  1  6  0  0  0\n  6  9  1  0  0  0  0\n  7 10  1  0  0  0  0\nA    8\nR3\nA    9\nR1\nA   10\nR2\nM  END\n' },
    'dR': { n: 'Deoxy-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 11 11  0  0  0  0            999 V2000\n    2.1588    2.5889    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1754    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1774    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3789    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3803    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5539    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5380    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    'lLR': { n: '2,\'4\'-locked-Ribose (alpha-L-LNA)', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 13 14  0  0  0  0            999 V2000\n    2.1648    1.9249    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4510    1.5114    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8799    1.5134    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6656    0.7149    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6675    0.7163    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9025    1.4515    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3025    2.3658    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8787    2.5446    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4860    0.2493    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2375    0.7145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5512    1.4326    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4125    0.7145    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  6  9  1  0  0  0  0\n  2 10  1  0  0  0  0\n  5 11  1  1  0  0  0\n  4  6  1  1  0  0  0\n 10 12  1  0  0  0  0\n  7 11  1  0  0  0  0\n 12 13  1  0  0  0  0\nA    8\nR3\nA    9\nR2\nA   13\nR1\nM  END\n' },
    'FMOE': { n: '2\'-O-Tris-trifluoromethoxyethyl ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 28 28  0  0  0  0            999 V2000\n    2.1588    3.6555    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    3.2420    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    3.2440    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    2.4455    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    2.4469    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    1.6205    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    1.6219    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    4.0964    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    4.2752    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    4.4500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    4.6046    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    1.0665    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3772    1.2094    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.0916    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8061    1.2094    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5206    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5206    2.4469    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.3456    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7341    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.7237    2.2334    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    5.3071    3.2438    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    6.1039    3.0303    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    6.5591    2.4188    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1706    1.6219    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    6.7581    0.9074    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0196    0.4125    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4486    0.4125    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7341    0.0000    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  7 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\n 16 18  1  0  0  0  0\n 16 19  1  0  0  0  0\n 17 20  1  0  0  0  0\n 17 21  1  0  0  0  0\n 17 22  1  0  0  0  0\n 18 23  1  0  0  0  0\n 18 24  1  0  0  0  0\n 18 25  1  0  0  0  0\n 19 26  1  0  0  0  0\n 19 27  1  0  0  0  0\n 19 28  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'UNA': { n: '2\'-3\'-Unlocked-ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 11  0  0  0  0            999 V2000\n    2.5201    2.0594    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4971    1.6574    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5702    1.6841    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0222    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9621    1.2055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4971    2.4824    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5702    2.5091    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8558    2.9216    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.7376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0222    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9621    0.3805    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3077    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  3  4  1  1  0  0  0\n  2  5  1  1  0  0  0\n  2  6  1  0  0  0  0\n  3  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  4 10  1  0  0  0  0\n  5 11  1  0  0  0  0\n 10 12  1  0  0  0  0\nA    6\nR3\nA    9\nR1\nA   12\nR2\nM  END\n' },
    '25R': { n: '2,5-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.6170    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.2035    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.2055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.4070    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5820    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5834    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0579    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2367    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.4115    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5661    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.2461    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  7 12  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'mR': { n: '2\'-O-Methyl-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 13 13  0  0  0  0            999 V2000\n    2.1588    2.5889    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1754    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1774    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3789    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3803    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5539    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5553    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5380    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4596    0.3418    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  7 13  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'aR': { n: '3-Amino-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    '4sR': { n: '4-Thio-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'FR': { n: 'FANA', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3509    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4493    2.0522    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  5 12  1  1  0  0  0\n  1  3  1  0  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    'R': { n: 'Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'hx': { n: 'hexitol', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.8579    2.4469    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0344    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2094    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.7968    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.2094    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    2.0344    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.4469    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0344    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.4469    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.7969    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    0.7969    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2154    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  1  6  1  0  0  0  0\n  2  7  1  1  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  3 10  1  6  0  0  0\n  5 11  1  1  0  0  0\n 10 12  1  0  0  0  0\nA    9\nR1\nA   11\nR3\nA   12\nR2\nM  END\n' },
    'eR': { n: '2\'-O,4\'-ethylene bridged Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 14 15  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0740    0.6659    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.0325    1.4610    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1300    0.7244    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  1  0  0  0\n  4  5  1  0  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5 12  1  6  0  0  0\n  2 13  1  6  0  0  0\n 13 14  1  0  0  0  0\n 14 12  1  0  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    'aFR': { n: 'alpha-FANA', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.0869    2.5027    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3969    2.1030    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7781    2.1049    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6043    1.3330    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5728    1.3058    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6055    0.5355    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2533    2.9289    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7770    3.1017    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7975    3.2707    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.4201    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2834    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3677    1.9838    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  8  1  6  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  5 12  1  1  0  0  0\n  1  3  1  0  0  0  0\nA    8\nR3\nA   10\nR1\nA   11\nR2\nM  END\n' },
    '5A6': { n: '6-amino-hexanol (5\' end)', na: 'R', rs: 3, at: { R1: 'H', R2: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    5.0119    0.4351    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2846    0.0457    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5837    0.4808    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8564    0.0914    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1555    0.5265    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4282    0.1370    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7272    0.5721    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.1827    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7128    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4401    0.3895    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7536    1.3967    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  1  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  7 11  1  0  0  0  0\nA    8\nR1\nA   10\nR2\nA   11\nR3\nM  END\n' },
    'PONA': { n: '2-(methylamino)ethanol (PHONA sugar)', na: 'R', rs: 3, at: { R1: 'H', R2: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    1.4106    1.2465    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4000    0.4216    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1092    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7007    1.6669    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7099    2.4919    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.9123    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.7373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1251    1.6590    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  1  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  1  8  1  0  0  0  0\nA    3\nR2\nA    7\nR1\nA    8\nR3\nM  END\n' },
    'RGNA': { n: 'R Propanetriol (GNA sugar)', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    1.4106    1.2465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2061    1.6958    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2061    2.5208    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4000    0.4216    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1092    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7007    1.6669    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7099    2.4919    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.9123    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  1  0  0  0\n  2  3  1  0  0  0  0\n  1  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  1  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\nA    3\nR3\nA    5\nR2\nA    8\nR1\nM  END\n' },
    '3A6': { n: '6-amino-hexanol (3\' end)', na: 'R', rs: 3, at: { R1: 'H', R2: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    1.4289    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7157    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4302    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2375    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7157    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  1  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  7 11  1  0  0  0  0\nA    8\nR2\nA   10\nR1\nA   11\nR3\nM  END\n' },
    'qR': { n: '2-O-beta-hydroxy-ethoxy-methyl Ribose (Qiagen)', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 17 17  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3772    0.1429    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.0916    0.5554    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8061    0.1429    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5206    0.5554    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2351    0.1429    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  7 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    'fR': { n: '2\'-Flu0ro-Ribose', na: 'R', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    2.1588    2.5890    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1755    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1775    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3790    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6627    0.5554    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8727    3.2087    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5381    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\nA    9\nR3\nA   11\nR1\nA   12\nR2\nM  END\n' },
    '3SS6': { n: '3\'-Thiol-Modifier 6 S-S from Glen Research', na: 'R', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 18 17  0  0  0  0            999 V2000\n    1.4290    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7158    0.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4303    0.4125    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1447    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8592    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5737    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.2882    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   10.0026    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.7171    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.4316    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n   12.1460    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n  3 17  1  0  0  0  0\n 16 18  1  0  0  0  0\nA   17\nR1\nA   18\nR2\nM  END\n' },
    '12ddR': { n: '1\',2\'-Di-Deoxy-Ribose', na: 'R', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    2.1588    2.5889    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4450    2.1754    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8739    2.1774    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6596    1.3789    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6615    1.3803    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6608    0.5539    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2965    3.0299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    3.3835    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.5380    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3621    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  7  1  1  0  0  0\n  3  5  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  6 10  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\nA    9\nR1\nA   10\nR2\nM  END\n' },
    '3FAM': { n: '3-FAM', na: 'R', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 38 42  0  0  0  0            999 V2000\n    0.0000    1.3200    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8545    1.3200    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2670    2.0344    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9814    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9814    0.7969    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6959    2.0344    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.7679    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4104    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1249    2.0344    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8393    1.6219    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5538    2.0344    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5538    2.8594    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2683    3.2719    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8393    3.2719    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.9827    4.5095    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2683    4.0969    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.9827    2.8594    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.6972    3.2719    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.6972    4.0969    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.9747    5.4026    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1543    5.3164    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.3103    4.6489    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.1072    4.4354    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1502    6.9664    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4368    6.5522    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4388    5.7271    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8677    5.7306    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8657    6.5557    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5792    6.9699    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5832    5.3199    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.2966    5.7341    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.2946    6.5591    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7213    6.9629    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0078    6.5487    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0099    5.7237    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7253    5.3129    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.0091    6.9716    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2934    6.9612    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  0  0  0  0\n  5  7  1  0  0  0  0\n  6  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 12 14  2  0  0  0  0\n 16 13  2  0  0  0  0\n 13 17  1  0  0  0  0\n 15 16  1  0  0  0  0\n 17 18  2  0  0  0  0\n 18 19  1  0  0  0  0\n 19 22  1  0  0  0  0\n 15 19  2  0  0  0  0\n 21 15  1  0  0  0  0\n 20 21  1  0  0  0  0\n 20 22  1  0  0  0  0\n 22 23  2  0  0  0  0\n 26 21  1  0  0  0  0\n 21 27  1  0  0  0  0\n 24 25  1  0  0  0  0\n 24 28  1  0  0  0  0\n 27 30  2  0  0  0  0\n 28 27  1  0  0  0  0\n 29 28  2  0  0  0  0\n 30 31  1  0  0  0  0\n 31 32  2  0  0  0  0\n 29 32  1  0  0  0  0\n 33 25  2  0  0  0  0\n 26 25  1  0  0  0  0\n 36 26  2  0  0  0  0\n 33 34  1  0  0  0  0\n 34 35  2  0  0  0  0\n 35 36  1  0  0  0  0\n 32 37  1  0  0  0  0\n 34 38  1  0  0  0  0\nA    1\nR1\nA    7\nR2\nM  END\n' },
    'am12': { n: '5\'-12-amino-dodecanol', na: 'R', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 16 15  0  0  0  0            999 V2000\n   10.0026    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    9.2881    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5737    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8592    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1447    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4303    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7158    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.7171    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  1  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\nA    9\nR1\nA   16\nR2\nM  END\n' },
    'am6': { n: '5\'-6-amino-hexanol', na: 'R', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    0.7145    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7158    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4302    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 10  1  0  0  0  0\n  2  1  1  0  0  0  0\nA    3\nR1\nA   10\nR2\nM  END\n' }
};

org.helm.webeditor.Monomers.linkers = {
    'naP': { n: 'Sodium Phosphate', na: 'P', rs: 2, at: { R1: 'OH', R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  6  4  0  0  0  0            999 V2000\n    0.8250    1.4732    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.4732    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    2.2982    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6500    1.4732    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.6482    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n    0.8839    0.0000    0.0000 Na  0  3  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nA    2\nR1\nA    4\nR2\nM  CHG  1   5  -1\nM  CHG  1   6   1\nM  END\n' },
    'sP': { n: 'Phosporothioate', na: 'P', rs: 2, at: { R1: 'OH', R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  5  4  0  0  0  0            999 V2000\n    0.8250    0.8250    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    1.6500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6500    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nA    2\nR1\nA    4\nR2\nM  END\n' },
    'P': { n: 'Phosphate', na: 'P', rs: 2, at: { R1: 'OH', R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  5  4  0  0  0  0            999 V2000\n    0.8250    0.8250    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    1.6500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6500    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nA    2\nR1\nA    4\nR2\nM  END\n' },
    'bP': { n: 'Boranophosphate', na: 'P', rs: 2, at: { R1: 'OH', R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  5  4  0  0  0  0            999 V2000\n    0.8250    0.8250    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    1.6500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6500    0.8250    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.0000    0.0000 B   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nA    2\nR1\nA    4\nR2\nM  END\n' },
    'nasP': { n: 'Sodium Phosporothioate', na: 'P', rs: 2, at: { R1: 'OH', R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  6  4  0  0  0  0            999 V2000\n    0.8250    1.3848    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.3848    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    2.2098    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6500    1.3848    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.5598    0.0000 S   0  5  0  0  0  0  0  0  0  0  0  0\n    0.9428    0.0000    0.0000 Na  0  3  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nA    2\nR1\nA    4\nR2\nM  CHG  1   5  -1\nM  CHG  1   6   1\nM  END\n' }
};

org.helm.webeditor.Monomers.bases = {
    'cpU': { n: '5-cyclopropyl-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 13  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9446    3.2246    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6829    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  1  0  0  0  0\n 12 11  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'dabA': { n: '7-deaza-8-aza-7-bromo-2-amino-Adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 14  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.2375    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1557    2.6459    0.0000 Br  0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n  5 12  1  0  0  0  0\n  9 13  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    '5eU': { n: '5-ethynyl-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 11  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6829    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  3  0  0  0  0\nA    9\nR1\nM  END\n' },
    '5tpU': { n: '5-tris-propynyl-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 19 19  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6829    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1911    3.1836    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8964    4.0970    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1100    4.8939    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.7214    4.0970    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8244    5.3064    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1339    3.3825    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.6494    5.3064    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.9308    3.5960    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  3  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 15  1  0  0  0  0\n 14 16  1  0  0  0  0\n 15 17  1  0  0  0  0\n 16 18  3  0  0  0  0\n 17 19  3  0  0  0  0\nA    9\nR1\nM  END\n' },
    'meA': { n: 'N-Methyl-Adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 13  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7365    4.0955    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n 10 12  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    'cdaC': { n: '5-cyclopropyl-4-dimethylamino-cytosine', na: 'C', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 14 15  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6829    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0714    3.2719    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  1  0  0  0  0\n 12 11  1  0  0  0  0\n  7 13  1  0  0  0  0\n  7 14  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'cpmA': { n: 'N-cyclopropylmethyl-adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 15 17  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    3.3000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9402    3.5135    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5558    2.5855    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n 10 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 15  1  0  0  0  0\n 15 14  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    '5fU': { n: '5-fluoro-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'tfU': { n: '5-trifluoromethyl-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 13  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    2.0626    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    3.3001    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    2.8876    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  1  0  0  0  0\n 10 13  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'baA': { n: 'N-benzyl-adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 18 20  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    4.5375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    6.1875    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    5.7750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    4.9500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    4.9500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    5.7750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n 10 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 16 13  2  0  0  0  0\n 13 17  1  0  0  0  0\n 14 15  2  0  0  0  0\n 15 16  1  0  0  0  0\n 17 18  2  0  0  0  0\n 14 18  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    'eaA': { n: 'N-ethyl-adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 14  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    4.5375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n 10 12  1  0  0  0  0\n 12 13  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    'In': { n: 'Inosine', na: 'X', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 12  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\nA   11\nR1\nM  END\n' },
    'G': { n: 'Guanine', na: 'G', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 13  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  5 11  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 12  1  0  0  0  0\n  8  9  2  0  0  0  0\nA   12\nR1\nM  END\n' },
    'A': { n: 'Adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 12  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\nA   11\nR1\nM  END\n' },
    'C': { n: 'Cytosine', na: 'C', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  9  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\nA    9\nR1\nM  END\n' },
    'daA': { n: 'N,N-dimethyl-Adenine', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 14  0  0  0  0            999 V2000\n    0.7145    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0001    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0001    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    3.7125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\n 10 12  1  0  0  0  0\n 10 13  1  0  0  0  0\nA   11\nR1\nM  END\n' },
    'U': { n: 'Uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  9  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'dfB': { n: '2,4-Difluoro-Benzene', na: 'X', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  9  0  0  0  0            999 V2000\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    3.3000    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8250    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  5  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'T': { n: 'Thymine', na: 'T', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    1.4173    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1347    2.0676    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1405    1.2426    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7115    1.2326    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7057    2.0576    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4116    3.3000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8151    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4347    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9316    2.2811    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'prpC': { n: '5-Propynyl-Cytosine', na: 'C', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7268    2.6459    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3101    3.2292    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8935    3.8126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  3  0  0  0  0\n 11 12  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    '5iU': { n: '5-iodo-uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 I   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'prpU': { n: '5-propynyl Uracil', na: 'U', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    1.4289    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.0626    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3001    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8251    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    2.8876    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    3.3001    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  3  0  0  0  0\n 11 12  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'clA': { n: 'T-clamp OMe', na: 'A', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 20 23  0  0  0  0            999 V2000\n    1.9621    0.6913    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5118    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6675    1.4619    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7860    0.7333    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0007    1.5299    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3094    1.9802    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1815    2.7952    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4117    3.0920    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7698    2.5737    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8977    1.7586    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0893    3.1775    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7363    1.9034    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7806    2.7272    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5162    3.1007    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2075    2.6505    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1632    1.8266    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.4276    1.4531    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5605    3.9246    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2961    4.2981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    2.8704    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  1  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  3  2  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  2  0  0  0  0\n  8  9  1  0  0  0  0\n  9 10  2  0  0  0  0\n 10  3  1  0  0  0  0\n  7 11  1  0  0  0  0\n  5 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 11  1  0  0  0  0\n 13 14  2  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  2  0  0  0  0\n 16 17  1  0  0  0  0\n 17 12  2  0  0  0  0\n 14 18  1  0  0  0  0\n 18 19  1  0  0  0  0\n  9 20  1  0  0  0  0\nA    2\nR1\nM  END\n' },
    '5meC': { n: '5-methyl-cytidine', na: 'C', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10 10  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR1\nM  END\n' },
    'cpC': { n: '5-cyclopropyl-cytosine', na: 'C', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 13  0  0  0  0            999 V2000\n    1.4289    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.0625    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.0625    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    3.3000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6829    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0714    3.2719    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  1  0  0  0  0\n 12 11  1  0  0  0  0\nA    9\nR1\nM  END\n' }
};

org.helm.webeditor.Monomers.aas = {
    'dA': { n: 'D-Alanine', na: 'A', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  7  6  0  0  0  0            999 V2000\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  6  0  0  0\n  4  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  5  2  0  0  0  0\n  3  6  1  0  0  0  0\n  4  7  1  0  0  0  0\nA    6\nR2\nA    7\nR1\nM  END\n' },
    'dC': { n: 'D-Cysteine', na: 'C', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.8578    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2374    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1432    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4748    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4287    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6500    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  7  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nA    9\nR3\nM  END\n' },
    'seC': { n: 'SelenoCysteine', na: 'C', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    2.1433    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.2373    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 Se  0  0  0  0  0  0  0  0  0  0  0  0\n    1.4287    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.4747    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8577    1.2372    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7142    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  7  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nM  END\n' },
    'meC': { n: 'N-Methyl-Cysteine', na: 'C', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.8578    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2374    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1432    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4748    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4287    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6500    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8577    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  7  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5 10  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nA    9\nR3\nM  END\n' },
    'meA': { n: 'N-Methyl-Alanine', na: 'A', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  1  0  0  0\n  4  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  5  2  0  0  0  0\n  3  6  1  0  0  0  0\n  4  7  1  0  0  0  0\n  4  8  1  0  0  0  0\nA    6\nR2\nA    7\nR1\nM  END\n' },
    'meF': { n: 'N-Methyl-Phenylalanine', na: 'F', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 14 14  0  0  0  0            999 V2000\n    0.7145    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0001    1.2379    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.4129    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0003    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5727    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8  7  1  1  0  0  0\n  8  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  2  0  0  0  0\n 10 12  1  0  0  0  0\n  9 13  1  0  0  0  0\n  9 14  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'meG': { n: 'N-Methyl-Glycine', na: 'G', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  7  6  0  0  0  0            999 V2000\n    0.7146    1.2374    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4292    2.4747    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1436    1.2372    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  2  5  1  0  0  0  0\n  4  6  1  0  0  0  0\n  4  7  1  0  0  0  0\nA    5\nR2\nA    6\nR1\nM  END\n' },
    'meD': { n: 'N-Methyl-Aspartic acid', na: 'D', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    2.8580    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8581    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  6  1  0  0  0  0\n  4  5  2  0  0  0  0\n  8 10  1  0  0  0  0\n  8 11  1  0  0  0  0\nA    6\nR3\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meE': { n: 'N-Methyl-Glutamic acid', na: 'E', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 11  0  0  0  0            999 V2000\n    2.8579    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2379    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7147    2.4753    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5726    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  1  0  0  0  0\n  1  9  1  0  0  0  0\n  1  2  1  1  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  7  2  0  0  0  0\n  4  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\n  9 12  1  0  0  0  0\nA    6\nR3\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'fmoc': { n: 'fmoc N-Terminal Protection Group', na: 'X', rs: 1, at: { R2: 'OH' }, m: '\nMolEngine04211615442D\n\n 18 20  0  0  0  0            999 V2000\n    0.6994    2.4558    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.6470    1.6325    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4137    1.3281    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9401    1.9634    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4986    2.6603    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.7211    3.4547    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1442    4.0446    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3451    3.8401    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.1225    3.0456    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.1205    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.1198    0.3043    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8867    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5336    0.5118    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7564    2.5039    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5809    2.0410    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2201    2.4003    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2472    3.2248    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9052    1.9407    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  1  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  2  0  0  0  0\n  1  9  1  0  0  0  0\n  2 10  1  0  0  0  0\n 10 11  2  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  2  0  0  0  0\n  3 13  1  0  0  0  0\n  4 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  2  0  0  0  0\n 16 18  1  0  0  0  0\nA   18\nR2\nM  END\n' },
    'dY': { n: 'D-Tyrosine', na: 'Y', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 14 14  0  0  0  0            999 V2000\n    4.2870    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2871    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0002    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0003    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0015    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 13  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  6  0  0  0\n  5  6  1  0  0  0  0\n 10  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  7  8  1  0  0  0  0\n  8 11  2  0  0  0  0\n 11  9  1  0  0  0  0\n  9 10  2  0  0  0  0\n 11 12  1  0  0  0  0\n  2 14  1  0  0  0  0\nA   13\nR2\nA   14\nR1\nM  END\n' },
    'dW': { n: 'D-Tryptophan', na: 'W', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 16 17  0  0  0  0            999 V2000\n    4.5615    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5615    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4180    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4042    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6378    1.5058    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1418    0.8465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3149    2.2649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4960    2.3649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.7057    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3229    0.9465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6154    0.1711    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2760    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 15  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  6  0  0  0\n  5  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  8  6  1  0  0  0  0\n 14  7  1  0  0  0  0\n  8  9  2  0  0  0  0\n  8 10  1  0  0  0  0\n  9 14  1  0  0  0  0\n 13  9  1  0  0  0  0\n 10 11  2  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  2  0  0  0  0\n  3 16  1  0  0  0  0\nA   15\nR2\nA   16\nR1\nM  END\n' },
    'dV': { n: 'D-Valine', na: 'V', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.1433    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  8  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  4  1  6  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  0  0  0  0\n  7  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'meS': { n: 'N-Methyl-Serine', na: 'S', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  7  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  3  8  1  0  0  0  0\n  3  9  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nM  END\n' },
    'dR': { n: 'D-Arginine', na: 'R', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 12  0  0  0  0            999 V2000\n    5.0012    1.3997    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2867    0.9871    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.9872    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2866    0.2135    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0012    2.2247    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.9872    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.2248    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.9872    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7157    0.9872    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4898    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 12  1  0  0  0  0\n  2  6  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 11  1  0  0  0  0\n  9 10  2  0  0  0  0\n  6 13  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'dS': { n: 'D-Serine', na: 'S', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  7  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  6  0  0  0\n  5  6  1  0  0  0  0\n  3  8  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nM  END\n' },
    'meR': { n: 'N-Methyl-Arginine', na: 'R', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 14 13  0  0  0  0            999 V2000\n    5.0012    1.6885    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2867    1.2759    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.6886    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2760    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.6886    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2866    0.5023    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0012    2.5135    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2760    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6886    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.5136    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2760    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7157    1.2760    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4898    0.2888    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9411    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 12  1  0  0  0  0\n  2  6  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 11  1  0  0  0  0\n  9 10  2  0  0  0  0\n  6 13  1  0  0  0  0\n  6 14  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'meQ': { n: 'N-Methyl-Glutamine', na: 'Q', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 11  0  0  0  0            999 V2000\n    3.5723    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    2.4752    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  9  1  0  0  0  0\n  9  6  1  0  0  0  0\n  9  8  2  0  0  0  0\n  7 11  1  0  0  0  0\n  7 12  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'dP': { n: 'D-Proline', na: 'P', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  9  0  0  0  0            999 V2000\n    0.4821    1.6599    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.9903    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4878    0.3251    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2713    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2677    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9822    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9822    2.6459    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6967    1.4084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8547    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  5  1  1  6  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'dQ': { n: 'D-Glutamine', na: 'Q', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    3.5723    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    2.4752    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  4  9  1  0  0  0  0\n  9  6  1  0  0  0  0\n  9  8  2  0  0  0  0\n  7 11  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'dN': { n: 'D-Asparagine', na: 'N', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.8578    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.6459    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.8208    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.4084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5600    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  6  7  2  0  0  0  0\n  5 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meW': { n: 'N-Methyl-Tryptophan', na: 'W', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 17 18  0  0  0  0            999 V2000\n    4.5615    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5615    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4180    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4042    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6378    1.5058    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1418    0.8465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3149    2.2649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4960    2.3649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.7057    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3229    0.9465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6154    0.1711    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2760    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5615    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 15  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  8  6  1  0  0  0  0\n 14  7  1  0  0  0  0\n  8  9  2  0  0  0  0\n  8 10  1  0  0  0  0\n  9 14  1  0  0  0  0\n 13  9  1  0  0  0  0\n 10 11  2  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  2  0  0  0  0\n  3 16  1  0  0  0  0\n  3 17  1  0  0  0  0\nA   15\nR2\nA   16\nR1\nM  END\n' },
    'meV': { n: 'N-Methyl-Valine', na: 'V', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.1433    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  8  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  4  1  1  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  0  0  0  0\n  7  9  1  0  0  0  0\n  7 10  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'dL': { n: 'D-Leucine', na: 'L', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  1  0  0  0  0\n  5  1  1  6  0  0  0\n  3  2  1  0  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  9  1  0  0  0  0\n  8 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meT': { n: 'N-Methyl-Threonine', na: 'T', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8577    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1432    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  4  1  1  1  0  0  0\n  1  8  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  6  1  0  0  0  0\n  6  5  1  0  0  0  0\n  6  7  1  1  0  0  0\n  2  9  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'dM': { n: 'D-Methionine', na: 'M', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    3.5724    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2378    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  9  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  6  0  0  0\n  5  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  8  7  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meK': { n: 'N-Methyl-Lysine', na: 'K', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 13 12  0  0  0  0            999 V2000\n    5.0015    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0015    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7159    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2377    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0014    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  9  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8 11  1  0  0  0  0\n  7 12  1  0  0  0  0\n  8 13  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nA   12\nR3\nM  END\n' },
    'dK': { n: 'D-Lysine', na: 'K', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    4.2870    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6502    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2870    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0014    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  9  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8 11  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'mA': { n: 'alpha amino iso-butyric acid', na: 'A', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.6334    2.1214    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  0  0  0  0\n  4  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  5  2  0  0  0  0\n  3  6  1  0  0  0  0\n  4  7  1  0  0  0  0\n  8  2  1  0  0  0  0\nA    6\nR2\nA    7\nR1\nM  END\n' },
    'meI': { n: 'N-Methyl-Isoleucine', na: 'I', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    0.7145    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8581    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8577    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  1  0  0  0  0\n  1  2  1  0  0  0  0\n  3  7  1  0  0  0  0\n  3  6  1  0  0  0  0\n  3  4  1  1  0  0  0\n  4  5  2  0  0  0  0\n  4  9  1  0  0  0  0\n  7  8  1  6  0  0  0\n  6 10  1  0  0  0  0\n  6 11  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'dH': { n: 'D-Histidine', na: 'H', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    3.4242    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7097    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2807    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8615    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2571    0.4130    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5037    1.5149    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4656    0.1805    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7096    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4243    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1387    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n 10  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 11  1  0  0  0  0\n  2  9  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  6  4  2  0  0  0  0\n  7  4  1  0  0  0  0\n  7  5  2  0  0  0  0\n  5  8  1  0  0  0  0\n  8  6  1  0  0  0  0\n  9 12  1  0  0  0  0\nA   11\nR2\nA   12\nR1\nM  END\n' },
    'meH': { n: 'N-Methyl-Histidine', na: 'H', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 13  0  0  0  0            999 V2000\n    3.4242    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7097    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2807    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8615    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2571    0.4130    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5037    1.5149    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4656    0.1805    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7096    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4243    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1387    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4241    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n 10  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 11  1  0  0  0  0\n  2  9  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  6  4  2  0  0  0  0\n  7  4  1  0  0  0  0\n  7  5  2  0  0  0  0\n  5  8  1  0  0  0  0\n  8  6  1  0  0  0  0\n  9 12  1  0  0  0  0\n  9 13  1  0  0  0  0\nA   11\nR2\nA   12\nR1\nM  END\n' },
    'dF': { n: 'D-Phenylalanine', na: 'F', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 13  0  0  0  0            999 V2000\n    0.7145    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0001    1.2379    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.4129    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0003    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5727    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8  7  1  6  0  0  0\n  8  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  2  0  0  0  0\n 10 12  1  0  0  0  0\n  9 13  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'meN': { n: 'N-Methyl-Asparagine', na: 'N', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    2.8578    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.6459    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.8208    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.4084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5600    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9055    0.2677    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  6  7  2  0  0  0  0\n  5 10  1  0  0  0  0\n  5 11  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'dD': { n: 'D-Aspartic acid', na: 'D', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.8580    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8581    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  6  0  0  0\n  3  4  1  0  0  0  0\n  4  6  1  0  0  0  0\n  4  5  2  0  0  0  0\n  8 10  1  0  0  0  0\nA    6\nR3\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meM': { n: 'N-Methyl-Methionine', na: 'M', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    3.5724    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2378    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  9  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  8  7  1  0  0  0  0\n  2 10  1  0  0  0  0\n  2 11  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'dE': { n: 'D-Glutamic acid', na: 'E', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    2.8579    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2379    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7147    2.4753    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5726    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  1  0  0  0  0\n  1  9  1  0  0  0  0\n  1  2  1  6  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  7  2  0  0  0  0\n  4  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\nA    6\nR3\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'meL': { n: 'N-Methyl-Leucine', na: 'L', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  1  0  0  0  0\n  5  1  1  1  0  0  0\n  3  2  1  0  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n  8 11  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'D': { n: 'Aspartic acid', na: 'D', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.8580    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8581    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  6  1  0  0  0  0\n  4  5  2  0  0  0  0\n  8 10  1  0  0  0  0\nA    6\nR3\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'E': { n: 'Glutamic acid', na: 'E', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    2.8579    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2379    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7147    2.4753    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5726    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  1  0  0  0  0\n  1  9  1  0  0  0  0\n  1  2  1  1  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  7  2  0  0  0  0\n  4  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\nA    6\nR3\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'F': { n: 'Phenylalanine', na: 'F', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 13  0  0  0  0            999 V2000\n    0.7145    1.6503    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0001    1.2379    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.4129    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0003    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5727    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8  7  1  1  0  0  0\n  8  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  2  0  0  0  0\n 10 12  1  0  0  0  0\n  9 13  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'G': { n: 'Glycine', na: 'G', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  6  5  0  0  0  0            999 V2000\n    0.7146    1.2374    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4292    2.4747    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1436    1.2372    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  2  5  1  0  0  0  0\n  4  6  1  0  0  0  0\nA    5\nR2\nA    6\nR1\nM  END\n' },
    'A': { n: 'Alanine', na: 'A', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  7  6  0  0  0  0            999 V2000\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  1  0  0  0\n  4  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  5  2  0  0  0  0\n  3  6  1  0  0  0  0\n  4  7  1  0  0  0  0\nA    6\nR2\nA    7\nR1\nM  END\n' },
    'C': { n: 'Cysteine', na: 'C', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.8578    1.6498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2374    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.2375    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1432    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    2.4748    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4287    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6500    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  7  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nA    9\nR3\nM  END\n' },
    'L': { n: 'Leucine', na: 'L', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    1.4289    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  1  0  0  0  0\n  5  1  1  1  0  0  0\n  3  2  1  0  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  9  1  0  0  0  0\n  8 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'pnT': { n: 'PNA Thymine', na: 'X', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 21 21  0  0  0  0            999 V2000\n    0.0000    4.7084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    5.1209    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    4.7084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    5.1209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    4.7084    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    5.1209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    4.7084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    5.1209    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    3.8834    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    3.8834    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    3.3001    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6201    3.5677    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    2.4751    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5601    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5601    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9890    1.2375    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9890    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7035    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8456    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7  9  2  0  0  0  0\n  5 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  2  0  0  0  0\n 11 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 18  1  0  0  0  0\n 14 15  2  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\n 17 18  1  0  0  0  0\n 16 19  2  0  0  0  0\n 18 20  2  0  0  0  0\n 15 21  1  0  0  0  0\nA    1\nR1\nA    8\nR2\nM  END\n' },
    'M': { n: 'Methionine', na: 'M', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    3.5724    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2378    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  9  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  8  7  1  0  0  0  0\n  2 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'N': { n: 'Asparagine', na: 'N', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.8578    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    2.6459    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.8208    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    1.4084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5600    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  6  7  2  0  0  0  0\n  5 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'H': { n: 'Histidine', na: 'H', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 12 12  0  0  0  0            999 V2000\n    3.4242    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7097    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2807    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.8615    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2571    0.4130    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5037    1.5149    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4656    0.1805    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7096    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4243    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1387    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9952    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n 10  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 11  1  0  0  0  0\n  2  9  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  6  4  2  0  0  0  0\n  7  4  1  0  0  0  0\n  7  5  2  0  0  0  0\n  5  8  1  0  0  0  0\n  8  6  1  0  0  0  0\n  9 12  1  0  0  0  0\nA   11\nR2\nA   12\nR1\nM  END\n' },
    'I': { n: 'Isoleucine', na: 'I', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    0.7145    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8581    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    2.4751    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  1  0  0  0  0\n  1  2  1  0  0  0  0\n  3  7  1  0  0  0  0\n  3  6  1  0  0  0  0\n  3  4  1  1  0  0  0\n  4  5  2  0  0  0  0\n  4  9  1  0  0  0  0\n  7  8  1  6  0  0  0\n  6 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'meY': { n: 'N-Methyl-Tyrosine', na: 'Y', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 15 15  0  0  0  0            999 V2000\n    4.2870    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2871    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0002    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0003    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0015    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 13  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n 10  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  7  8  1  0  0  0  0\n  8 11  2  0  0  0  0\n 11  9  1  0  0  0  0\n  9 10  2  0  0  0  0\n 11 12  1  0  0  0  0\n  2 14  1  0  0  0  0\n  2 15  1  0  0  0  0\nA   13\nR2\nA   14\nR1\nM  END\n' },
    'K': { n: 'Lysine', na: 'K', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 12 11  0  0  0  0            999 V2000\n    5.0015    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0015    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7159    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2377    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  9  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8 11  1  0  0  0  0\n  7 12  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nA   12\nR3\nM  END\n' },
    'T': { n: 'Threonine', na: 'T', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8577    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  4  1  1  1  0  0  0\n  1  8  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  6  1  0  0  0  0\n  6  5  1  0  0  0  0\n  6  7  1  1  0  0  0\n  2  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'W': { n: 'Tryptophan', na: 'W', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 16 17  0  0  0  0            999 V2000\n    4.5615    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5615    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8470    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4180    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4042    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6378    1.5058    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1418    0.8465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3149    2.2649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4960    2.3649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.7057    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3229    0.9465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6154    0.1711    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2760    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1325    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 15  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  8  6  1  0  0  0  0\n 14  7  1  0  0  0  0\n  8  9  2  0  0  0  0\n  8 10  1  0  0  0  0\n  9 14  1  0  0  0  0\n 13  9  1  0  0  0  0\n 10 11  2  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  2  0  0  0  0\n  3 16  1  0  0  0  0\nA   15\nR2\nA   16\nR1\nM  END\n' },
    'V': { n: 'Valine', na: 'V', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    2.1433    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  8  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  4  1  1  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  0  0  0  0\n  7  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'Q': { n: 'Glutamine', na: 'Q', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 11 10  0  0  0  0            999 V2000\n    3.5723    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    2.4752    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  9  1  0  0  0  0\n  9  6  1  0  0  0  0\n  9  8  2  0  0  0  0\n  7 11  1  0  0  0  0\nA   10\nR2\nA   11\nR1\nM  END\n' },
    'P': { n: 'Proline', na: 'P', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  9  9  0  0  0  0            999 V2000\n    0.4821    1.6599    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.9903    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4878    0.3251    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2713    0.5834    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2677    1.4084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9822    1.8209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9822    2.6459    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6967    1.4084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8547    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  5  1  1  1  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'S': { n: 'Serine', na: 'S', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    2.1433    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4288    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2376    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7143    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  7  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  3  8  1  0  0  0  0\nA    7\nR2\nA    8\nR1\nM  END\n' },
    'R': { n: 'Arginine', na: 'R', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 13 12  0  0  0  0            999 V2000\n    5.0012    1.3997    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2867    0.9871    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5722    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.9872    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2866    0.2135    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0012    2.2247    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.9872    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    1.3998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    2.2248    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.9872    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7157    0.9872    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4898    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 12  1  0  0  0  0\n  2  6  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 11  1  0  0  0  0\n  9 10  2  0  0  0  0\n  6 13  1  0  0  0  0\nA   12\nR2\nA   13\nR1\nM  END\n' },
    'pnG': { n: 'PNA Guanine', na: 'X', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 23 24  0  0  0  0            999 V2000\n    0.5488    4.8305    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2633    5.2430    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9777    4.8305    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6922    5.2430    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4067    4.8305    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1212    5.2430    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8356    4.8305    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5501    5.2430    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8356    4.0055    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4067    4.0055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8233    3.4222    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1689    3.6898    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8233    2.5972    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1559    2.1122    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4108    1.3277    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.2358    1.3277    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4908    2.1122    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8588    0.7145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.0518    0.8860    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7969    1.6706    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3489    2.2837    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2713    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.8842    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7  9  2  0  0  0  0\n  5 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  2  0  0  0  0\n 11 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 17  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  2  0  0  0  0\n 14 21  1  0  0  0  0\n 14 15  2  0  0  0  0\n 15 18  1  0  0  0  0\n 18 19  1  0  0  0  0\n 19 20  1  0  0  0  0\n 20 21  2  0  0  0  0\n 18 22  2  0  0  0  0\n 20 23  1  0  0  0  0\nA    1\nR1\nA    8\nR2\nM  END\n' },
    'pnC': { n: 'PNA Cytosine', na: 'X', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 20 20  0  0  0  0            999 V2000\n    0.0000    4.7084    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    5.1209    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    4.7084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    5.1209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    4.7084    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    5.1209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    4.7084    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    5.1209    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    3.8834    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    3.8834    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    3.3001    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6201    3.5677    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    2.4751    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5601    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5601    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9890    1.2375    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9890    2.0626    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7035    2.4751    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7  9  2  0  0  0  0\n  5 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  2  0  0  0  0\n 11 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 18  1  0  0  0  0\n 14 15  2  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  2  0  0  0  0\n 17 18  1  0  0  0  0\n 18 19  2  0  0  0  0\n 16 20  1  0  0  0  0\nA    1\nR1\nA    8\nR2\nM  END\n' },
    'nL': { n: 'Norleucine', na: 'L', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    2.1434    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.6500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    2.4750    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2870    1.2374    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1433    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  0  0  0  0\n  4  1  1  1  0  0  0\n  2  3  1  0  0  0  0\n  4  7  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  2  0  0  0  0\n  5  8  1  0  0  0  0\n  7  9  1  0  0  0  0\n  3 10  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'Y': { n: 'Tyrosine', na: 'Y', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 14 14  0  0  0  0            999 V2000\n    4.2870    1.6499    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2871    2.4749    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5725    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    1.6501    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    1.2376    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4291    1.6502    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7146    1.2377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0002    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4127    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0003    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0015    1.2373    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8580    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 13  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n 10  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  7  8  1  0  0  0  0\n  8 11  2  0  0  0  0\n 11  9  1  0  0  0  0\n  9 10  2  0  0  0  0\n 11 12  1  0  0  0  0\n  2 14  1  0  0  0  0\nA   13\nR2\nA   14\nR1\nM  END\n' },
    'pnA': { n: 'PNA Adenine', na: 'X', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n 22 23  0  0  0  0            999 V2000\n    0.0000    4.8305    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    5.2430    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    4.8305    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    5.2430    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    4.8305    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    5.2430    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    4.8305    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    5.2430    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    4.0055    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    4.0055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    3.4222    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6201    3.6898    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.2745    2.5972    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6071    2.1122    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8620    1.3277    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.6870    1.3277    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9420    2.1122    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3100    0.7145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5030    0.8860    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.2481    1.6706    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8001    2.2837    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.7225    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7  9  2  0  0  0  0\n  5 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 10 12  2  0  0  0  0\n 11 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 13 17  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  2  0  0  0  0\n 14 21  1  0  0  0  0\n 14 15  2  0  0  0  0\n 15 18  1  0  0  0  0\n 18 19  2  0  0  0  0\n 19 20  1  0  0  0  0\n 20 21  2  0  0  0  0\n 18 22  1  0  0  0  0\nA    1\nR1\nA    8\nR2\nM  END\n' }//,
    //        'am': { n: 'C-Terminal amine', na: 'X', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  2  1  0  0  0  0            999 V2000\n    0.8250    0.0001    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\nA    2\nR1\nM  END\n' },
    //        'ac': { n: 'N-Terminal Acetic Acid', na: 'X', rs: 1, at: { R2: 'OH' }, m: '\nMolEngine04211615442D\n\n  4  3  0  0  0  0            999 V2000\n    0.0000    1.4289    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4125    0.7145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2375    0.7145    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  2  4  1  0  0  0  0\nA    4\nR2\nM  END\n' }
};

org.helm.webeditor.Monomers.chems= {
    R: { backgroundcolor: "#eeeeee", rs: 1 },
    'sDBL': { n: 'Symmetric Doubler', rs: 3, at: { R1: 'H', R2: 'H', R3: 'H' }, m: '\nMolEngine04211615442D\n\n 23 22  0  0  0  0            999 V2000\n    2.1434    2.7770    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.9520    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    1.5395    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    1.9520    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    1.5395    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    1.9520    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7158    1.5395    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4303    1.9520    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4303    2.7770    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.7145    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1447    3.1895    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1447    4.0145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8592    4.4270    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8592    5.2520    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    3.1895    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    4.0145    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    4.4270    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    5.2520    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1447    1.5395    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.5395    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8744    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    5.6645    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5737    5.6645    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n  1 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\n 17 18  1  0  0  0  0\n  8 19  2  0  0  0  0\n  2 20  2  0  0  0  0\n 10 21  1  0  0  0  0\n 18 22  1  0  0  0  0\n 14 23  1  0  0  0  0\nA   21\nR1\nA   22\nR2\nA   23\nR3\nM  END\n' },
    'N-BLOCK': { n: 'N-BLOCK', na: '', rs: 1, at: { R1: 'OH' }, m: '\nMolEngine04211615442D\n\n  2  1  0  0  0  0            999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\nA    2\nR1\nM  END\n' },
    'Alexa': { n: 'Alexa Fluor 488', rs: 1, at: { R1: 'X' } },
    'Az': { n: 'Azide', rs: 1, at: { R1: 'OH' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    4.2868    1.6500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2868    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8578    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.8250    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7144    0.4125    0.0000 N   0  3  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 N   0  5  0  0  0  0  0  0  0  0  0  0\n    5.0012    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  2  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  7  8  2  0  0  0  0\n  2  9  1  0  0  0  0\nA    9\nR1\nM  CHG  1   7   1\nM  CHG  1   8  -1\nM  END\n' },
    'hxy': { n: 'Hexynyl alcohol', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  8  7  0  0  0  0            999 V2000\n    4.2869    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0014    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  3  0  0  0  0\nA    3\nR1\nM  END\n' },
    'SMPEG2': { n: 'SM(PEG)2 linker from Pierce', rs: 2, at: { R1: 'OH', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 24 24  0  0  0  0            999 V2000\n    7.0960    1.2375    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8105    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5250    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.2395    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.8228    1.4084    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   10.2708    2.6658    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.5900    2.1998    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.6475    1.3852    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.9243    2.1624    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.0600    0.6708    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    8.7931    2.4133    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   11.7212    2.3759    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    7.8105    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.3815    0.8250    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.6671    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9526    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2381    1.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.6548    0.6541    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9403    1.0666    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.8531    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    1.2656    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.8531    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.2656    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.0281    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  7  5  1  0  0  0  0\n  5  8  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8  9  1  0  0  0  0\n  6  9  1  0  0  0  0\n  8 10  2  0  0  0  0\n  7 11  2  0  0  0  0\n  9 12  1  0  0  0  0\n  2 13  2  0  0  0  0\n  1 14  1  0  0  0  0\n 14 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\n 17 18  1  0  0  0  0\n 18 19  1  0  0  0  0\n 19 20  1  0  0  0  0\n 20 21  1  0  0  0  0\n 21 22  1  0  0  0  0\n 22 23  1  0  0  0  0\n 22 24  2  0  0  0  0\nA   12\nR2\nA   23\nR1\nM  END\n' },
    'SS3': { n: 'Dipropanol-disulfide', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 12 11  0  0  0  0            999 V2000\n    0.0082    7.0297    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    6.2083    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7103    5.7886    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7042    4.9666    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4156    4.5488    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4084    3.7249    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1209    3.3124    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1167    2.4874    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8275    2.0687    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8203    1.2437    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5312    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5240    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  6  7  1  0  0  0  0\n  2  3  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  3  4  1  0  0  0  0\n  9 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n  4  5  1  0  0  0  0\n 11 12  1  0  0  0  0\n  1  2  1  0  0  0  0\n  5  6  1  0  0  0  0\nA    1\nR1\nA   12\nR2\nM  END\n' },
    'Cys-BLOCK': { n: 'Cys-BLOCK', na: '', rs: 1, at: { R1: 'X' }, m: '\nMolEngine04211615442D\n\n  2  1  0  0  0  0            999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\nA    2\nR1\nM  END\n' },
    'EG': { n: 'Ethylene Glycol', rs: 2, at: { R2: 'OH', R1: 'H' }, m: '\nMolEngine04211615442D\n\n  5  4  0  0  0  0            999 V2000\n    0.7145    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  4  5  1  0  0  0  0\nA    3\nR1\nA    5\nR2\nM  END\n' },
    'MCC': { n: '4-(N-maleimidomethyl)cyclohexane-1-carboxylate', rs: 1, at: { R1: 'OH' }, m: '\nMolEngine04211615442D\n\n 17 18  0  0  0  0            999 V2000\n    1.9488    0.5948    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3745    1.1870    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6002    1.9805    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4003    2.1818    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9746    1.5896    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7489    0.7960    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5744    0.9857    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.5780    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3487    0.1922    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7747    1.7908    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.3490    1.1986    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2075    0.3858    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1657    1.3151    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5290    0.5744    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9367    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4667    0.0226    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5515    2.0444    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  1  6  1  0  0  0  0\n  2  7  1  0  0  0  0\n  7  8  2  0  0  0  0\n  7  9  1  0  0  0  0\n  5 10  1  0  0  0  0\n 10 11  1  0  0  0  0\n 12 11  1  0  0  0  0\n 11 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 14 15  2  0  0  0  0\n 12 15  1  0  0  0  0\n 12 16  2  0  0  0  0\n 13 17  2  0  0  0  0\nA    9\nR1\nM  END\n' },
    'C-BLOCK': { n: 'C-BLOCK', na: '', rs: 1, at: { R1: 'H' }, m: '\nMolEngine04211615442D\n\n  2  1  0  0  0  0            999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\nA    2\nR1\nM  END\n' },
    'PEG2': { n: 'Diethylene Glycol', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n  9  8  0  0  0  0            999 V2000\n    0.7144    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4289    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5723    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1557    0.5833    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.8702    0.1708    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.5846    0.5833    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  1  9  1  0  0  0  0\nA    8\nR2\nA    9\nR1\nM  END\n' },
    'A6OH': { n: '6-amino-hexanol', rs: 2, at: { R1: 'H', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 10  9  0  0  0  0            999 V2000\n    5.7158    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0013    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2869    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1435    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    0.4125    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.4303    0.4125    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  1  9  1  0  0  0  0\n  8 10  1  0  0  0  0\nA    9\nR2\nA   10\nR1\nM  END\n' },
    'SMCC': { n: 'SMCC linker from Pierce', rs: 2, at: { R1: 'OH', R2: 'H' }, m: '\nMolEngine04211615442D\n\n 18 19  0  0  0  0            999 V2000\n    2.8579    0.5667    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5724    0.1542    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1557    0.7376    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.6037    1.9950    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.9229    1.5290    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9804    0.7144    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2572    1.4916    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.3929    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.1260    1.7425    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.0541    1.7051    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    1.8042    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    1.3917    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4290    0.5667    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1434    0.1542    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8579    1.3917    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    1.8042    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7145    2.6292    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.3917    0.0000 R   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  5  3  1  0  0  0  0\n  3  6  1  0  0  0  0\n  4  5  1  0  0  0  0\n  6  7  1  0  0  0  0\n  4  7  1  0  0  0  0\n  6  8  2  0  0  0  0\n  5  9  2  0  0  0  0\n  7 10  1  0  0  0  0\n 14  1  1  0  0  0  0\n  1 15  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n 11 15  1  0  0  0  0\n 12 16  1  0  0  0  0\n 16 17  2  0  0  0  0\n 16 18  1  0  0  0  0\nA   10\nR2\nA   18\nR1\nM  END\n' }
};
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Plugin = scil.extend(scil._base, {
    constructor: function (jsd) {
        this.jsd = jsd;
        this.monomerexplorer = null;
    },

    getMF: function (html) {
        return org.helm.webeditor.Formula.getMF(this.jsd.m, html);
    },

    getMW: function () {
        return org.helm.webeditor.Formula.getMW(this.jsd.m);
    },

    getSpareRs: function (a, rs) {
        if (a.bio == null) // not bio
            return [];

        var m = org.helm.webeditor.Monomers.getMonomer(a);
        if (m == null)
            return null;

        if (rs == null)
            rs = [];
        else
            rs.splice(0, rs.length);

        for (var r in m.at) {
            var i = parseInt(r.substr(1));
            rs[i] = true;
        }

        var bonds = this.jsd.m.getNeighborBonds(a);
        for (var i = 0; i < bonds.length; ++i) {
            var b = bonds[i];
            if (b.a1 == a && rs[b.r1] != null)
                rs[b.r1] = false;
            else if (b.a2 == a && rs[b.r2] != null)
                rs[b.r2] = false;
        }

        var ret = [];
        for (var i = 1; i <= rs.length; ++i) {
            if (rs[i])
                ret.push(i);
        }
        return ret.length == 0 ? null : ret;
    },

    hasSpareR: function (a, r) {
        if (a == null)
            return false;
        if (a.bio == null)
            return true;

        var rs = this.getSpareRs(a);
        if (rs == null || rs.indexOf(r) < 0) {
            //scil.Utils.alert("The monomer, " + a.elem + ", does define R" + r);
            return false;
        }

        var bonds = this.jsd.m.getNeighborBonds(a);
        for (var i = 0; i < bonds.length; ++i) {
            var b = bonds[i];
            if (b.a1 == a && b.r1 == r)
                return false;
            else if (b.a2 == a && b.r2 == r)
                return false;
        }

        return true;
    },

    getDefaultNodeType: function (a, c) {
        var s = null;
        if (this.monomerexplorer != null)
            s = this.monomerexplorer.selected[a];
        if (!scil.Utils.isNullOrEmpty(s))
            return s;

        var set = org.helm.webeditor.Monomers.getMonomerSet(a);
        var m = set == null || this.jsd._keypresschar == null ? null : set[this.jsd._keypresschar];
        if (m != null)
            return this.jsd._keypresschar;

        if (c != null)
            return c;

        return org.helm.webeditor.Monomers.getDefaultMonomer(a);
    },

    setNodeType: function (a, biotype, elem) {
        var mon = org.helm.webeditor.Monomers.getMonomer(biotype, elem);
        if (mon == null)
            return false;

        var id = a.bio == null ? null : a.bio.id;
        a.bio = { type: biotype, id: id };
        a.elem = elem;
        return true;
    },

    cancelDnD: function() {
        if (this.monomerexplorer != null)
            this.monomerexplorer.dnd.cancel();
    },

    replaceMonomer: function (monomertype, find, replacedwith, selectedonly) {
        var n = 0;
        var atoms = this.jsd.m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if ((selectedonly && a.selected || !selectedonly) &&
                find == a.elem &&
                (monomertype == "" || monomertype == a.biotype())) {
                if (this.setNodeType(a, a.biotype(), replacedwith))
                    ++n;
            }
        }
        return n;
    },

    applyRule: function (rulefun) {
        org.helm.webeditor.RuleSet.applyRule(this, rulefun);
    },

    applyRules: function (funs) {
        org.helm.webeditor.RuleSet.applyRules(this, funs);
    },

    addNode: function (p, biotype, elem) {
        elem = org.helm.webeditor.IO.trimBracket(elem);

        var m = org.helm.webeditor.Monomers.getMonomer(biotype, elem);
        if (m == null) {
            scil.Utils.alert("Unknown " + biotype + " monomer name: " + elem);
            return null;
        }

        var a = org.helm.webeditor.Interface.createAtom(this.jsd.m, p);
        this.setNodeType(a, biotype, elem);
        return a;
    },

    addBond: function (a1, a2, r1, r2) {
        if (a1 == null || a2 == null || a1 == a2 || !this.hasSpareR(a1, r1) || !this.hasSpareR(a2, r2))
            return null;
        //if (a1.biotype() == org.helm.webeditor.HELM.SUGAR && a2.biotype() == org.helm.webeditor.HELM.SUGAR || a1.biotype() == org.helm.webeditor.HELM.AA && a2.biotype() == org.helm.webeditor.HELM.AA) {
        //    if ((r1 == 1 || r1 == 2) && r1 == r2)
        //        return null;
        //}
        var b = org.helm.webeditor.Interface.createBond(this.jsd.m, a1, a2);
        b.r1 = r1;
        b.r2 = r2;
        return b;
    },

    connectFragment: function (a1, a2, extendchain) {
        var b = null;
        var a = null;
        var frag = null;

        var left = a1.p.x < a2.p.x ? a1 : a2;
        if (a1.p.x > a2.p.x) {
            var t = a1;
            a1 = a2;
            a2 = t;
        }

        var delta = org.helm.webeditor.bondscale * this.jsd.bondlength;

        var bt1 = a1.biotype();
        var bt2 = a2.biotype();
        if (bt1 == org.helm.webeditor.HELM.LINKER && bt2 == org.helm.webeditor.HELM.SUGAR || bt1 == org.helm.webeditor.HELM.SUGAR && bt2 == org.helm.webeditor.HELM.LINKER || bt1 == org.helm.webeditor.HELM.SUGAR && bt2 == org.helm.webeditor.HELM.SUGAR ||
            bt1 == org.helm.webeditor.HELM.AA && bt2 == org.helm.webeditor.HELM.AA) {
            var f = false;
            if (this.hasSpareR(a1, 2) && this.hasSpareR(a2, 1)) {
                f = true;
            }
            else if (this.hasSpareR(a2, 2) && this.hasSpareR(a1, 1)) {
                var t = a1;
                a1 = a2;
                a2 = t;

                f = true;
            }

            if (f) {
                frag = this.jsd.getFragment(a2);
                if (bt1 == org.helm.webeditor.HELM.AA) {
                    b = this.addBond(a1, a2, 2, 1);
                }
                else {
                   if (bt1 != bt2 || !this.needLinker()) {
                        b = this.addBond(a1, a2, 2, 1);
                    }
                    else {
                        a = this.addNode(org.helm.webeditor.Interface.createPoint(left.p.x + delta, left.p.y), org.helm.webeditor.HELM.LINKER, this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER));
                        b = this.addBond(a1, a, 2, 1);
                        if (b != null)
                            b = this.addBond(a, a2, 2, 1);
                    }
                }

                this.finishConnect(extendchain, b, a, a1, a2, frag, delta);
                return;
            }
        }
        else if (bt1 == org.helm.webeditor.HELM.SUGAR && bt2 == org.helm.webeditor.HELM.BASE || bt2 == org.helm.webeditor.HELM.SUGAR && bt1 == org.helm.webeditor.HELM.BASE) {
            if (bt2 == org.helm.webeditor.HELM.SUGAR) {
                var t = a1;
                a1 = a2;
                a2 = t;
            }
            var b = this.addBond(a1, a2, 3, 1);
            if (b != null) {
                a2.p = org.helm.webeditor.Interface.createPoint(a1.p.x, a1.p.y + Math.abs(delta));
                this.finishConnect(false, b, null, b.a1);
            }
            return;
        }

        var rs1 = this.getSpareRs(a1);
        var rs2 = this.getSpareRs(a2);
        if (rs1 == null || rs2 == null) {
            scil.Utils.alert("Either atom doesn't have any connecting point available");
            this.finishConnect(extendchain);
            return;
        }

        if (rs1.length <= 1 && rs2.length <= 1) {
            if (bt1 == org.helm.webeditor.HELM.LINKER)
                bt1 = org.helm.webeditor.HELM.SUGAR;
            if (bt2 == org.helm.webeditor.HELM.LINKER)
                bt2 = org.helm.webeditor.HELM.SUGAR;
            // prevent head-to-head and tail-to-tail connection
            if (bt1 == bt2 && (bt1 == org.helm.webeditor.HELM.SUGAR || bt1 == org.helm.webeditor.HELM.AA) && rs1[0] == rs2[0] && (rs1[0] == 1 || rs1[0] == 2)) {
                scil.Utils.alert("head-to-head / tail-to-tail connection is not allowed");
                return;
            }

            frag = this.jsd.getFragment(a2);
            b = this.addBond(a1, a2, rs1[0], rs2[0]);
        }
        else {
            if (extendchain)
                this.jsd.refresh();
            var me = this;
            this.chooseRs(rs1, rs2, function (r1, r2) {
                frag = me.jsd.getFragment(a2);
                b = me.addBond(a1, a2, r1, r2);
                me.finishConnect(extendchain, b, a1, a1, a2, frag, delta);
            });
            return;
        }

        this.finishConnect(extendchain, b, a, a1, a2, frag, delta);
    },

    needLinker: function() {
        var linker = this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER);
        return linker != "null";
    },

    finishConnect: function (extendchain, b, a, a1, a2, frag, delta) {
        var cleaned = false;
        if (b != null && b.r1 > 2 && b.r2 > 2) {
            this.clean();
        }
        else {
            if (b != null && !extendchain) {
                if (frag != null) {
                    var p = a1.p.clone().offset(delta, 0);
                    if (a == null)
                        a = a1;

                    if (a != a1) {
                        a.p = p.clone();
                        p.offset(delta, 0);
                    }

                    if (frag.containsAtom(a1)) {
                        this.clean(a1);
                        cleaned = true;
                    }
                    else {
                        frag.offset(p.x - a2.p.x, p.y - a2.p.y);
                    }
                }
            }

            if (!cleaned) {
                var chain = org.helm.webeditor.Chain.getChain(this.jsd.m, a1);
                if (chain != null)
                    chain.resetIDs();
            }
        }

        this.jsd.refresh(extendchain || b != null);
    },

    chooseRs: function (rs1, rs2, callback) {
        if (this.chooseRDlg == null) {
            var me = this;
            var fields = { r1: { label: "Monomer 1 (left)", type: "select", width: 120 }, r2: { label: "Monomer 2 (right)", type: "select", width: 120 } };
            this.chooseRDlg = scil.Form.createDlgForm("Choose Connecting Points", fields, { label: "OK", onclick: function () { me.chooseRs2(); } });
        }

        this.chooseRDlg.callback = callback;
        this.chooseRDlg.show2({ owner: this.jsd });
        this._listRs(this.chooseRDlg.form.fields.r1, rs1, 2);
        this._listRs(this.chooseRDlg.form.fields.r2, rs2, 1);

        this.chooseRDlg.form.fields.r1.disabled = rs1.length <= 1;
        this.chooseRDlg.form.fields.r2.disabled = rs2.length <= 1;

        this.chooseRDlg.rs1 = rs1;
        this.chooseRDlg.rs2 = rs2;
    },

    _listRs: function (sel, list, v) {
        var ss = {};
        for (var i = 0; i < list.length; ++i)
            ss[list[i] + ""] = "R" + list[i];
        scil.Utils.listOptions(sel, ss, v == null ? null : (v+""), true, false);
    },

    chooseRs2: function () {
        var d = this.chooseRDlg.form.getData();
        if (scil.Utils.isNullOrEmpty(d.r1) && this.chooseRDlg.rs1.length > 0 || scil.Utils.isNullOrEmpty(d.r2) && this.chooseRDlg.rs2.length > 0) {
            scil.Utils.alter("Please select Rs for both Nodes");
            return;
        }

        this.chooseRDlg.hide();
        this.chooseRDlg.callback(d.r1 == null ? null : parseInt(d.r1), d.r2 == null ? null : parseInt(d.r2));
    },

    changeMonomer: function (a, cloned) {
        var s = this.getDefaultNodeType(a.biotype());
        if (!scil.Utils.isNullOrEmpty(s) && a.elem != s && s != "null") {
            this.jsd.pushundo(cloned);
            this.setNodeType(a, a.biotype(), s);
            this.jsd.refresh(true);
        }
        else {
            scil.Utils.beep();
        }
    },

    extendChain: function (a1, cmd, p1, p2, cloned) {
        var rs = [];
        var rgroups = this.getSpareRs(a1, rs);
        if (rgroups == null) {
            scil.Utils.alert("No connecting points available");
            this.jsd.redraw();
            return;
        }

        var delta = p2.x > p1.x ? org.helm.webeditor.bondscale * this.jsd.bondlength : -org.helm.webeditor.bondscale * this.jsd.bondlength;
        var p = org.helm.webeditor.Interface.createPoint(a1.p.x + delta, a1.p.y);

        var a2 = null;
        var r1 = null;
        var r2 = null;
        if (cmd == "helm_chem") {
            if (Math.abs(p2.y - p1.y) / Math.abs(p2.x - p1.x) > 5)
                p = org.helm.webeditor.Interface.createPoint(a1.p.x, a1.p.y + Math.abs(delta) * (p2.y > p1.y ? 1 : -1));
            a2 = this.addNode(p, org.helm.webeditor.HELM.CHEM, this.getDefaultNodeType(org.helm.webeditor.HELM.CHEM));
            if (a2 != null) {
                this.connectFragment(a1, a2, true);
                return;
            }
        }
        else if (cmd == "helm_aa") {
            if (Math.abs(p2.y - p1.y) / Math.abs(p2.x - p1.x) > 5)
                p = org.helm.webeditor.Interface.createPoint(a1.p.x, a1.p.y + Math.abs(delta) * (p2.y > p1.y ? 1 : -1));
            a2 = this.addNode(p, org.helm.webeditor.HELM.AA, this.getDefaultNodeType(org.helm.webeditor.HELM.AA));
        }
        else if (cmd == "helm_linker") {
            a2 = this.addNode(p, org.helm.webeditor.HELM.LINKER, this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER));
        }
        else if (cmd == "helm_sugar") {
            a2 = this.addNode(p, org.helm.webeditor.HELM.SUGAR, this.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR));
        }
        else if (cmd == "helm_base") {
            if (a1.biotype() == org.helm.webeditor.HELM.SUGAR && this.hasSpareR(a1, 3)) {
                r1 = 3;
                r2 = 1;
                p = org.helm.webeditor.Interface.createPoint(a1.p.x, a1.p.y + Math.abs(delta));
                a2 = this.addNode(p, org.helm.webeditor.HELM.BASE, this.getDefaultNodeType(org.helm.webeditor.HELM.BASE));
            }
        }
        else if (cmd == "helm_nucleotide" || cmd == "helm_sugar") {
            if (Math.abs(p2.y - p1.y) / Math.abs(p2.x - p1.x) > 5) {
                // drag vertically to add base
                if (a1.biotype() == org.helm.webeditor.HELM.SUGAR && rs[3] == true) {
                    r1 = 3;
                    r2 = 1;
                    p = org.helm.webeditor.Interface.createPoint(a1.p.x, a1.p.y + Math.abs(delta));
                    a2 = this.addNode(p, org.helm.webeditor.HELM.BASE, this.getDefaultNodeType(org.helm.webeditor.HELM.BASE));
                }
            }
            else {
                if (rs[1] == true || rs[2] == true) {
                    var m = this.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR);
                    a2 = this.addNode(p, org.helm.webeditor.HELM.SUGAR, m);
                    var a3 = null;
                    if (cmd == "helm_nucleotide" && org.helm.webeditor.Monomers.hasR(org.helm.webeditor.HELM.SUGAR, m, "R3")) {
                        a3 = this.addNode(org.helm.webeditor.Interface.createPoint(p.x, p.y + Math.abs(delta)), org.helm.webeditor.HELM.BASE, this.getDefaultNodeType(org.helm.webeditor.HELM.BASE));
                        this.addBond(a2, a3, 3, 1);
                    }

                    var e = this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER);
                    if (e != "null") {
                        var a4 = this.addNode(p.clone(), org.helm.webeditor.HELM.LINKER, e);
                        this.addBond(a2, a4, 2, 1);
                        if (delta > 0) {
                            a4.p.x += delta;
                        }
                        else {
                            a2.p.x += delta;
                            if (a3 != null)
                                a3.p.x += delta;
                            a2 = a4;
                        }
                    }
                }
            }
        }

        if (a2 != null) {
            this.jsd.pushundo(cloned);
            if (r1 == null || r2 == null) {
                if (this.hasSpareR(a1, 2) && !this.hasSpareR(a1, 1)) {
                    r1 = 2;
                    r2 = 1;
                }
                else if (this.hasSpareR(a1, 1) && !this.hasSpareR(a1, 2)) {
                    r1 = 1;
                    r2 = 2;
                }
                else {
                    r1 = delta > 0 ? 2 : 1;
                    r2 = r1 == 2 ? 1 : 2;
                }
            }
            var b = this.addBond(a1, a2, r1, r2);

            this.finishConnect(false, b, null, a1);
        }
        else {
            this.jsd.refresh();
        }
    },

    getHelm: function (highlightselection) {
        return org.helm.webeditor.IO.getHelm(this.jsd.m, highlightselection);
    },

    getSequence: function (highlightselection) {
        return org.helm.webeditor.IO.getSequence(this.jsd.m, highlightselection);
    },

    getXHelm: function () {
        return org.helm.webeditor.IO.getXHelm(this.jsd.m);
    },

    setHelm: function(s, renamedmonomers) {
        this.jsd.clear();

        var n = 0;
        try {
            if (!scil.Utils.isNullOrEmpty(s))
                n = org.helm.webeditor.IO.read(this, s, "HELM", renamedmonomers);
        }
        catch (e) {
            this.jsd.clear();
            return;
        }

        if (n > 0) {
            this.clean();
            this.jsd.fitToWindow();
            this.jsd.refresh();
        }
    },

    setXHelm: function (s) {
        var doc = typeof (s) == "string" ? scil.Utils.parseXml(s) : s;
        if (doc == null)
            return false;

        var es = doc.getElementsByTagName("HelmNotation");
        if (es == null || es.length == 0)
            return false;

        var s = scil.Utils.getInnerText(es[0]);

        var list = doc.getElementsByTagName("Monomers");
        if (list == null || list.length == 0) {
            this.setHelm(s);
            return;
        }

        var me = this;
        org.helm.webeditor.monomers.loadMonomers(list[0], function (renamed) {
            if (me.monomerexplorer != null)
                me.monomerexplorer.reloadTabs();
            me.setHelm(s, renamed);
        });
    },

    isXHelm: function(doc) {
        var ret = doc == null ? null : doc.getElementsByTagName("Xhelm");
        return ret != null && ret.length == 1;
    },


    showImportDlg: function () {
        if (this.inputSeqDlg == null) {
            var fields = {
                type: { label: "Sequence Type", type: "select", items: ["HELM", "Peptide", "RNA"] },
                sequence: { label: "Sequence", type: "textarea", width: 800, height: 50 }
            };

            var me = this;
            this.inputSeqDlg = scil.Form.createDlgForm("Import Sequence", fields, [
                { label: "Import", onclick: function () { me.importSequence(false); } },
                { label: "Append", onclick: function () { me.importSequence(true); } }
            ]);
        }

        this.inputSeqDlg.show2({ owner: this.jsd });
    },

    importSequence: function (append) {
        var data = this.inputSeqDlg.form.getData();
        if (this.setSequence(data.sequence, data.type, null, null, append))
            this.inputSeqDlg.hide();
    },

    setSequence: function(seq, format, sugar, linker, append) {
        var seq = scil.Utils.trim(seq);
        if (/^[a-z]+$/.test(seq))
            seq = seq.toUpperCase();

        var n = 0;
        var cloned = this.jsd.clone();
        this.jsd.clear();
        try {
            n = org.helm.webeditor.IO.read(this, seq, format, null, sugar, linker);
        }
        catch (e) {
            this.jsd.restoreClone(cloned);
            var s = e.message == null ? e : e.message;
            if (!scil.Utils.isNullOrEmpty(s))
                scil.Utils.alert("Error: " + s);
            return false;
        }

        if (n > 0) {
            this.jsd.pushundo(cloned);

            this.clean();

            if (append) {
                var m = cloned.mol.clone();
                var rect = m.rect();
                var r2 = this.jsd.m.rect();
                if (r2 != null && rect != null)
                    this.jsd.m.offset(rect.center().x - r2.center().x, rect.bottom() + this.jsd.bondlength * 4 - r2.bottom());
                m.mergeMol(this.jsd.m);
                this.jsd.m = m;
            }

            this.jsd.fitToWindow();
            this.jsd.refresh(true);
        }
        return true;
    },

    clean: function (a, redraw) {
        if (redraw)
            this.jsd.pushundo();

        org.helm.webeditor.Layout.clean(this.jsd.m, this.jsd.bondlength, a);
        if (redraw) {
            this.jsd.moveCenter();
            this.jsd.refresh(true);
        }
    },

    resetIDs: function() {
        org.helm.webeditor.Layout.resetIDs(this.jsd.m);
    },

    dropMonomer: function (type, id, e) {
        var p = this.jsd.eventPoint(e);
        if (p.x <= 0 || p.y <= 0 || p.x >= this.jsd.dimension.x || p.y >= this.jsd.dimension.y || id == "null")
            return false;
            
        var f = false;
        if (this.jsd.curObject == null) {
            // create new monomer
            var cmd = type == "nucleotide" ? "helm_nucleotide" : type.toLowerCase();
            if (this.isHelmCmd(cmd)) {
                p.offset(this.jsd.bondlength * 0.4, this.jsd.bondlength * 0.4);
                this.jsd.pushundo();
                var a = org.helm.webeditor.Interface.createAtom(this.jsd.m, p);
                this.createIsolatedMonomer(cmd, a);
                f = true;
            }
        }
        else {
            // modify the target monomer
            var set = org.helm.webeditor.Monomers.getMonomerSet(type);
            if (set == null || set[id] == null)
                return false;

            var a = org.helm.webeditor.Interface.getCurrentAtom(this.jsd);
            if (a == null || !org.helm.webeditor.isHelmNode(a) || a.biotype() != type || a.elem == id)
                return false;

            this.jsd.pushundo();
            this.setNodeType(a, a.biotype(), id);
            f = true;
        }

        if (f)
            this.jsd.refresh(true);
        return f;
    },

    showFindReplaceDlg: function () {
        if (this.findDlg == null) {
            var fields = {
                finding: { label: "Find", width: 400, str: "<div>(Monomer name or monomer ID)</div>" },
                monomertype: { label: "Monomer Type", type: "select", sort: false, items: org.helm.webeditor.monomerTypeList() },
                replacewith: { label: "Replace With", width: 400 },
                selectedonly: { label: "Scope", type: "checkbox", str: "Search Selected Only" }
            };

            var me = this;
            this.findDlg = scil.Form.createDlgForm("Find and Replace", fields, [
                { label: "Find", onclick: function () { me.showFindReplaceDlg2("find"); } },
                { label: "Find All", onclick: function () { me.showFindReplaceDlg2("findall"); } },
                { label: "Replace All", onclick: function () { me.showFindReplaceDlg2("replaceall"); } }
            ])
        }

        this.findDlg.show2({ owner: this.jsd });
    },

    showFindReplaceDlg2: function (action) {
        var data = this.findDlg.form.getData();
        if (scil.Utils.isNullOrEmpty(data.finding) || action == "replaceall" && scil.Utils.isNullOrEmpty(data.replacewith)) {
            scil.Utils.alert("Find and Replace With cannot be blank");
            return;
        }

        if (action == "find")
            this.find(data.finding, false, data.monomertype, data.selectedonly);
        else if (action == "findall")
            this.find(data.finding, true, data.monomertype, data.selectedonly);
        else if (action == "replaceall")
            this.replaceAll(data.finding, data.replacewith, data.monomertype, data.selectedonly);
    },

    getSelectedAtoms: function() {
        var ret = [];
        var atoms = this.jsd.m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            if (atoms[i].selected)
                ret.push(atoms[i]);
        }
        return ret;
    },

    find: function (a, findall, monomertype, selectedonly) {
        var atoms = selectedonly ? this.getSelectedAtoms() : this.jsd.m.atoms;
        this.jsd.m.setSelected(false);

        var n = 0;
        var atom = null;
        if (/^[0-9]+$/.test(a)) {
            var aaid = parseInt(a);
            for (var i = 0; i < atoms.length; ++i) {
                if (atoms[i].bio != null && aaid == atoms[i].bio.id && (monomertype == "" || monomertype == atoms[i].biotype())) {
                    ++n;
                    atoms[i].selected = true;
                    atom = atoms[i];
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < atoms.length; ++i) {
                if (a == atoms[i].elem && (monomertype == "" || monomertype == atoms[i].biotype())) {
                    ++n;
                    atoms[i].selected = true;
                    if (!findall) {
                        atom = atoms[i];
                        break;
                    }
                }
            }
        }

        if (findall) {
            scil.Utils.alert(n + " node(s) found");
        }
        else {
            if (n == 0) {
                scil.Utils.alert("Cannot find " + a);
            }
            else {
                org.helm.webeditor.Interface.scaleCanvas(this.jsd);
                var dx = this.jsd.dimension.x / 2 - atom.p.x;
                var dy = this.jsd.dimension.y / 2 - atom.p.y;
                this.jsd.m.offset(dx, dy);
            }
        }

        if (n > 0)
            this.jsd.redraw();
    },

    replaceAll: function (a, a2, monomertype, selectedonly) {
        var n = 0;
        var cloned = this.jsd.clone();
        if (/^[0-9]+$/.test(a)) {
            var aaid = parseInt(a);
            var atoms = selectedonly ? this.getSelectedAtoms() : this.jsd.m.atoms;
            for (var i = 0; i < atoms.length; ++i) {
                if (atoms[i].bio != null && aaid == atoms[i]._aaid && (monomertype == "" || monomertype == atoms[i].biotype())) {
                    if (this.setNodeType(atoms[i].elem, atoms[i].biotype(), a2))
                        ++n;
                    break;
                }
            }
        }
        else {
            n = this.replaceMonomer(monomertype, a, a2, selectedonly);
        }

        if (n > 0) {
            this.jsd.pushundo(cloned);
            this.jsd.refresh(true);
        }

        scil.Utils.alert(n + " node(s) replaced");
    },

    dblclickMomonor: function (type, monomer) {
        if (monomer == "null")
            return;

        var list = [];
        var atoms = this.jsd.m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            if (atoms[i].selected && atoms[i].biotype() == type && atoms[i].elem != monomer)
                list.push(atoms[i]);
        }

        if (list.length > 0) {
            this.jsd.pushundo();
            for (var i = 0; i < list.length; ++i)
                this.setNodeType(list[i], list[i].biotype(), monomer);
            this.jsd.refresh(true);
        }

        return list.length;
    },

    isHelmCmd: function (cmd) {
        return cmd == "helm_nucleotide" || cmd == "helm_base" || cmd == "helm_sugar" || cmd == "helm_chem" || cmd == "helm_aa" || cmd == "helm_linker";
    },

    createIsolatedMonomer: function (cmd, a) {
        if (cmd == "helm_nucleotide") {
            var m = this.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR);
            this.setNodeType(a, org.helm.webeditor.HELM.SUGAR, m);

            if (org.helm.webeditor.Monomers.hasR(org.helm.webeditor.HELM.SUGAR, m, "R3")) {
                var a3 = this.addNode(org.helm.webeditor.Interface.createPoint(a.p.x, a.p.y + this.jsd.bondlength * org.helm.webeditor.bondscale), org.helm.webeditor.HELM.BASE, this.getDefaultNodeType(org.helm.webeditor.HELM.BASE));
                this.addBond(a, a3, 3, 1);
            }

            var linker = this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER);
            if (linker == null || linker == "null")
                return;

            var a2 = this.addNode(org.helm.webeditor.Interface.createPoint(a.p.x + this.jsd.bondlength * org.helm.webeditor.bondscale, a.p.y), org.helm.webeditor.HELM.LINKER, linker);
            this.addBond(a, a2, 2, 1);
        }
        else if (cmd == "helm_base") {
            this.setNodeType(a, org.helm.webeditor.HELM.BASE, this.getDefaultNodeType(org.helm.webeditor.HELM.BASE));
        }
        else if (cmd == "helm_sugar") {
            this.setNodeType(a, org.helm.webeditor.HELM.SUGAR, this.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR));
        }
        else if (cmd == "helm_linker") {
            this.setNodeType(a, org.helm.webeditor.HELM.LINKER, this.getDefaultNodeType(org.helm.webeditor.HELM.LINKER));
        }
        else if (cmd == "helm_aa") {
            this.setNodeType(a, org.helm.webeditor.HELM.AA, this.getDefaultNodeType(org.helm.webeditor.HELM.AA));
        }
        else if (cmd == "helm_chem") {
            this.setNodeType(a, org.helm.webeditor.HELM.CHEM, this.getDefaultNodeType(org.helm.webeditor.HELM.CHEM));
        }
        else {
            return false;
        }

        return true;
    }
});
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Chain = scil.extend(scil._base, {
    constructor: function (id) {
        this.id = id;
        this.bonds = [];
        this.atoms = [];
        this.bases = [];
    },

    expand: function (plugin) {
        var m1 = null;
        var m2 = null;
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var b = this.bases[i];

            var mon = org.helm.webeditor.Monomers.getMonomer(a);
            var m2 = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(mon));

            if (b != null) {
                var mb = org.helm.webeditor.Monomers.getMonomer(b);
                var m3 = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(mb));
                org.helm.webeditor.MolViewer.mergeMol(m2, "R3", m3, "R1");
            }

            if (m1 == null) {
                m1 = m2;
            }
            else {
                var r1, r2;
                var bond = this.bonds[i - 1];
                if (bond.a2 == a) {
                    r2 = bond.r2;
                    r1 = bond.r1;
                }
                else {
                    r2 = bond.r1;
                    r1 = bond.r2;
                }

                if (plugin != null) {
                    if (i == 1 && plugin.hasSpareR(this.atoms[0], r2))
                        org.helm.webeditor.MolViewer.capRGroup(m1, "R" + r2, org.helm.webeditor.Monomers.getMonomer(this.atoms[0]));
                    if (i == n - 1 && plugin.hasSpareR(a, r1))
                        org.helm.webeditor.MolViewer.capRGroup(m2, "R" + r1, mon);
                }
                org.helm.webeditor.MolViewer.mergeMol(m1, "R" + r1, m2, "R" + r2);
            }
        }

        return m1;
    },

    isCircle: function () {
        return this.atoms.length >=3 && this.atoms[0] == this.atoms[this.atoms.length - 1];
    },

    resetIDs: function () {
        var aaid = 0;
        var baseid = 0;

        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var biotype = a.biotype();
            if (biotype == org.helm.webeditor.HELM.AA) {
                a.bio.id = ++aaid;
                if (aaid == 1) {
                    a.bio.annotation = "n";
                }
                else {
                    a.bio.annotation = null;
                }
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

    setFlag: function(f) {
        for (var i = 0; i < this.atoms.length; ++i)
            this.atoms[i].f = f;
        for (var i = 0; i < this.bonds.length; ++i)
            this.bonds[i].f = f;
    },

    containsAtom: function(a) {
        return scil.Utils.indexOf(this.atoms, a) != -1;
    },

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

    layoutCircle: function (bondlength) {
        var rect = this.getRect();
        var origin = rect.center();

        var delta = org.helm.webeditor.bondscale * bondlength;
        var deg = 360 / (this.atoms.length - 1);
        var radius = (delta / 2) / Math.sin((deg / 2) * Math.PI / 180);

        var a = this.atoms[0];
        a.p = org.helm.webeditor.Interface.createPoint(origin.x + radius, origin.y);
        for (var i = 1; i < this.atoms.length - 1; ++i) {
            this.atoms[i].p = this.atoms[i - 1].p.clone().rotateAround(origin, -deg);
        }
    },
  
    move: function (delta) {
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 0; i < n; ++i) {
            this.atoms[i].p.offset2(delta);
            var a = this.bases[i];
            if (a != null)
                a.p.offset2(delta);
        }
    },
  
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


    getRect: function () {
        var a = this.atoms[0];
        var x1 = a.p.x;
        var y1 = a.p.y;
        var x2 = x1;
        var y2 = y1;

        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        for (var i = 1; i < n; ++i) {
            var p = this.atoms[i].p;
            if (p.x < x1)
                x1 = p.x;
            else if (p.x > x2)
                x2 = p.x;
            if (p.y < y1)
                y1 = p.y;
            else if (p.y > y2)
                y2 = p.y;
        }

        return org.helm.webeditor.Interface.createRect(x1, y1, x2 - x1, y2 - y1);
    },

    getSequence: function (highlightselection) {
        var s = "";
        var n = this.isCircle() ? this.atoms.length - 1 : this.atoms.length;
        var lastbt = null;
        for (var i = 0; i < n; ++i) {
            var a = this.atoms[i];
            var bt = a.biotype();
            if (bt == org.helm.webeditor.HELM.AA)
            {
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
                    if (a.bio.annotation == "5'ss")
                        ret.annotations.push(seqid + "{ss}");
                    else if (a.bio.annotation == "5'as")
                        ret.annotations.push(seqid + "{as}");
                }

                if (i > 0) {
                    var b = this.bonds[i - 1];
                    var r1 = b.a1 == a ? b.r2 : b.r1;
                    var r2 = b.a1 == a ? b.r1 : b.r2;

                    a._aaid = 1;
                    if (b.a1 == a)
                        conn = b.a2._aaid + ":R" + r2 + "-" + b.a1._aaid + ":R" + r1;
                    else
                        conn = b.a1._aaid + ":R" + r1 + "-" + b.a2._aaid + ":R" + r2;
                    if (lastseqid != null) {
                        ret.connections.push(lastseqid + "," + seqid + "," + conn);
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
            if (aaid > 1 && !(i > 0 && a.biotype() == org.helm.webeditor.HELM.LINKER && this.atoms[i - 1].biotype() == org.helm.webeditor.HELM.SUGAR))
                sequence += ".";
            sequence += org.helm.webeditor.IO.getCode(a, highlightselection);

            if (this.bases[i] != null) {
                var b = this.bases[i];
                sequence += org.helm.webeditor.IO.getCode(b, highlightselection, true);
                b._aaid = ++aaid;
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
            ret.connections.push(firstseqid + "," + lastseqid + "," + conn);
        }
    },

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
    getChain: function (m, startatom) {
        if (startatom == null)
            return null;
        var chains = this._getChains(m, startatom);
        return chains == null ? null : chains[0];
    },

    getChains: function (m, branchcollection) {
        return this._getChains(m, null, branchcollection);
    },

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

                if (a.biotype() == org.helm.webeditor.HELM.AA || a.biotype() == org.helm.webeditor.HELM.SUGAR) {
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
});﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Layout = {
    clean: function (m, bondlength, a) {
        //m.clearFlag();
        var chains = org.helm.webeditor.Chain._getChains(m, a);

        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];
            if (chain.isCircle())
                chain.layoutCircle(bondlength);
            else
                chain.layoutLine(bondlength);
            chain.layoutBases();

            //chain.setFlag(true);
            chain.resetIDs();
        }

        this.layoutCrossChainBonds(m, chains, bondlength);
        //this.layoutBranches(m);
    },

    resetIDs: function(m) {
        var chains = org.helm.webeditor.Chain._getChains(m);
        for (var i = 0; i < chains.length; ++i)
            chains[i].resetIDs();
    },

    layoutCrossChainBonds: function (m, chains, bondlength) {
        m.clearFlag();
        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];
            for (var k = 0; k < chain.atoms.length; ++k)
                chain.atoms[k].flag = i;
        }

        var fixed = {};

        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1.flag != null && b.a2.flag != null && b.a1.flag != b.a2.flag) {
                var a1, a2;
                if (fixed[b.a1.flag] && fixed[b.a2.flag]) {
                    continue;
                }
                else if (fixed[b.a1.flag]) {
                    a1 = b.a1;
                    a2 = b.a2;
                }
                else if (fixed[b.a2.flag]) {
                    a1 = b.a2;
                    a2 = b.a1;
                }
                else if (b.a1.flag > b.a2.flag) {
                    a1 = b.a2;
                    a2 = b.a1;
                }
                else {
                    a1 = b.a1;
                    a2 = b.a2;
                }
                var delta = a1.p.clone().offset(0, bondlength * 3).offset(-a2.p.x, -a2.p.y);
                chains[a2.flag].move(delta);

                fixed[a1.flag] = true;
                fixed[a2.flag] = true;
            }
        }
    },

    layoutBranches: function (m) {
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (!b.f && b.a1.f != b.a2.f) {
                var center = b.a1.f ? b.a1 : b.a2;
                var a = b.a1.f ? b.a2 : b.a1;

                var b1 = null;
                var b2 = null;
                var bonds = m.getNeighborBonds(center);
                for (var k = bonds.length - 1; k >= 0; --k) {
                    var n = bonds[k];
                    if (n.f) {
                        if (b1 == null && n.a1 == center && n.r1 == 2 || n.a2 == center && n.r2 == 2) {
                            b1 = n;
                            bonds.splice(i, 0);
                        }
                        else if (b2 == null && n.a1 == center && n.r1 == 1 || n.a2 == center && n.r2 == 1) {
                            b2 = n;
                            bonds.splice(i, 0);
                        }
                    }
                }

                if (b1 != null && b2 != null) {
                    var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                    var a2 = b2.a1 == center ? b2.a2 : b2.a1;

                    var ang = center.p.angleAsOrigin(a1.p, a2.p);
                    if (Math.abs(ang - 180) > 10)
                        a.p = a1.p.clone().rotateAround(center.p, ang / 2);
                    else
                        a.p = a1.p.clone().rotateAround(center.p, 90);
                }
                else if (b1 != null) {
                    var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                    a.p = a1.p.clone().rotateAround(center.p, 90);
                }
                else if (b2 != null) {
                    var a2 = b2.a1 == center ? b2.a2 : b2.a1;
                    a.p = a2.p.clone().rotateAround(center.p, -90);
                }

                if (b1 != null || b2 != null)
                    b.f = b.a1.f = b.a2.f = true;
            }
        }
    }
};
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

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

        for (var i = 0; i < branches.bonds.length; ++i) {
            var b = branches.bonds[i];
            var c1 = this.findChainID(ret.chains, b.a1);
            var c2 = this.findChainID(ret.chains, b.a2);

            var s = c1 + "," + c2 + "," + b.a1._aaid + ":R" + b.r1 + "-" + b.a2._aaid + ":R" + b.r2;
            ret.connections.push(s);
        }

        var s = "";
        for (var k in ret.sequences)
            s += (s == "" ? "" : "|") + k + "{" + ret.sequences[k] + "}";

        if (s == "")
            return s;

        s += "$";
        for (var i = 0; i < ret.connections.length; ++i)
            s += (i > 0 ? "|" : "") + ret.connections[i];

        s += "$$";

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

    findChainID: function(chains, a) {
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
                var tt = ss[i].split(',');
                if (tt.length != 3) {
                    //error ???
                }

                var tt2 = tt[2].split('-');
                if (tt2.length != 2) {
                    //error ???
                }
                var c1 = tt2[0].split(':');
                var c2 = tt2[1].split(':');
                if (c1.length != 2 || c2.length != 2) {
                    //error ???
                }

                var aa1 = parseInt(c1[0]);
                var r1 = parseInt(c1[1].substr(1));
                var aa2 = parseInt(c2[0]);
                var r2 = parseInt(c2[1].substr(1));

                var chain1 = chains[tt[0]];
                var chain2 = chains[tt[1]];
                var atom1 = chain1.getAtomByAAID(aa1);
                var atom2 = chain2.getAtomByAAID(aa2);

                //chain.bonds.push(plugin.addBond(atom1, atom2, r1, r2));
                plugin.addBond(atom1, atom2, r1, r2);
            }
        }

        // ???
        p = remained == null ? -1 : remained.indexOf("$");
        if (p >= 0) {
            s = remained.substr(0, p);
            remained = remained.substr(p + 1);
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
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.MonomerExplorer = scil.extend(scil._base, {
    constructor: function (parent, plugin, options) {
        this.plugin = plugin;
        this.options = options == null ? {} : options;
        var w = this.options.monomerwidth > 0 ? this.options.monomerwidth : 50;
        this.kStyle = { borderRadius: "5px", border: "solid 1px gray", backgroundRepeat: "no-repeat", display: "table", width: w, height: w, float: "left", margin: 2 };

        if (this.options.mexuseshape)
            this.kStyle.border = null;

        //this.lastselect = {};
        this.selected = {};
        this.selected[org.helm.webeditor.HELM.BASE] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.BASE);
        this.selected[org.helm.webeditor.HELM.LINKER] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.LINKER);
        this.selected[org.helm.webeditor.HELM.SUGAR] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.SUGAR);
        this.selected[org.helm.webeditor.HELM.AA] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.AA);
        this.selected[org.helm.webeditor.HELM.CHEM] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.CHEM);

        var me = this;
        this.div = scil.Utils.createElement(parent, "div", null, { fontSize: this.options.mexfontsize == null ? "90%" : this.options.mexfontsize });
        if (this.options.mexfind) {
            var d = scil.Utils.createElement(this.div, "div", null, { background: "#eee", borderBottom: "solid 1px gray", padding: "4px 0 4px 0" });
            var tbody = scil.Utils.createTable(d, 0, 0);
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", "Quick Replace:", null, { colSpan: 3 });
            this.findtype = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "select", null, { width: 100 });
            scil.Utils.listOptions(this.findtype, org.helm.webeditor.monomerTypeList(), null, true, false);

            tr = scil.Utils.createElement(tbody, "tr");
            this.findinput = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input", null, { width: 60 });
            scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "span", "&rarr;");
            this.findreplace = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input", null, { width: 60 });
            scil.Utils.createButton(scil.Utils.createElement(tr, "td", null, { textAlign: "right" }), { label: "Update", onclick: function () { me.findReplace(); } });
        }
        if (this.options.mexfilter != false) {
            var d = scil.Utils.createElement(this.div, "div", null, { background: "#eee", borderBottom: "solid 1px gray", padding: "4px 0 4px 0" });
            var tbody = scil.Utils.createTable(d, 0, 0);
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", JSDraw2.Language.res("Filter") + ":", { paddingLeft: "5px" });
            this.filterInput = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input");
            scil.connect(this.filterInput, "onkeyup", function (e) { me.filter(e); });
        }

        var tabs = [];
        if (this.options.mexmonomerstab)
            tabs.push({ caption: "Monomers", tabkey: "monomers" });
        else
            this.addMonomerTabs(tabs);
        tabs.push({ caption: "Rules", tabkey: "rule" });

        var width = this.options.width != null ? this.options.width : 300;
        var height = this.options.height != null ? this.options.height : 400;
        this.tabs = new scil.Tabs(scil.Utils.createElement(this.div, "div", null, { padding: "5px" }), {
            onShowTab: function (td) { me.onShowTab(td, height); },
            tabpadding: this.options.mexmonomerstab ? "10px" : "5px 2px 1px 2px",
            tabs: tabs,
            marginBottom: 0
        });

        this.dnd = this.createDnD(this.div);
        scil.connect(document.body, "onmousemove", function (e) { me.showMol(e); });

        org.helm.webeditor.MonomerExplorer.loadNucleotides();
    },

    addMonomerTabs: function(tabs) {
        if (this.options.mexfavoritetab != false)
            tabs.push({ caption: "Favorite", tabkey: "favorite" });

        tabs.push({ caption: "Chem", tabkey: "chem" });
        tabs.push({ caption: "Peptide", tabkey: "aa" });
        tabs.push({ caption: "RNA", tabkey: "rna" });
    },

    findReplace: function() {
        this.plugin.replaceAll(this.findinput.value, this.findreplace.value, this.findtype.value);
    },

    filter: function (e) {
        var key = this.tabs.currentTabKey();
        if (key == "rule") {
            org.helm.webeditor.RuleSetApp.filterRules(this.rules, this.filterInput.value);
        }
        else {
            this.filterGroup(this.tabs.dom, this.filterInput.value);
        }


        //var tab = null;
        //if (key == "monomers") {
        //    key = this.monomerstabs.currentTabKey();
        //    if (key == "chem" || key == "aa")
        //        tab = this.monomerstabs.currenttab;
        //    else if (key == "rna")
        //        tab = this.rnatabs.currenttab;
        //}
        //else {
        //    tab = this.tabs.currenttab;
        //}

        //this.filterGroup(tab.clientarea, this.filterInput.value);
    },

    filterGroup: function (container, s) {
        var list = container.getElementsByTagName("DIV");

        s = scil.Utils.trim(s).toLowerCase();
        if (s == "") {
            for (var i = 0; i < list.length; ++i) {
                var d = list[i];
                if (d.getAttribute("helm") == null)
                    continue;

                d.style.display = "table";
            }
        }
        else {
            for (var i = 0; i < list.length; ++i) {
                var d = list[i];
                var type = d.getAttribute("helm");
                if (scil.Utils.isNullOrEmpty(type))
                    continue;

                var name = scil.Utils.getInnerText(d);
                var f = scil.Utils.startswith(name.toLowerCase(), s);//name.toLowerCase().indexOf(s) >= 0;
                if (!f) {
                    var m = org.helm.webeditor.Monomers.getMonomer(type, name);
                    var fullname = m == null ? null : m.n;
                    f = fullname == null ? false : scil.Utils.startswith(fullname.toLowerCase(), s); //fullname.toLowerCase().indexOf(s) >= 0;
                }

                if (f)
                    d.style.display = "table";
                else
                    d.style.display = "none";
            }
        }
    },

    reloadTab: function (type) {
        var key = null;
        switch (type) {
            case "nucleotide":
                key = type;
                break;
            case org.helm.webeditor.HELM.AA:
                key = "aa";
                break;
            case org.helm.webeditor.HELM.CHEM:
                key = "chem";
                break;
            case org.helm.webeditor.HELM.BASE:
                key = "base";
                break;
            case org.helm.webeditor.HELM.LINKER:
                key = "linker";
                break;
            case org.helm.webeditor.HELM.SUGAR:
                key = "sugar";
                break;
            default:
                return;
        }

        var td = this.tabs.findTab(key);
        if (td == null && this.monomerstabs != null)
            td = this.monomerstabs.findTab(key);
        if (td == null)
            td = this.rnatabs.findTab(key);

        if (td != null)
            this.onShowTab(td, null, true);
    },

    reloadTabs: function () {
        var list = this.tabs.tr.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td = list[i];
            scil.Utils.removeAll(td.clientarea);
            td._childrencreated = false;
        }

        this.onShowTab(this.tabs.currenttab);
    },

    onShowTab: function (td, height, forcerecreate) {
        if (td == null)
            return;

        var key = td.getAttribute("key");
        if (forcerecreate || key == "favorite" && org.helm.webeditor.MonomerExplorer.favorites.changed) {
            td._childrencreated = false;
            if (key == "favorite")
                org.helm.webeditor.MonomerExplorer.favorites.changed = false;
        }

        if (this.plugin != null && this.plugin.jsd != null)
            this.plugin.jsd.doCmd("helm_" + key);
        if (td._childrencreated)
            return;
        td._childrencreated = true;

        if (height == null)
            height = td._height;
        else
            td._height = height;

        var me = this;
        var div = td.clientarea;
        scil.Utils.unselectable(div);
        scil.Utils.removeAll(div);

        if (key == "favorite") {
            var d = scil.Utils.createElement(div, "div", null, { width: "100%", height: height, overflowY: "scroll" });
            this.recreateFavorites(d);
        }
        else if (key == "rna") {
            var d = scil.Utils.createElement(div, "div");
            this.createMonomerGroup3(d, "RNA", height, 0, false);
        }
        else if (key == "nucleotide") {
            var dict = org.helm.webeditor.MonomerExplorer.loadNucleotides();
            var list = scil.Utils.getDictKeys(dict);
            this.createMonomerGroup4(div, key, list);
        }
        else if (key == "aa") {
            var d = scil.Utils.createElement(div, "div", null, { width: "100%", height: height, overflowY: "scroll" });
            dojo.connect(d, "onmousedown", function (e) { me.select(e); });
            dojo.connect(d, "ondblclick", function (e) { me.dblclick(e); });
            this.createMonomerGroup4(d, org.helm.webeditor.HELM.AA, null, false, this.options.mexgroupanalogs != false);
        }
        else if (key == "chem") {
            var d = scil.Utils.createElement(div, "div", null, { width: "100%", height: height, overflowY: "scroll" });
            this.createMonomerGroup(d, org.helm.webeditor.HELM.CHEM);
        }
        else if (key == "base") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.BASE, null, null, this.options.mexgroupanalogs != false);
        }
        else if (key == "sugar") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.SUGAR, null);
        }
        else if (key == "linker") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.LINKER, null, true);
        }
        else if (key == "rule") {
            var d = scil.Utils.createElement(div, "div", null, { width: "100%", height: height, overflowY: "scroll" });
            this.rules = org.helm.webeditor.RuleSet.listRules(d, function (script) { me.plugin.applyRule(script); }, function (scripts) { me.plugin.applyRules(scripts); });
        }
        else if (key == "monomers") {
            var d = scil.Utils.createElement(div, "div", null, { paddingTop: "5px" });

            var ht = height - 30;
            if (this.options.canvastoolbar == false) {
                var b = scil.Utils.createElement(d, "div", "<img src='" + scil.Utils.imgSrc("helm/arrow.png") + "' style='vertical-align:middle'>Mouse Pointer", { cursor: "pointer", padding: "2px", border: "solid 1px gray", margin: "5px" });
                scil.connect(b, "onclick", function () { me.plugin.jsd.doCmd("lasso"); });
                ht -= 23;
            }

            var tabs = [];
            this.addMonomerTabs(tabs);
            this.monomerstabs = new scil.Tabs(d, {
                onShowTab: function (td) { me.onShowTab(td, ht); },
                tabpadding: "5px 2px 1px 2px",
                tabs: tabs,
                marginBottom: 0
            });
        }
    },

    getMonomerDictGroupByAnalog: function (type) {
        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        for (var k in set)
            set[k].id = k;

        var ret = {};
        var aa = type == org.helm.webeditor.HELM.AA;
        if (aa) {
            ret["C-Term"] = [];
            ret["N-Term"] = [];
        }

        for (var k in set) {
            var m = set[k];
            var na = m.na;
            if (aa) {
                if (m.at.R1 == null)
                    na = "C-Term";
                else if (m.at.R2 == null)
                    na = "N-Term";
            }
            if (scil.Utils.isNullOrEmpty(na))
                na = "X";
            if (ret[na] == null)
                ret[na] = [];
            ret[na].push(m);
        }

        for (var k in ret)
            ret[k] = this.getMonomerNames(ret[k]);

        return ret;
    },

    getMonomerList: function (list, type, addnull) {
        if (list != null) {
            list.sort();
            return list;
        }

        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        for (var k in set)
            set[k].id = k;
        list = scil.Utils.getDictValues(set);
        return this.getMonomerNames(list, addnull);
    },

    getMonomerNames: function(list, addnull) {
        var ret = [];
        if (addnull)
            ret.push("null");

        var fun = function (a, b) {
            if (a.na == b.na) {
                if (a.id == b.id)
                    return 0;
                else if (a.id.length != b.id.length && (a.id.length == 1 || b.id.length == 1))
                    return a.id.length > b.id.length ? 1 : -1;
                else
                return a.id > b.id ? 1 : -1;
            }
            else {
                return a.na < b.na ? 1 : -1;
            }
        };
        list.sort(fun);
        for (var i = 0; i < list.length; ++i)
            ret.push(list[i].id);

        return ret;
    },

    createMonomerGroup: function (div, type, list, addnull) {
        var me = this;
        list = this.getMonomerList(list, type, addnull);
        div.style.overflowY = "scroll";
        this._listMonomers(div, list, type, this.options.mexfavoritefirst);
        dojo.connect(div, "onmousedown", function (e) { me.select(e); });
        dojo.connect(div, "ondblclick", function (e) { me.dblclick(e); });
    },

    createMonomerGroup3: function (div, group, height, i, createbar) {
        var me = this;
        var parent = scil.Utils.createElement(div, "div");
        if (createbar) {
            var bar = scil.Utils.createElement(parent, "div", group + ":", { background: "#ddd", borderTop: "solid 1px #aaa", marginTop: i == 0 ? null : "1px" });
            if (i > 0)
                new scil.Resizable(bar, { direction: "y", mouseovercolor: "#aaf", onresize: function (delta, resizable) { return me.onresize(delta, i); } });
        }

        var d = scil.Utils.createElement(parent, "div");
        dojo.connect(d, "onmousedown", function (e) { me.select(e); });
        dojo.connect(d, "ondblclick", function (e) { me.dblclick(e); });

        if (group == "RNA") {
            var half = "<div title='Nucleotide (Combined)' style='font-size: 80%;padding-left:20px;background-repeat:no-repeat;background-position:left center;background-image:";

            var base = org.helm.webeditor.Monomers.bases["A"] == null ? "a" : "A";
            var linker = org.helm.webeditor.Monomers.linkers["P"] == null ? "p" : "P";
            var sugar = org.helm.webeditor.Monomers.sugars["R"] == null ? "r" : "R";

            var tabs = [
                    { caption: half + scil.Utils.imgSrc("img/helm_nucleotide.gif", true) + "'>R(A)P</div>", tabkey: "nucleotide", onmenu: this.options.mexrnapinontab ? function (e) { me.onPinMenu(e); } : null },
                    { caption: half + scil.Utils.imgSrc("img/helm_base.gif", true) + "'>" + base + "</div>", tabkey: "base" },
                    { caption: half + scil.Utils.imgSrc("img/helm_sugar.gif", true) + "'>" + sugar + "</div>", tabkey: "sugar" },
                    { caption: half + scil.Utils.imgSrc("img/helm_linker.gif", true) + "'>" + linker + "</div>", tabkey: "linker" }
                ];
            this.rnatabs = new scil.Tabs(scil.Utils.createElement(d, "div", null, { paddingTop: "5px" }), {
                onShowTab: function (td) { me.onShowTab(td); }, //function (td) { me.onShowRNATab(td); },
                tabpadding: "2px",
                tabs: tabs,
                marginBottom: 0,
                clientareaheight: height - 40
            });
        }
        else if (group == "Chem") {
            d.style.overflowY = "scroll";
            d.style.height = height + "px";
            var list = this.getMonomerList(null, org.helm.webeditor.HELM.CHEM);
            this._listMonomers(d, list, org.helm.webeditor.HELM.CHEM, true);
        }
        else if (group == "Peptide") {
            d.style.overflowY = "scroll";
            d.style.height = height + "px";
            this.createMonomerGroup4(d, org.helm.webeditor.HELM.AA, null, false, this.options.mexgroupanalogs != false);
            //var list = this.getMonomerList(null, org.helm.webeditor.HELM.AA);
            //this._listMonomers(d, list, org.helm.webeditor.HELM.AA, true);
        }
    },

    onPinMenu: function(e) {
        if (this.pinmenu == null) {
            var me = this;
            var items = [{ caption: "Pin This Nucleotide" }];
            this.pinmenu = new scil.ContextMenu(items, function () { me.addNucleotide(); });
        }
        this.pinmenu.show(e.clientX, e.clientY);
    },

    createMonomerGroup4: function (div, type, list, addnull, groupbyanalog) {
        if (groupbyanalog) {
            var dict = this.getMonomerDictGroupByAnalog(type);

            var list = [];
            if (this.options.mexfavoritefirst) {
                for (var k in dict) {
                    var list2 = dict[k];
                    for (var i = 0; i < list2.length; ++i) {
                        var a = list2[i];
                        if (org.helm.webeditor.MonomerExplorer.favorites.contains(a, type))
                            list.push(a);
                    }
                }
                this._listMonomer2(div, scil.Utils.imgTag("star.png"), list, type, 20);
            }

            list = scil.Utils.getDictKeys(dict);
            list.sort();
            var list2 = [];
            for (var i = 0; i < list.length; ++i) {
                var k = list[i];
                if (k == "C-Term" || k == "N-Term") {
                    list2.push(k);
                    continue;
                }
                this._listMonomer2(div, k, dict[k], type, 20);
            }

            for (var i = 0; i < list2.length; ++i) {
                var k = list2[i];
                this._listMonomer2(div, k, dict[k], type, 60);
            }
        }
        else {
            if (type == "nucleotide" && !this.options.mexrnapinontab) {
                var me = this;
                var d = this.createMonomerDiv(div, scil.Utils.imgTag("pin.png"), null, null, false);
                d.setAttribute("title", "Pin This Nucleotide");
                scil.connect(d, "onclick", function () { me.addNucleotide(); })
            }
            var list = this.getMonomerList(list, type, addnull);
            this._listMonomers(div, list, type, this.options.mexfavoritefirst);
        }
    },

    addNucleotide: function(tab) {
        var notation = this.getCombo();
        var dict = org.helm.webeditor.MonomerExplorer.nucleotides;
        for (var k in dict) {
            if (notation == dict[k]) {
                scil.Utils.alert("There is a defined nucleotide called: " + k);
                return;
            }
        }

        var me = this;
        scil.Utils.prompt2({
            caption: "Pin Nucleotide: " + notation,
            message: "Please give a short name for the nucleotide, " + notation,
            callback: function (s) { if (org.helm.webeditor.MonomerExplorer.addCustomNucleotide(s, notation)) me.reloadTab("nucleotide"); }
        });
    },

    _listMonomer2: function (div, k, list, type, width) {
        if (list.length == 0)
            return;

        var tbody = scil.Utils.createTable(div, 0, 0);
        var tr = scil.Utils.createElement(tbody, "tr");
        var left = scil.Utils.createElement(tr, "td", null, { verticalAlign: "top" });
        var right = scil.Utils.createElement(tr, "td", null, { verticalAlign: "top" });
        scil.Utils.createElement(left, "div", k, { width: width, background: "#eee", border: "solid 1px #aaa", textAlign: "center" });
        this._listMonomers(right, list, type);
    },

    createMonomerGroupFav: function (div, caption, type) {
        var list = org.helm.webeditor.MonomerExplorer.favorites.getList(type);
        if (list == null || list.length == 0)
            return;

        list.sort();
        scil.Utils.createElement(div, "div", caption + ":", { background: "#ddd", border: "solid 1px #ddd" });
        var d = scil.Utils.createElement(div, "div", null, { display: "table", paddingBottom: "10px" });
        this._listMonomers(d, list, type, false);

        var me = this;
        dojo.connect(d, "onmousedown", function (e) { me.select(e); });
        dojo.connect(d, "ondblclick", function (e) { me.dblclick(e); });
    },

    _listMonomers: function (div, list, type, mexfavoritefirst) {
        if (mexfavoritefirst) {
            var list2 = [];
            for (var i = 0; i < list.length; ++i) {
                if (org.helm.webeditor.MonomerExplorer.favorites.contains(list[i], type))
                    this.createMonomerDiv(div, list[i], type);
                else
                    list2.push(list[i]);
            }

            for (var i = 0; i < list2.length; ++i)
                this.createMonomerDiv(div, list2[i], type);
        }
        else {
            for (var i = 0; i < list.length; ++i)
                this.createMonomerDiv(div, list[i], type);
        }
    },

    recreateFavorites: function (d) {
        this.createMonomerGroupFav(d, "Nucleotide", org.helm.webeditor.MonomerExplorer.kNucleotide);
        this.createMonomerGroupFav(d, "Base", org.helm.webeditor.HELM.BASE);
        this.createMonomerGroupFav(d, "Sugar", org.helm.webeditor.HELM.SUGAR);
        this.createMonomerGroupFav(d, "Linker", org.helm.webeditor.HELM.LINKER);
        this.createMonomerGroupFav(d, "Chemistry", org.helm.webeditor.HELM.CHEM);
        this.createMonomerGroupFav(d, "Peptide", org.helm.webeditor.HELM.AA);
    },

    createMonomerDiv: function (parent, name, type, style, star) {
        var fav = org.helm.webeditor.MonomerExplorer.favorites.contains(name, type);

        if (style == null)
            style = scil.clone(this.kStyle);
        else
            style = scil.apply(scil.clone(this.kStyle), style);

        if (this.options.mexusecolor != false) {
            var color;
            var custom = org.helm.webeditor.MonomerExplorer.customnucleotides;
            if (type == "nucleotide" && custom != null && custom[name] != null)
                color = { backgroundcolor: "#afa" };
            else
                color = style.backgroundColor = org.helm.webeditor.Monomers.getColor2(type, name);
            style.backgroundColor = color == null ? null : color.backgroundcolor;
        }

        if (star != false)
            style.backgroundImage = scil.Utils.imgSrc("img/star" + (fav ? "" : "0") + ".png", true);

        var div = scil.Utils.createElement(parent, "div", null, style, { helm: type, bkcolor: style.backgroundColor, star: (star ? 1 : null) });
        scil.Utils.unselectable(div);

        if (this.options.mexuseshape)
            this.setMonomerBackground(div, 0);

        var d = scil.Utils.createElement(div, "div", null, { display: "table-cell",  textAlign: "center", verticalAlign: "middle" });
        scil.Utils.createElement(d, "div", name, { overflow: "hidden", width: this.kStyle.width });

        return div;
    },

    setMonomerBackground: function (div, f) {
        var type = div.getAttribute("helm");
        if (scil.Utils.isNullOrEmpty(type))
            return;

        var bk = type.toLowerCase();
        if (type != org.helm.webeditor.MonomerExplorer.kNucleotide)
            bk = bk.substr(bk.indexOf('_') + 1);
        div.style.backgroundImage = scil.Utils.imgSrc("img/mon-" + bk + f + ".png", true);
    },

    getMonomerDiv: function (e) {
        var div = e.target || e.srcElement;
        if (div == null || div.tagName == null)
            return;

        for (var i = 0; i < 3; ++i) {
            var type = div.getAttribute("helm");
            if (!scil.Utils.isNullOrEmpty(type))
                break;
            div = div.tagName == "BODY" ? null : div.parentNode;
            if (div == null)
                break;
        }
        return scil.Utils.isNullOrEmpty(type) ? null : div;
    },

    createDnD: function (div) {
        var me = this;
        return new scil.DnD(div, {
            onstartdrag: function (e, dnd) {
                return me.getMonomerDiv(e);
            },
            oncreatecopy: function (e, dnd) {
                if (me.dnd.floatingbox == null) {
                    var maxZindex = scil.Utils.getMaxZindex();
                    var style = {
                        float: null, backgroundImage: null,
                        filter: 'alpha(opacity=80)', opacity: 0.8, color: org.helm.webeditor.MonomerExplorer.color,
                        backgroundColor: org.helm.webeditor.MonomerExplorer.backgroundcolor,
                        zIndex: (maxZindex > 0 ? maxZindex : 100) + 1, position: "absolute"
                    };
                    if (me.options.useshape)
                        style.backgroundColor = null;
                    me.dnd.floatingbox = me.createMonomerDiv(document.body, null, null, style, false);
                }
                me.dnd.floatingbox.style.display = "table";
                me.dnd.floatingbox.style.backgroundColor = org.helm.webeditor.MonomerExplorer.backgroundcolor;
                me.dnd.floatingbox.innerHTML = dnd.src.innerHTML;
                me.dnd.floatingbox.setAttribute("helm", dnd.src.getAttribute("helm"));
                if (me.options.useshape)
                    me.setMonomerBackground(me.dnd.floatingbox, 1);
                return me.dnd.floatingbox;

            },
            ondrop: function (e, dnd) {
                if (me.dnd.floatingbox == null)
                    return;

                me.dnd.floatingbox.style.display = "none";
                var type = me.dnd.floatingbox.getAttribute("helm");
                me.plugin.dropMonomer(type, scil.Utils.getInnerText(me.dnd.floatingbox), e);
            },
            oncancel: function (dnd) {
                if (me.dnd.floatingbox == null)
                    return;

                me.dnd.floatingbox.style.display = "none";
                var type = me.dnd.floatingbox.getAttribute("helm");
            }
        });
    },

    showMol: function (e) {
        var src = this.getMonomerDiv(e);
        if (src != null && !this.dnd.isDragging()) {
            var type = src.getAttribute("helm");
            var set = type == org.helm.webeditor.MonomerExplorer.kNucleotide ? org.helm.webeditor.MonomerExplorer.nucleotides : org.helm.webeditor.Monomers.getMonomerSet(type);
            var s = scil.Utils.getInnerText(src);
            var m = set[s];
            org.helm.webeditor.MolViewer.show(e, type, m, s);
        }
        else {
            var src = e.srcElement || e.target;
            if (!scil.Utils.isChildOf(src, this.plugin.jsd.div))
                org.helm.webeditor.MolViewer.hide();
        }
    },

    splitLists: function (set) {
        var lists = [[], [], [], []];
        for (var k in set) {
            var m = set[k];
            if (m.at.R1 == null)
                lists[2].push(k);
            else if (m.at.R2 == null)
                lists[3].push(k);
            else if (k.length == 1)
                lists[0].push(k);
            else
                lists[1].push(k);
        }

        return lists;
    },

    changeFavorite: function (div) {
        var f = div.getAttribute("star") != "1";

        if (f) {
            div.setAttribute("star", "1");
            div.style.backgroundImage = scil.Utils.imgSrc("img/star.png", true);
        }
        else {
            div.setAttribute("star", "");
            div.style.backgroundImage = scil.Utils.imgSrc("img/star0.png", true);
        }

        var type = div.getAttribute("helm");
        var s = scil.Utils.getInnerText(div);
        org.helm.webeditor.MonomerExplorer.favorites.add(s, f, type);

        //this.reloadTab(type);
    },

    select: function (e) {
        var div = this.getMonomerDiv(e);
       if (div != null) {
           var d = scil.Utils.getOffset(div, true);
           var scroll = scil.Utils.getParent(div.parentNode, "div");
           var dx = e.clientX - d.x + scroll.scrollLeft;
           var dy = e.clientY - d.y + scroll.scrollTop;
           if (dx >= 0 && dx < 16 && dy >= 0 && dy < 16) {
               // favorite
               this.changeFavorite(div);
               e.preventDefault();
               return;
           }
       }

        var helm = div == null ? null : div.getAttribute("helm");
        if (scil.Utils.isNullOrEmpty(helm))
            return;

        this.plugin.jsd.activate(true);

        var name = scil.Utils.getInnerText(div);
        if (helm == org.helm.webeditor.MonomerExplorer.kNucleotide) {
            var s = org.helm.webeditor.MonomerExplorer.nucleotides[name];
            var p1 = s.indexOf('(');
            var p2 = s.indexOf(")");
            var sugar = org.helm.webeditor.IO.trimBracket(s.substr(0, p1));
            var base = org.helm.webeditor.IO.trimBracket(s.substr(p1 + 1, p2 - p1 - 1));
            var linker = org.helm.webeditor.IO.trimBracket(s.substr(p2 + 1));

            if (scil.Utils.isNullOrEmpty(linker))
                linker = "null";

            this.selected[org.helm.webeditor.HELM.BASE] = base;
            this.selected[org.helm.webeditor.HELM.LINKER] = linker;
            this.selected[org.helm.webeditor.HELM.SUGAR] = sugar;

            if (this.rnatabs != null) {
                var tabs = this.rnatabs;
                tabs.findTab("nucleotide").childNodes[0].innerHTML = s;
                tabs.findTab("sugar").childNodes[0].innerHTML = sugar;
                tabs.findTab("linker").childNodes[0].innerHTML = linker;
                tabs.findTab("base").childNodes[0].innerHTML = base;
            }
        }
        else {
            name = org.helm.webeditor.IO.trimBracket(name);
            if (this.rnatabs != null) {
                var tab = null;
                var tabs = this.rnatabs;
                switch (helm) {
                    case org.helm.webeditor.HELM.SUGAR:
                        tab = tabs.findTab("sugar");
                        break;
                    case org.helm.webeditor.HELM.LINKER:
                        tab = tabs.findTab("linker");
                        break;
                    case org.helm.webeditor.HELM.BASE:
                        tab = tabs.findTab("base");
                        break;
                }
                if (tab != null)
                    tab.childNodes[0].innerHTML = name;
            }

            this.selected[helm] = name;
            if (tabs != null)
                tabs.findTab("nucleotide").childNodes[0].innerHTML = this.getCombo();
        }

        if (this.lastdiv != null) {
            this.lastdiv.style.color = "";
            if (this.options.mexuseshape) {
                this.setMonomerBackground(this.lastdiv, 0);
            }
            else {
                var s = this.lastdiv.getAttribute("bkcolor");
                this.lastdiv.style.backgroundColor = s == null ? "" : s;
            }
        }
        if (this.options.mexuseshape)
            this.setMonomerBackground(div, 1);
        else
            div.style.backgroundColor = org.helm.webeditor.MonomerExplorer.backgroundcolor;
        div.style.color = org.helm.webeditor.MonomerExplorer.color;
        this.lastdiv = div;

        if (this.plugin != null && this.plugin.jsd != null) {
            switch (helm) {
                case org.helm.webeditor.HELM.AA:
                    this.plugin.jsd.doCmd("helm_aa");
                    break;
                case org.helm.webeditor.HELM.CHEM:
                    this.plugin.jsd.doCmd("helm_chem");
                    break;
                case org.helm.webeditor.HELM.BASE:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_base");
                    break;
                case org.helm.webeditor.HELM.LINKER:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_linker");
                    break;
                case org.helm.webeditor.HELM.SUGAR:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_sugar");
                    break;
                case org.helm.webeditor.MonomerExplorer.kNucleotide:
                    this.plugin.jsd.doCmd("helm_nucleotide");
                    break;
            }
        }
    },

    getCombo: function () {
        var sugar = this.selected[org.helm.webeditor.HELM.SUGAR];
        var linker = this.selected[org.helm.webeditor.HELM.LINKER];
        var base = this.selected[org.helm.webeditor.HELM.BASE];
        var s = org.helm.webeditor.IO.getCode(sugar);
        if (!org.helm.webeditor.Monomers.hasR(org.helm.webeditor.HELM.SUGAR, sugar, "R3"))
            s += "()";
        else
            s += "(" + org.helm.webeditor.IO.getCode(base) + ")";
        if (linker != "null")
            s += org.helm.webeditor.IO.getCode(linker);
        return s;
    },

    dblclick: function (e) {
        var div = this.getMonomerDiv(e);
        var helm = div == null ? null : div.getAttribute("helm");
        if (org.helm.webeditor.isHelmNode(helm)) {
            if (this.plugin.dblclickMomonor(helm, scil.Utils.getInnerText(div)) == 0)
                scil.Utils.beep();
        }
    }
});


scil.apply(org.helm.webeditor.MonomerExplorer, {
    kUseShape: false,
    kNucleotide: "nucleotide",
    backgroundcolor: "blue",
    color: "white",
    customnucleotides: null,
    favorites: new scil.Favorite("monomers", function (name, f, type) { org.helm.webeditor.MonomerExplorer.onAddFavorite(name, f, type); }),

    nucleotides: {
        A: "r(A)p",
        C: "r(C)p",
        G: "r(G)p",
        T: "r(T)p",
        U: "r(U)p"
    },

    onAddFavorite: function (name, f, type) {
        if (!f && type == "nucleotide" && this.customnucleotides != null && this.customnucleotides[name] != null) {
            delete this.customnucleotides[name];
            this.saveNucleotides();
        }
    },

    addCustomNucleotide: function (name, notation) {
        name = scil.Utils.trim(name);
        if (scil.Utils.isNullOrEmpty(name)) {
            scil.Utils.alert("The short name cannot be blank");
            return false;
        }

        if (this.nucleotides[name] != null) {
            scil.Utils.alert("The short name is used for: " + this.nucleotides[name]);
            return false;
        }

        if (this.customnucleotides == null)
            this.customnucleotides = {};

        this.nucleotides[name] = notation;
        this.customnucleotides[name] = notation;
        this.saveNucleotides();
        this.favorites.add(name, true, "nucleotide");

        return true;
    },

    saveNucleotides: function () {
        var s = scil.Utils.json2str(this.customnucleotides);
        scil.Utils.createCookie("scil_helm_nucleotides", s);
    },

    loadNucleotides: function () {
        if (this._nucleotidesloaded)
            return this.nucleotides;

        if (this.nucleotides == null)
            this.nucleotides = [];

        this._nucleotidesloaded = true;
        var s = scil.Utils.readCookie("scil_helm_nucleotides");
        this.customnucleotides = scil.Utils.eval(s);
        if (this.customnucleotides != null && this.customnucleotides.length == null) {
            var list = {};
            for (var k in this.customnucleotides) {
                if (this.nucleotides[k] == null) {
                    list[k] = this.customnucleotides[k];
                    this.nucleotides[k] = this.customnucleotides[k];
                }
            }
            this.customnucleotides = list;
        }
        return this.nucleotides;
    },

    showDlg: function (jsd) {
        this.createDlg(jsd);
        this.dlg.show2({ owner: jsd, modal: false });
        jsd.helm.monomerexplorer = this.mex;
    },

    createDlg: function (jsd) {
        if (this.dlg != null)
            return;

        var div = scil.Utils.createElement(null, "div", null, { width: 500 });
        this.dlg = new scil.Dialog("Monomer Explorer", div);
        this.dlg.show2({ owner: jsd, modal: false });

        this.mex = new org.helm.webeditor.MonomerExplorer(div, jsd.helm, { height: 350 });
        this.dlg.moveCenter();
    }
});
﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.MolViewer = {
    dlg: null,
    jsd: null,
    molscale: 1,

    show: function (e, type, m, code) {
        this.clearTimer();
        var me = this;
        this.tm = setTimeout(function () { me.show2({ x: e.clientX, y: e.clientY }, type, m, code); }, 500);
    },

    clearTimer: function() {
        if (this.tm != null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
    },

    show2: function (xy, type, m, code) {
        this.tm = null;
        if (m == null)
            return;

        this.create();

        if (this.cur != (type + "." + code) || !this.dlg.isVisible()) {
            this.cur = type + "." + code;

            if (typeof (m) == "string") {
                var s = m;
                m = { n: m, m: this.assemblyMol(s) };
            }

            this.dlg.show2({ title: "<div style='font-size:80%'>" + (/*code + ": " + */m.n) + "</div>", modal: false, immediately: true });

            this.jsd.setMolfile(org.helm.webeditor.monomers.getMolfile(m));

            var s = "<table cellspacing=0 cellpadding=0 style='font-size:80%'>";
            if (m.at != null) {
                for (var k in m.at)
                    s += "<tr><td>" + k + "=</td><td>&nbsp;" + m.at[k] + "</td></tr>";
            } 
            s += "</table>";
            this.rs.innerHTML = s;
        }

        var scroll = scil.Utils.scrollOffset();
        this.dlg.moveTo(xy.x + scroll.x + 10, xy.y + scroll.y + 10);
    },

    assemblyMol: function(s) {
        var p1 = s.indexOf('(');
        var p2 = s.indexOf(")");
        var sugar = s.substr(0, p1);
        var base = s.substr(p1 + 1, p2 - p1 - 1);
        var linker = s.substr(p2 + 1);

        var ms = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.SUGAR, org.helm.webeditor.IO.trimBracket(sugar));
        var ml = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.LINKER, org.helm.webeditor.IO.trimBracket(linker));
        var mb = org.helm.webeditor.Monomers.getMonomer(org.helm.webeditor.HELM.BASE, org.helm.webeditor.IO.trimBracket(base));

        var m1 = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(ms));
        var m2 = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(ml));
        var m3 = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(mb));

        this.mergeMol(m1, "R2", m2, "R1");
        this.mergeMol(m1, "R3", m3, "R1");

        return m1.getMolfile();
    },

    capRGroup: function (m, r, mon) {
        var cap = mon == null || mon.at == null ? null : mon.at[r];
        if (cap == "OH")
            cap = "O";
        else if (cap != "H" && cap != "X")
            return false;

        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1.alias == r || b.a2.alias == r) {
                m.setAtomType(b.a1.alias == r ? b.a1 : b.a2, cap);
                return true;
            }
        }
        return false;
    },

    mergeMol: function (m, r1, src, r2) {
        var t = null;
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1.alias == r1 || b.a2.alias == r1) {
                t = { b: b, a0: b.a1.alias == r1 ? b.a2 : b.a1, a1: b.a1.alias == r1 ? b.a1 : b.a2 };
                break;
            }
        }

        var s = null;
        for (var i = 0; i < src.bonds.length; ++i) {
            var b = src.bonds[i];
            if (b.a1.alias == r2 || b.a2.alias == r2) {
                s = { b: b, a0: b.a1.alias == r2 ? b.a2 : b.a1, a1: b.a1.alias == r2 ? b.a1 : b.a2 };
                break;
            }
        }

        if (t != null && s != null) {
            this.extendDistance(t.a0.p, t.a1.p, 2);
            this.extendDistance(s.a0.p, s.a1.p, 2);

            // align
            src.offset(t.a1.p.x - s.a0.p.x, t.a1.p.y - s.a0.p.y);
            var deg = t.a1.p.angleAsOrigin(t.a0.p, s.a1.p);
            src.rotate(t.a1.p, -deg);

            // merge
            m.atoms.splice(scil.Utils.indexOf(m.atoms, t.a1), 1);
            src.atoms.splice(scil.Utils.indexOf(src.atoms, s.a1), 1);
            src.bonds.splice(scil.Utils.indexOf(src.bonds, s.b), 1);

            if (t.b.a1 == t.a1)
                t.b.a1 = s.a0;
            else
                t.b.a2 = s.a0;
        }
        
        m.atoms = m.atoms.concat(src.atoms);
        m.bonds = m.bonds.concat(src.bonds);
        return m.getMolfile();
    },

    extendDistance: function (p0, p, s) {
        var dx = p.x - p0.x;
        var dy = p.y - p0.y;

        p.x = p0.x + s * dx;
        p.y = p0.y + s * dy;
    },

    create: function () {
        if (this.dlg != null)
            return;

        var fields = { jsd: { type: "jsdraw", width: 180, height: 130, scale: this.molscale, viewonly: true }, rs: { type: "html", viewonly: true, style: {borderTop: "solid 1px gray"} } };
        this.dlg = scil.Form.createDlgForm("", fields, null, { hidelabel: true, modal: false, noclose: true });
        this.jsd = this.dlg.form.fields.jsd.jsd;
        this.rs = this.dlg.form.fields.rs;
        this.dlg.hide(true);

        this.dlg.dialog.style.backgroundColor = "#fff";
        this.dlg.dialog.titleElement.style.borderBottom = "solid 1px #ddd";
        this.dlg.dialog.titleElement.style.textAlign = "center";
    },

    hide: function () {
        this.clearTimer();
        if (this.dlg != null && this.dlg.isVisible()) {
            this.dlg.hide(true);
        }
    }
};﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Formula = {
    getMF: function(m, html) {
        var stats = this.getAtomStats(m);

        var s = "";
        if (stats["C"] != null)
            s += "C" + this.subscription(stats["C"], html);
        if (stats["H"] != null)
            s += "H" + this.subscription(stats["H"], html);
        if (stats["N"] != null)
            s += "N" + this.subscription(stats["N"], html);
        if (stats["O"] != null)
            s += "O" + this.subscription(stats["O"], html);

        for (var e in stats) {
            if (e != "R" && e != "C" && e != "H" && e != "O" && e != "N")
                s += e + this.subscription(stats[e], html);
        }
        return s;
    },

    subscription: function (n, html) {
        if (n == 1)
            return "";
        return html ? "<sub>" + n + "</sub>" : n;
    },

    getMW: function (m) {
        var stats = this.getAtomStats(m);
        var sum = 0;
        for (var e in stats) {
            if (e != "R")
                sum += stats[e] * org.helm.webeditor.Interface.getElementMass(e);
        }
        return Math.round(sum * 10000) / 10000.0;
    },

    getAtomStats: function (m) {
        var atoms = [];
        var list = [];
        for (var i = 0; i < m.atoms.length; ++i) {
            var a = m.atoms[i];
            if (org.helm.webeditor.isHelmNode(a))
                list.push(a);
            else
                atoms.push(a);
        }

        // chemistry
        var ret = atoms.length == null ? null : org.helm.webeditor.Interface.getAtomStats(m, atoms);
        if (ret == null)
            ret = {};

        if (list.length == 0)
            return ret;

        for (var i = 0; i < list.length; ++i)
            this.countMonomer(ret, org.helm.webeditor.Monomers.getMonomer(list[i]));

        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (org.helm.webeditor.isHelmNode(b.a1))
                this.deduceR(ret, org.helm.webeditor.Monomers.getMonomer(b.a1), b.r1);
            if (org.helm.webeditor.isHelmNode(b.a2))
                this.deduceR(ret, org.helm.webeditor.Monomers.getMonomer(b.a2), b.r2);
        }

        return ret;
    },

    countMonomer: function (ret, m) {
        if (m.stats == null) {
            m.stats = org.helm.webeditor.Interface.molStats(org.helm.webeditor.monomers.getMolfile(m));
            for (var r in m.at) {
                var s = m.at[r];
                if (s == "H" || s == "OH") {
                    if (m.stats["H"] == null)
                        m.stats["H"] = 1;
                    else
                        ++m.stats["H"];
                }

                if (s == "OH") {
                    if (m.stats["O"] == null)
                        m.stats["O"] = 1;
                    else
                        ++m.stats["O"];
                }
            }
        }

        for (var e in m.stats) {
            if (ret[e] == null)
                ret[e] = m.stats[e];
            else
                ret[e] += m.stats[e];
        }
    },

    deduceR: function (ret, m, r) {
        if (m.at == null)
            return;

        var s = m.at["R" + r];
        if (s == "H") {
            --ret["H"];
        }
        else if (s == "OH") {
            --ret["H"];
            --ret["O"];
        }
    }
};﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Editor = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof parent == "string")
            parent = scil.byId(parent);
        this.canvas = null;

        var tr = scil.Utils.createElement(scil.Utils.createTable(parent, 0, 0), "tr");
        var left = scil.Utils.createElement(tr, "td", null, null, { valign: "top" });
        var right = scil.Utils.createElement(tr, "td", null, null, { valign: "top" });

        var me = this;
        var fn = function () {
            me.canvas = new JSDraw(right, options);
            if (options.showmonomerexplorer) {
                me.canvas.helm.monomerexplorer = new org.helm.webeditor.MonomerExplorer(left, me.canvas.helm, { width: 300, height: options.height - 45 });
                me.canvas._testdeactivation = function (e, ed) {
                    var src = e.target || e.srcElement;
                    return scil.Utils.hasAnsestor(src, me.canvas.helm.monomerexplorer.div);
                };
            }
            if (options.onloaded != null)
                options.onloaded(me);
        };

        if (options.monomerlibraryxml != null)
            org.helm.webeditor.monomers.loadFromUrl(options.monomerlibraryxml, function () { fn(); });
        else
            fn();
    }
});﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.App = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;
        this.init(parent);
    },

    calculateSizes: function () {
        var d = dojo.window.getBox();
        if (this.options.topmargin > 0)
            d.h -= this.options.topmargin;

        var leftwidth = 300;
        var rightwidth = d.w - 300 - 50;
        var topheight = d.h * 0.7;
        var bottomheight = d.h - topheight - 130;

        var ret = { height: 0, topheight: 0, bottomheight: 0, leftwidth: 0, rightwidth: 0 };
        ret.height = d.h - 90 - (this.options.mexfilter != false ? 30 : 0) - (this.options.mexfind ? 60 : 0);
        ret.leftwidth = 300;
        ret.rightwidth = d.w - 300 - 50;
        ret.topheight = d.h * 0.7;
        ret.bottomheight = d.h - topheight - 130;

        return ret;
    },

    init: function (parent) {
        var me = this;

        var sizes = this.calculateSizes();

        var tree = {
            caption: this.options.topmargin > 0 ? null : "Palette",
            marginBottom: "2px",
            marginTop: this.options.topmargin > 0 ? "17px" : null,
            onrender: function (div) { me.treediv = div; me.createPalette(div, sizes.leftwidth - 10, sizes.height); }
        };
        this.page = new scil.Page(parent, tree, { resizable: true, leftwidth: sizes.leftwidth });
        scil.Utils.unselectable(this.page.explorer.left);

        var control = this.page.addDiv();
        var sel = scil.Utils.createSelect(control, ["Detailed Sequence", "Sequence"], "Detailed Sequence", null, { border: "none" });
        scil.connect(sel, "onchange", function () { me.swapCanvasSequence(); });

        this.canvasform = this.page.addForm({
            //caption: "Canvas",
            type: "custom",
            marginBottom: "2px",
            oncreate: function (div) { me.createCanvas(div, sizes.rightwidth, sizes.topheight); }
        });

        this.handle = this.page.addResizeHandle(function (delta) { return me.onresize(delta); }, 8);

        this.sequencebuttons = [
            { label: "Format", type: "select", items: ["", "RNA", "Peptide"], key: "format" },
            { src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply Sequence", onclick: function () { me.updateCanvas("sequence", false); } },
            { src: scil.Utils.imgSrc("img/add.gif"), label: "Append", title: "Append Sequence", onclick: function () { me.updateCanvas("sequence", true); } }
        ];

        this.tabs = this.page.addTabs({ marginBottom: "2px", onShowTab: function () { me.updateProperties(); } });
        this.tabs.addForm({
            caption: "Sequence",
            type: "custom",
            tabkey: "sequence",
            buttons: this.options.sequenceviewonly ? null : this.sequencebuttons,
            oncreate: function (div) { me.createSequence(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "HELM",
            type: "custom",
            tabkey: "notation",
            buttons: this.options.sequenceviewonly ? null : [
                { src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply HELM Notation", onclick: function () { me.updateCanvas("notation", false); } },
                { src: scil.Utils.imgSrc("img/add.gif"), label: "Append", title: "Append HELM Notation", onclick: function () { me.updateCanvas("notation", true); } }
            ],
            oncreate: function (div) { me.createNotation(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "Properties",
            type: "custom",
            tabkey: "properties",
            oncreate: function (div) { me.createProperties(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "Structure View",
            type: "custom",
            tabkey: "structureview",
            oncreate: function (div) { me.createStructureView(div, sizes.rightwidth, sizes.bottomheight); }
        });
    },

    resizeWindow: function () {
        var sizes = this.calculateSizes();
        this.mex.tabs.resizeClientarea(0, sizes.height);
    },

    swapCanvasSequence: function () {
        var a = this.canvasform.form.dom;
        var h = this.handle;
        var b = this.tabs.tabs.dom;
        if (h.nextSibling == b) {
            a.parentNode.insertBefore(b, a);
            a.parentNode.insertBefore(h, a);
        }
        else {
            a.parentNode.insertBefore(b, a.nextSibling);
            a.parentNode.insertBefore(h, a.nextSibling);
        }
    },

    onresize: function (delta) {
        if (this.handle.nextSibling == this.tabs.tabs.dom) {
            var top = this.canvas.dimension.y;
            var bottom = scil.Utils.parsePixel(this.sequence.style.height);
            if (top + delta > 80 && bottom - delta > 20) {
                this.canvas.resize(0, top + delta);
                this.sequence.style.height = (bottom - delta) + "px";
                this.notation.style.height = (bottom - delta) + "px";
                this.properties.parent.style.height = (bottom - delta) + "px";
                this.structureview.resize(0, bottom - delta);
                return true;
            }
        }
        else {
            var top = scil.Utils.parsePixel(this.sequence.style.height);
            var bottom = this.canvas.dimension.y;
            if (top + delta > 20 && bottom - delta > 80) {
                this.sequence.style.height = (top + delta) + "px";
                this.notation.style.height = (top + delta) + "px";
                this.properties.parent.style.height = (top + delta) + "px";
                this.structureview.resize(0, top + delta);
                this.canvas.resize(0, bottom - delta);
                return true;
            }
        }
        return false;
    },

    createPalette: function (div, width, height) {
        var opt = scil.clone(this.options);
        opt.width = width;
        opt.height = height;
        this.mex = new org.helm.webeditor.MonomerExplorer(div, null, opt);
    },

    createCanvas: function (div, width, height) {
        div.style.border = "solid 1px #eee";

        var me = this;
        var args = {
            skin: "w8", showabout: this.options.showabout, showtoolbar: this.options.canvastoolbar != false, helmtoolbar: true, showmonomerexplorer: true,
            inktools: false, width: width, height: height, ondatachange: function () { me.updateProperties(); },
            onselectionchanged: function () { me.onselectionchanged(); },
            onselectcurrent: function (e, obj, ed) { me.onselectcurrent(e, obj, ed); }
        };

        this.canvas = org.helm.webeditor.Interface.createCanvas(div, args);
        this.canvas.helm.monomerexplorer = this.mex;
        this.mex.plugin = this.canvas.helm;

        this.canvas._testdeactivation = function (e, ed) {
            var src = e.target || e.srcElement;
            return scil.Utils.hasAnsestor(src, me.canvas.helm.monomerexplorer.div);
        };
    },

    onselectcurrent: function (e, obj, ed) {
        var a = JSDraw2.Atom.cast(obj);
        if (a == null || ed.start != null) {
            org.helm.webeditor.MolViewer.hide();
            return;
        }
        var type = a == null ? null : a.biotype();
        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        var s = a == null ? null : a.elem;
        var m = set == null ? null : set[s];
        org.helm.webeditor.MolViewer.show(e, type, m, s);
    },

    createSequence: function (div, width, height) {
        var atts = {};
        if (!this.options.sequenceviewonly)
            atts.contenteditable = "true";
        this.sequence = scil.Utils.createElement(div, "div", null, { width: width, height: height, overfloatY: "scroll" }, atts);
    },

    createNotation: function (div, width, height) {
        var atts = {};
        if (!this.options.sequenceviewonly)
            atts.contenteditable = "true";
        this.notation = scil.Utils.createElement(div, "div", null, { width: width, height: height, overfloatY: "scroll" }, atts);
    },

    createProperties: function (div, width, height) {
        var d = scil.Utils.createElement(div, "div", null, { width: width, overflow: "scroll", height: height });

        var fields = {
            mw: { label: "Molecular Weight", type: "number", unit: "Da" },
            mf: { label: "Molecular Formula" },
            ec: { label: "Extinction Coefficient" }
        };
        this.properties = new scil.Form({ viewonly: true });
        this.properties.render(d, fields, { immediately: true });
    },

    createStructureView: function (div, width, height) {
        var d = scil.Utils.createElement(div, "div", null, { width: width, height: height });
        this.structureview = new JSDraw2.Editor(d, { viewonly: true })
    },

    resize: function () {
        var d = dojo.window.getBox();
        var width = d.w;
        var height = d.h;
        var left = d.l;
        var top = d.t;
    },

    updateCanvas: function (key, append) {
        var format = null;
        if (this.sequencebuttons != null)
            format = this.getValueByKey(this.sequencebuttons, "format");

        var plugin = this.canvas.helm;
        var s = null;
        if (key == "sequence") {
            s = scil.Utils.trim(scil.Utils.getInnerText(this.sequence));
            // fasta
            s = s.replace(/[\n][>|;].*[\r]?[\n]/ig, '').replace(/^[>|;].*[\r]?[\n]/i, '');
            // other space
            s = s.replace(/[ \t\r\n]+/g, '')
        }
        else {
            s = scil.Utils.getInnerText(this.notation);
        }
        plugin.setSequence(s, format, plugin.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR), plugin.getDefaultNodeType(org.helm.webeditor.HELM.LINKER), append);
    },

    getValueByKey: function (list, key) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i].key == key)
                return list[i].b.value;
        }
        return null;
    },

    updateProperties: function () {
        switch (this.tabs.tabs.currentTabKey()) {
            case "sequence":
                if (this.sequence != null)
                    this.sequence.innerHTML = this.canvas.getSequence(true);
                break;
            case "notation":
                if (this.notation != null)
                    this.notation.innerHTML = this.canvas.getHelm(true);
                break;
            case "properties":
                this.calculateProperties();
                break;
            case "structureview":
                this.updateStructureView();
                break;
        }
    },

    onselectionchanged: function() {
        switch (this.tabs.tabs.currentTabKey()) {
            case "sequence":
                if (this.sequence != null) {
                    this.sequence.innerHTML = this.canvas.getSequence(true);
                }
                break;
            case "notation":
                if (this.notation != null)
                    this.notation.innerHTML = this.canvas.getHelm(true);
                break;
            case "structureview":
                this.updateStructureView();
                break;
        }
    },

    calculateProperties: function () {
        if (this.properties == null)
            return;

        var data = {};
        this.properties.setData(data);
        if (this.options.calculatorurl != null) {
            var me = this;
            scil.Utils.jsonp(this.options.calculatorurl, function (ret) {
                data.mw = ret.MolecularWeight;
                data.mf = ret.MolecularFormula;
                data.ec = ret.ExtinctionCoefficient;
                me.properties.setData(data);
            }, { HELMNotation: this.canvas.getHelm() });
        }
        else {
            data.mw = this.canvas.getMolWeight();
            data.mf = this.canvas.getFormula(true);
            this.properties.setData(data);
        }
    },

    getSelectedAsMol: function (m) {
        var ret = new JSDraw2.Mol();
        for (var i = 0; i < m.atoms.length; ++i) {
            if (m.atoms[i].selected)
                ret.atoms.push(m.atoms[i]);
        }

        var atoms = ret.atoms;
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.selected && b.a1.selected && b.a2.selected)
                ret.bonds.push(b);
        }

        return ret;
    },

    updateStructureView: function () {
        if (this.structureview == null)
            return;

        var selected = this.getSelectedAsMol(this.canvas.m);

        var m = null;
        var chains = org.helm.webeditor.Chain.getChains(selected);
        if (chains == null || chains.length == 0) {
            if (selected != null && selected.atoms.length == 1) {
                // only a base selected
                var a = selected.atoms[0];
                var mon = org.helm.webeditor.Monomers.getMonomer(a);
                m = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(mon));
            }
        }
        else {
            m = chains[0].expand(this.canvas.helm);
        }

        if (m == null)
            this.structureview.clear(true);
        else
            this.structureview.setMolfile(m.getMolfile());
    }
});﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////


org.helm.webeditor.AppToolbar = scil.extend(scil._base, {
    constructor: function (parent, imgpath, buttons) {
        if (typeof(parent) == "string")
            parent = scil.byId(parent);

        this.div = scil.Utils.createElement(parent, "div", null, { position: "absolute", zIndex: 1, top: "-70px", width: "100%", height: 80, background: "#eee", borderBottom: "1px solid gray" });
        var tbody = scil.Utils.createTable(this.div, null, null, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr");

        scil.Utils.createElement(tr, "td", "<img src='" + imgpath + "helm20.png' />", { width: "30%" });
        var td = scil.Utils.createElement(tr, "td", null, { width: "40%", textAlign: "center" });
        scil.Utils.createElement(tr, "td", null, { width: "30%" });

        tbody = scil.Utils.createTable(td, null, null, { textAlign: "center" });
        tbody.parentNode.setAttribute("align", "center");
        var tr1 = scil.Utils.createElement(tbody, "tr");
        var tr2 = scil.Utils.createElement(tbody, "tr");

        for (var i = 0; i < buttons.length; ++i) {
            var b = buttons[i];
            scil.Utils.createElement(tr2, "td", b.label, { padding: "0 10px 0 10px" });

            var d = scil.Utils.createElement(tr1, "td", null, { padding: "0 10px 0 10px" });
            if (b.url == null)
                d.innerHTML = "<img src='" + imgpath + b.icon + "' />";
            else
                d.innerHTML = "<a href='" + b.url + "'><img src='" +imgpath + b.icon + "' /></a>";
        }

        var me = this;
        scil.connect(this.div, "onmouseout", function (e) {
            me.div.style.top = "-70px";
        });
        scil.connect(this.div, "onmouseover", function (e) {
            me.div.style.top = "0";
        });
    }
});﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**********************************************************
create table HELMMonomers
(
id bigint not null identity(1, 1) primary key,
Symbol varchar(256) not null,
Name varchar(256) not null,
NaturalAnalog varchar(256),
SMILES varchar(max),
PolymerType varchar(256) not null,
MonomerType varchar(256),
Status varchar(256),
Molfile varchar(max),
Hashcode varchar(128),
R1 varchar(256),
R2 varchar(256),
R3 varchar(256),
R4 varchar(256),
R5 varchar(256),
Author nvarchar(256),
CreatedDate DateTime default getdate()
);
**********************************************************/

org.helm.webeditor.MonomerLibApp = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;
        scil.Page.ajaxurl = this.options.ajaxurl;
        this.init(parent);
    },

    init: function (parent) {
        var me = this;

        this.page = new scil.Page(parent);

        var me = this;
        this.buttons = [
            "-",
            { type: "a", src: scil.Utils.imgSrc("img/open.gif"), title: "Import Monomer XML Library", onclick: function () { me.uploadFile(); } },
            "-",
            { type: "input", key: "symbol", labelstyle: { fontSize: "90%" }, label: "Symbol", styles: { width: 100 }, autosuggesturl: this.options.ajaxurl + "helm.monomer.suggest", onenter: function () { me.refresh(); } },
            { type: "select", key: "polymertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), label: "Polymer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "monomertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), label: "Monomer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "status", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getStatuses(), label: "Status", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "countperpage", labelstyle: { fontSize: "90%" }, label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
        ];

        this.monomers = this.page.addForm({
            caption: "Monomer List",
            key: "id",
            object: "helm.monomer",
            imagewidth: 30,
            buttons: this.buttons,
            onbeforerefresh: function (args) { me.onbeforerefresh(args); },
            onbeforesave: function (data, args, form) { data.molfile = form.fields.molfile.jsd.getMolfile(); },
            columns: {
                id: { type: "hidden", iskey: true },
                symbol: { label: "Symbol", width: 100 },
                name: { label: "Name", width: 200 },
                naturalanalog: { label: "Natural Analog", width: 100 },
                polymertype: { label: "Polymer Type", width: 100 },
                monomertype: { label: "Monomer Type", width: 100 },
                r1: { label: "R1", width: 50 },
                r2: { label: "R2", width: 50 },
                r3: { label: "R3", width: 50 },
                author: { label: "Author", width: 100 },
                createddate: { label: "Created Date", type: "date", width: 100 },
                status: { label: "Status", width: 100 }
            },
            formcaption: "Monomer",
            fields: org.helm.webeditor.MonomerLibApp.getFields()
        });

        this.page.addForm({
            caption: "Monomer",
            type: "form",
            object: "helm.monomer",
            fields: org.helm.webeditor.MonomerLibApp.getFields()
        }, this.monomers);

        this.monomers.refresh();
    },

    refresh: function (view) {
        this.monomers.refresh();
    },

    onbeforerefresh: function (args) {
        args.countperpage = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "countperpage");
        args.status = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "status");
        args.polymertype = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "polymertype");
        args.monomertype = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "monomertype");
        args.status = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "status");
        args.symbol = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "symbol");
    },

    uploadFile: function (duplicatecheck) {
        scil.Utils.uploadFile("Import Monomer Library", "Select HELM monomer xml file (" + (duplicatecheck ? "with" : "without") + " duplicate check)", this.options.ajaxurl + "helm.monomer.uploadlib",
            function (ret) { scil.Utils.alert(ret.n + " monomers are imported"); }, { duplicatecheck: duplicatecheck });
    }
});

scil.apply(org.helm.webeditor.MonomerLibApp, {
    getFields: function() {
        return {
            id: { type: "hidden" },
            symbol: { label: "Symbol", required: true },
            name: { label: "Name", required: true, width: 800 },
            naturalanalog: { label: "Natural Analog", required: true, width: 100 },
            polymertype: { label: "Polymer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), width: 100 },
            monomertype: { label: "Monomer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), width: 100 },
            author: { label: "Author", width: 100 },
            status: { label: "Status", type: "select", items: org.helm.webeditor.MonomerLibApp.getStatuses(), width: 100 },
            molfile: { label: "Structure", type: "jsdraw", width: 800, height: 300 },
            r1: { label: "R1", type: "select", items: ["", "H", "OH", "X"] },
            r2: { label: "R2", type: "select", items: ["", "H", "OH", "X"] },
            r3: { label: "R3", type: "select", items: ["", "H", "OH", "X"] }
        }
    },

    getValueByKey: function (list, key) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i].key == key)
                return list[i].b.value;
        }
        return null;
    },

    getPolymerTypes: function () {
        return ["", "RNA", "CHEM", "PEPTIDE"];
    },

    getMonomerTypes: function () {
        return ["", "Backbone", "Branch", "Undefined"]
    },

    getStatuses: function () {
        return ["", "New", "Approved", "Retired"]
    }
});﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////


org.helm.webeditor.RuleSet = {
    kApplyAll: false,

    rules: [
        { id: 1, name: "Replace base A with U", note: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'U');return n > 0;}" },
        { id: 2, name: "Replace base A with G", note: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'G');return n > 0;}" },
        { id: 3, name: "Replace base A with T", note: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'T');return n > 0;}" }
    ],

    loadDB: function(list) {
        this.rules = list;
    },

    favorites: new scil.Favorite("ruleset"),

    saveTextDB: function (url) {
        var cols = ["id", "name", "note", "script", "author"];

        var n = 0;
        var ret = "";
        for (var i = 0; i < this.rules.length; ++i) {
            var r = this.rules[i];
            var s = "";
            for (var k = 0; k < cols.length; ++k)
                s += (k > 0 ? "|" : "") + r[cols[k]];
            ret += JSDraw2.Base64.encode(s) + "\n";
            ++n;
        }

        ret = n + "\n" + ret;
        if (url == null)
            return ret;

        var args = { client: "jsdraw", wrapper: "none", filename: "rules.txt", directsave: 1, contents: ret };
        scil.Utils.post(url, args, "_blank");
    },

    addFavorite: function (e) {
        var img = e.srcElement || e.target;
        var tr = scil.Utils.getParent(img, "TR");
        var id = tr.getAttribute("ruleid");

        var f = img.getAttribute("star") != "1";
        if (f) {
            img.setAttribute("star", "1");
            img.src = scil.Utils.imgSrc("img/star.png");
        }
        else {
            img.setAttribute("star", "");
            img.src = scil.Utils.imgSrc("img/star0.png");
        }

        this.favorites.add(id, f);
    },

    filterRules: function(tbody, s) {
        s = scil.Utils.trim(s).toLowerCase();
        var list = tbody.childNodes;
        for (var i = 0; i < this.rules.length; ++i) {
            var name = this.rules[i].name;
            var tr = list[i + 1];
            if (s == "" || name.toLowerCase().indexOf(s) >= 0)
                tr.style.display = "";
            else
                tr.style.display = "none";
        }
    },

    listRules: function(div, apply, applyall){
        scil.Utils.removeAll(div);

        var me = this;
        var tbody = scil.Utils.createTable(div, 0, 0, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr", null, { background: "#eee", display: (this.kApplyAll ? "" : "none") });
        var chk = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "checkbox");
        scil.Utils.createButton(scil.Utils.createElement(tr, "td", null, { textAlign: "right", padding: "3px 3px 3px 0" }, { colSpan: 3 }), this.createApplyAll("Apply All", applyall, tbody));
        scil.connect(chk, "onclick", function () { me.checkAll(tbody); });

        var k = 1;
        var list = [];
        for (var i = 0; i < this.rules.length; ++i) {
            var r = this.rules[i];
            var fav = this.favorites.contains(r.id);
            if (this.favorites.contains(r.id))
                this.listOneRule(tbody, r, ++k, apply, true);
            else
                list.push(r);
        }

        for (var i = 0; i < list.length; ++i)
            this.listOneRule(tbody, list[i], ++k, apply);

        return tbody;
    },

    listOneRule: function (tbody, r, i, apply, fav) {
        var me = this;
        var tr = scil.Utils.createElement(tbody, "tr", null, { background: i % 2 == 1 ? "#eee" : null }, { ruleid: r.id });
        scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "checkbox", null, { display: (this.kApplyAll ? "" : "none"), width: "1%" });

        var td = scil.Utils.createElement(tr, "td");
        scil.Utils.createElement(td, "img", null, { /*width: "1%"*/ }, { star: (fav ? 1 : null), src: scil.Utils.imgSrc("img/star" + (fav ? "" : "0") + ".png") }, function (e) { me.addFavorite(e); });

        td = scil.Utils.createElement(tr, "td", null, { width: "99%" });
        this.listOneRule2(td, r, apply, i);
    },

    listOneRule2: function (td, rule, fun, i) {
        var s = rule.name;
        if (scil.Utils.isNullOrEmpty(s))
            s = rule.note;
        if (s.length > 50)
            s = s.substr(0, 47) + "...";

        var tbody = scil.Utils.createTable(td, 0, 0, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr");
        scil.Utils.createElement(tr, "td", "[" + rule.id + "] " + s, { padding: "3px 0 3px 0" }, { title: rule.note });
        var button = scil.Utils.createElement(scil.Utils.createElement(tr, "td", null, { textAlign: "right" }), "button", JSDraw2.Language.res("Apply"), { display: "none" });

        var me = this;
        scil.connect(button, "onclick", function () { fun(rule.script); });
        scil.connect(td, "onmouseover", function (e) { button.style.display = ""; });
        scil.connect(td, "onmouseout", function (e) { button.style.display = "none"; });
    },

    checkAll: function(tbody) {
        var nodes = tbody.childNodes;
        var f = nodes[0].childNodes[0].childNodes[0].checked;
        for (var i = 1; i < nodes.length; ++i) {
            var tr = nodes[i];
            tr.childNodes[0].childNodes[0].checked = f;
        }
    },

    createApplyAll: function (label, fun, tbody) {
        return {
            label: label, type: "a", onclick: function (e) {
                var list = [];
                var nodes = tbody.childNodes;
                for (var i = 1; i < nodes.length; ++i) {
                    var tr = nodes[i];
                    if (tr.childNodes[0].childNodes[0].checked)
                        list.push(parseInt(tr.getAttribute("ruleid")));
                }

                if (list.length == 0)
                    scil.Utils.alert("No rule selected");
                else
                    fun(list);
            }
        };
    },

    applyRules: function (plugin, ruleids) {
        if (ruleids.length == 0)
            return;

        var list = [];
        for (var i = 0; i < ruleids.length; ++i) {
            for (var k = 0; k < this.rules.length; ++k) {
                var r = this.rules[k];
                if (ruleids[i] == r.id) {
                    list.push(r);
                    break;
                }
            }
        }

        var args = { plugin: plugin, n: list.length, changed: 0, list: list, cloned: plugin.jsd.clone() };
        this._applyNextRule(args);
    },

    applyRule: function (plugin, script) {
        var list = [{ script: script, name: null }];
        var args = { plugin: plugin, n: list.length, changed: 0, list: list, cloned: plugin.jsd.clone() };
        this._applyNextRule(args);
    },

    _applyNextRule: function (args) {
        if (args.list.length == 0)
            return;

        var me = this;

        // get the first rule 
        var rule = args.list[0];
        args.list.splice(0, 1);

        // callback function when the rule is applied
        var callback = function (f, error) {
            if (error != null) {
                // some rule failed
                scil.Utils.alert(error);
                args.plugin.jsd.restoreClone(args.cloned);
                return;
            }

            if (f)
                ++args.changed; // structure changed

            if (args.list.length > 0) {
                // continue to apply the next rule
                me._applyNextRule(args);
                return;
            }

            // all rules are applied
            if (args.changed > 0) {
                args.plugin.jsd.pushundo(args.cloned);
                args.plugin.jsd.refresh(true);
                scil.Utils.alert((args.n > 1 ? "Rules" : "Rule") + " applied successfully!");
            }
            else {
                scil.Utils.alert((args.n > 1 ? "Rules" : "Rule") + " applied, but nothing changed!");
            }
        };
        this._applyOneRule(args.plugin, rule.script, rule.name, callback);
    },

    _applyOneRule: function (plugin, script, name, callback) {
        var rulefun = null;
        if (typeof (script) == "string")
            rulefun = scil.Utils.eval(script);
        else if (typeof (script) == "function")
            rulefun = script;

        var f = false;
        var error = null;
        if (rulefun == null) {
            error = "Error: Invalid rule function: " + name;
        }
        else {
            try {
                f = rulefun(plugin);
            }
            catch (e) {
                error = "Error: " + (name == null ? "" : name) + "\n---------------\n" + e.message + "\n---------------\n" + e.stack;
            }
        }

        callback(f, error);
    }
};﻿//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**********************************************************
create table HELMRules
(
id bigint not null identity(1, 1) primary key,
Name nvarchar(256) not null,
Script nvarchar(max),
Note nvarchar(max),
Author nvarchar(256),
CreatedDate DateTime default getdate()
);
**********************************************************/

org.helm.webeditor.RuleSetApp = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;
        scil.Page.ajaxurl = this.options.ajaxurl;
        this.init(parent);
    },

    init: function (parent) {
        var me = this;

        this.page = new scil.Page(parent);

        var me = this;
        this.buttons = [
            "-",
            { type: "select", key: "countperpage", labelstyle: { fontSize: "90%" }, label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
        ];

        var fields = org.helm.webeditor.RuleSetApp.getFields();
        fields.script.button = [{ label: "Test Script", onclick2: function (field) { me.testscript(field); } },
            { label: "Test Applying", onclick2: function (field, form) { me.testapplying(field, form); } }
        ];
        fields.test = { label: "Test Structure", type: "jsdraw", helmtoolbar: true, width: 800, height: 300 };
        this.rules = this.page.addForm({
            caption: "Rule Set",
            key: "id",
            object: "helm.rule",
            buttons: this.buttons,
            onbeforerefresh: function (args) { me.onbeforerefresh(args); },
            onbeforesave: function (data, args, form) { data.test = null; },
            columns: {
                id: { label: "ID", width: 50, iskey: true },
                name: { label: "Name", width: 100 },
                note: { label: "Note", width: 200 },
                author: { label: "Author", width: 100 },
                createddate: { label: "Created Date", type: "date", width: 100 }
            },
            formcaption: "Rule",
            fields: fields,
            defaultvalues: { script: "function(plugin) {\n\n}" }
        });

        this.page.addForm({
            caption: "Rule",
            type: "form",
            object: "helm.rule",
            fields: org.helm.webeditor.RuleSetApp.getFields()
        }, this.rules);

        this.rules.refresh();
    },

    refresh: function (view) {
        this.rules.refresh();
    },

    onbeforerefresh: function (args) {
        args.countperpage = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "countperpage");
    },

    testapplying: function (field, form) {
        var plugin = form.fields.test.jsd.helm;
        plugin.applyRule(field.value);
    },

    testscript: function (field) {
        var s = field.value;
        if (scil.Utils.trim(s) == "")
            return;

        try {
            eval("var __fun=" + s);
            if (typeof (__fun) == "function")
                scil.Utils.alert("Looks good!");
            else
                scil.Utils.alert("It should be a Javascript function, like this: \nfunction(plugin) {\n //... \n}");
        }
        catch (e) {
            scil.Utils.alert(e.message);
        }
    }
});

scil.apply(org.helm.webeditor.RuleSetApp, {
    getFields: function() {
        return {
            id: { label: "ID", viewonly: true },
            name: { label: "Name", width: 800 },
            note: { label: "Note", type: "textarea", width: 800, height: 40 },
            script: { label: "Javascript", type: "textarea", width: 800, height: 160 }
        }
    }
});