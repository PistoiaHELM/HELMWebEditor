//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* MolViewer class
* @class org.helm.webeditor.MolViewer
*/
org.helm.webeditor.MolViewer = {
    dlg: null,
    jsd: null,
    molscale: 1,
    delay: 800,

    show: function (e, type, m, code) {
        this.clearTimer();
        var me = this;
        this.tm = setTimeout(function () { me.show2({ x: e.clientX, y: e.clientY }, type, m, code); }, this.delay);
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
};