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
* MolViewer class
* @class org.helm.webeditor.MolViewer
*/
org.helm.webeditor.MolViewer = {
    dlg: null,
    jsd: null,
    molscale: 1,
    delay: 800,

    /**
    * Show structure view popup
    * @function show
    */
    show: function (e, type, m, code, ed, text) {
        this.clearTimer();
        var me = this;
        this.tm = setTimeout(function () { me.show2({ x: e.clientX, y: e.clientY }, type, m, code, ed, text); }, this.delay);
    },

    /**
    * Clear delay timer
    * @function clearTimer
    */
    clearTimer: function () {
        if (this.tm != null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
    },

    /**
    * Inner implementation of display structure dialog (internal use)
    * @function show2
    */
    show2: function (xy, type, m, code, ed, a) {
        this.tm = null;
        if (m == null && a == null)
            return;

        if (ed != null && ed.contextmenu != null && ed.contextmenu.isVisible())
            return;

        this.create();

        if (this.cur != (type + "." + code) || !this.dlg.isVisible()) {
            this.cur = type + "." + code;

            if (m != null && typeof (m) == "string") {
                var s = m;
                m = { n: m, m: this.assemblyMol(s) };
            }

            var name = "";
            if (m != null) {
                name = m.n;
                if (name == null)
                    name = a.elem;
            }
            else {
                if (a.bio != null && !scil.Utils.isNullOrEmpty(a.bio.ambiguity))
                    name = a.bio.ambiguity;
            }

            var blobtype = "";
            if (a != null && type == org.helm.webeditor.HELM.BLOB && !scil.Utils.isNullOrEmpty(a.bio.blobtype))
                blobtype = "{" + a.bio.blobtype + "}";

            var fields = this.dlg.form.fields;
            this.dlg.show2({ title: "<div style='font-size:80%'>" + name + blobtype + "</div>", modal: false, immediately: true });

            var molfile = org.helm.webeditor.monomers.getMolfile(m);
            if (scil.Utils.isNullOrEmpty(molfile)) {
                fields.jsd.style.display = "none";
            }
            else {
                fields.jsd.style.display = "";
                fields.jsd.jsd.setXml(molfile);
            }

            var s = "";
            if (m != null && m.at != null) {
                for (var k in m.at)
                    s += "<tr><td>" + k + "=</td><td>&nbsp;" + m.at[k] + "</td></tr>";
            }

            if (s == "") {
                fields.rs.style.display = "none";
            }
            else {
                fields.rs.style.display = "";
                fields.rs.innerHTML = "<table cellspacing=0 cellpadding=0 style='font-size:80%'>" + s + "</table>";
            }

            var s = "";
            if (a != null) {
                if (!scil.Utils.isNullOrEmpty(a.tag))
                    s += "<div>" + a.tag + "</div>";
            }
            if (s == "") {
                fields.notes.style.display = "none";
            }
            else {
                fields.notes.style.display = "";
                fields.notes.innerHTML = s;

                fields.notes.style.borderTop = fields.rs.style.display == "" ? "solid 1px gray" : "";
            }
        }

        var scroll = scil.Utils.scrollOffset();
        this.dlg.moveTo(xy.x + scroll.x + 10, xy.y + scroll.y + 10);
    },

    /**
    * Assembly molecule (internal use)
    * @function assemblyMol
    */
    assemblyMol: function (s) {
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

    /**
    * Cap R group (internal use)
    * @function capRGroup
    */
    capRGroup: function (m, r, mon) {
        var cap = mon == null || mon.at == null ? null : mon.at[r];
        if (cap == "OH")
            cap = "O";
        else if (cap != "H" && cap != "X" && cap != "O")
            return false;

        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1.alias == r || b.a2.alias == r) {
                var a = b.a1.alias == r ? b.a1 : b.a2;
                m.setAtomType(a, cap);
                a.alias = null;
                return true;
            }
        }
        return false;
    },

    /**
    * Find R group (internal use)
    * @function findR
    */
    findR: function (m, r1, a1) {
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1.alias == r1 && (a1 == null || b.a1._helmgroup == a1))
                return { b: b, a0: b.a2, a1: b.a1 };
            else if (b.a2.alias == r1 && (a1 == null || b.a2._helmgroup == a1))
                return { b: b, a0: b.a1, a1: b.a2 };
        }
        return null;
    },

    /**
    * Merge two molecule (internal use)
    * @function mergeMol
    */
    mergeMol: function (m, r1, src, r2, a1, a2) {
        this.joinMol(m, r1, src, r2, a1, a2);

        m.atoms = m.atoms.concat(src.atoms);
        m.bonds = m.bonds.concat(src.bonds);
        return m.getMolfile();
    },

    joinMol: function (m, r1, src, r2, a1, a2) {
        var t = this.findR(m, r1, a1);
        var s = this.findR(src, r2, a2);

        if (t != null && s != null) {
            this.extendDistance(t.a0.p, t.a1.p, 1);
            this.extendDistance(s.a0.p, s.a1.p, 1);

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
    },

    /**
    * Extend a point (internal use)
    * @function extendDistance
    */
    extendDistance: function (p0, p, s) {
        var dx = p.x - p0.x;
        var dy = p.y - p0.y;

        p.x = p0.x + s * dx;
        p.y = p0.y + s * dy;
    },

    /**
    * Create the popup dialog (internal use)
    * @function create
    */
    create: function () {
        if (this.dlg != null)
            return;

        var fields = {
            jsd: { type: "jsdraw", width: 180, height: 130, scale: this.molscale, viewonly: true },
            rs: { type: "html", viewonly: true, style: { borderTop: "solid 1px gray", width: 180} },
            notes: { type: "html", viewonly: true, style: { width: 180, color: "gray"} }
        };
        this.dlg = scil.Form.createDlgForm("", fields, null, { hidelabel: true, modal: false, noclose: true });
        this.dlg.hide(true);

        this.dlg.dialog.style.backgroundColor = "#fff";
        this.dlg.dialog.titleElement.style.borderBottom = "solid 1px #ddd";
        this.dlg.dialog.titleElement.style.textAlign = "center";
    },

    /**
    * Hide the dialog (internal use)
    * @function hide
    */
    hide: function () {
        this.clearTimer();
        if (this.dlg != null && this.dlg.isVisible()) {
            this.dlg.hide(true);
        }
    }
};