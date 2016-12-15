//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Interface class
* @class org.helm.webeditor.Interface
*/
org.helm.webeditor.Interface = {
    /**
    * Create the canvas
    * @function createCanvas
    * @param {DOM} div
    * @param {dict} args - check <a href='http://www.scilligence.com/sdk/jsdraw/logical/scilligence/JSDraw2/Editor.html'>JSDraw SDK</a>
    */
    createCanvas: function (div, args) {
        return new JSDraw2.Editor(div, args);
    },

    /**
    * Create a molecule object
    * @function createMol
    * @param {string} molfile
    */
    createMol: function (molfile) {
        var m = new JSDraw2.Mol();
        m.setMolfile(molfile);
        return m;
    },

    /**
    * Create a point
    * @function createPoint
    * @param {number} x
    * @param {number} y
    */
    createPoint: function (x, y) {
        return new JSDraw2.Point(x, y);
    },

    /**
    * Create a rectangle object
    * @function createRect
    * @param {number} l - left
    * @param {number} t - top
    * @param {number} w - width
    * @param {number} h - height
    */
    createRect: function (l, t, w, h) {
        return new JSDraw2.Rect(l, t, w, h);
    },

    /**
    * Create an atom
    * @function createAtom
    * @param {JSDraw2.Mol} m
    * @param {JSDraw2.Point} p - the coordinate
    */
    createAtom: function (m, p) {
        return m.addAtom(new JSDraw2.Atom(p));
    },

    /**
    * Create a bond between two atoms
    * @function createBond
    * @param {JSDraw2.Mol} m
    * @param {JSDraw2.Atom} a1
    * @param {JSDraw2.Atom} a2
    */
    createBond: function (m, a1, a2, bondtype) {
        return m.addBond(new JSDraw2.Bond(a1, a2, bondtype == null ? JSDraw2.BONDTYPES.SINGLE : bondtype));
    },

    /**
    * Get atom counts
    * @function getAtomStats
    * @param {JSDraw2.Mol} m
    * @param {array} atoms
    */
    getAtomStats: function (m, atoms) {
        var mol = { atoms: atoms, bonds: m.bonds };
        var ret = JSDraw2.FormulaParser.getAtomStats(m);
        return ret == null ? null : ret.elements;
    },

    /**
    * Test if two molecules are equal
    * @function molEquals
    * @param {JSDraw2.Mol} m1
    * @param {JSDraw2.Mol} m2
    */
    molEquals: function (m1, m2) {
        var mol1 = m1.mol != null ? m1.mol : (m1.mol = this.createMol(scil.helm.Monomers.getMolfile(m1)));
        var mol2 = m2.mol != null ? m2.mol : (m2.mol = this.createMol(scil.helm.Monomers.getMolfile(m2)));
        return mol2.fullstructureMatch(mol1);
    },

    /**
    * count atoms and bonds to calculate MF and MW
    * @function molStats
    * @param {string} molfile
    */
    molStats: function (molfile) {
        var mol = this.createMol(molfile);
        mol.calcHCount();
        return JSDraw2.FormulaParser.getAtomStats(mol).elements;
    },

    /**
    * Get element mass
    * @function getElementMass
    * @param {string} e - element name
    */
    getElementMass: function (e) {
        return JSDraw2.PT[e].m;
    },

    /**
    * Get the current object
    * @function getCurrentAtom
    * @param {JSDraw2.Editor} jsd - JSDraw Editor
    */
    getCurrentAtom: function (jsd) {
        return JSDraw2.Atom.cast(jsd.curObject)
    },

    /**
    * Scale the canvas
    * @function scaleCanvas
    * @param {JSDraw2.Editor} jsd - JSDraw Editor
    */
    scaleCanvas: function (jsd) {
        var scale = JSDraw2.Editor.BONDLENGTH / jsd.bondlength;
        if (JSDraw2.Editor.BONDLENGTH / jsd.bondlength > 1)
            jsd.scale(JSDraw2.Editor.BONDLENGTH / jsd.bondlength);
    },

    /**
    * called by the canvas to draw a monomer
    * @function drawMonomer
    * @param {SVG} surface
    * @param {JSDraw2.Atom} a - monomer object
    * @param {JSDraw2.Point} p - coordinate
    * @param {number} fontsize
    * @param {number} linewidth
    * @param {string} color
    */
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
            JSDraw2.Drawer.drawLabel(surface, p1, a.bio.id, "#00FF00", fontsize, null, null, null, false);
        }
        if (!scil.Utils.isNullOrEmpty(a.bio.annotation)) {
            var p1 = p.clone();
            var s = a.bio.annotation;
            if (a.bio.annotationshowright) {
                var c = a.biotype() == org.helm.webeditor.HELM.AA ? 0.7 : 1;
                p1.offset(fontsize * c, -fontsize * 1.5);
                JSDraw2.Drawer.drawLabel(surface, p1, s, "#FFA500", fontsize, null, "start", null, false);
            }
            else {
                var c = a.biotype() == org.helm.webeditor.HELM.AA ? 1.5 : 1;
                p1.offset(-fontsize * c, -fontsize * 1.5);
                JSDraw2.Drawer.drawLabel(surface, p1, s, "#FFA500", fontsize, null, "end", null, false);
            }
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

        buttons.push({ c: "new", t: "New", label: "New" });
        buttons.push({ c: "open", t: "Load", label: "Load" });
        buttons.push({ c: "save", t: "Save", label: "Save" });
        buttons.push({ c: "|" });
    },

    /**
    * called when the canvas is creating toolbar
    * @function getHelmToolbar
    * @param {array} buttons
    * @param {array} filesubmenus
    * @param {array} selecttools
    * @param {dict} options
    */
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

    /**
    * called when the canvas is trying to display context menu
    * @function onContextMenu
    * @param {JSDraw2.Editor} ed - JSDraw Editor
    * @param {Event} e - Javascript event
    * @param {bool} viewonly - indicate if this is viewonly mode
    */
    onContextMenu: function (ed, e, viewonly) {
        var items = [];

        if (ed.options.helmtoolbar) {
            var a = JSDraw2.Atom.cast(ed.curObject);
            if (a != null && a.biotype() == scil.helm.HELM.SUGAR && a.bio != null) {
                items.push({ caption: "Set as Sense", key: "helm_set_sense" });
                items.push({ caption: "Set as Antisense", key: "helm_set_antisense" });
                items.push({ caption: "Clear Annotation", key: "helm_set_clear" });
                items.push("-");
                items.push({ caption: "Create Complementary Strand", key: "helm_complementary_strand" });
            }
        }
        else {
            items.push({ caption: "Copy Molfile", key: "copymolfile" });
        }

        if (items.length > 0)
            items.push("-");

        if (ed.options.helmtoolbar)
            ;//items.push({ caption: "About HELM Web Editor", key: "abouthelm" });
        else
            items.push({ caption: "About JSDraw", key: "about" });
        return items;
    }
};