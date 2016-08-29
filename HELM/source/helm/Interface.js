//////////////////////////////////////////////////////////////////////////////////
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
                { c: "helm_chem", t: "Chemistry", label: "Chemistry" },
                { c: "helm_find", t: "Find", label: "Find", tooltips: "Fine/Replace" }
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
        buttons.push({ c: "|" });
        buttons.push({ c: "zoomin", t: "Zoom in", label: "Zoom" });
        buttons.push({ c: "zoomout", t: "Zoom out", label: "Zoom" });
        buttons.push({ c: "|" });
        buttons.push({ c: "center", t: "Move to center", label: "Center" });
        buttons.push({ c: "moveview", t: "Move/View", label: "Move" });
    },

    onContextMenu: function (ed, e, viewonly) {
        if (ed.options.helmtoolbar)
            return null;

        var items = [];

        items.push({ caption: "Copy Molfile V2000", key: "copymolfile2000" });
        items.push({ caption: "Copy Molfile V3000", key: "copymolfile3000" });
        //items.push({ caption: "Paste Mol File", key: "pastemolfile" });
        items.push({ caption: "Copy SMILES", key: "copysmiles" });

        return items;
    }
};
