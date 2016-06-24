//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.MolViewer = {
    dlg: null,
    jsd: null,

    show: function (e, type, m, code) {
        if (m == null)
            return;

        this.create();

        if (this.cur != (type + "." + code) || !this.dlg.isVisible()) {
            this.cur = type + "." + code;

            if (typeof (m) == "string") {
                var s = m;
                m = { n: m, m: this.assemblyMol(s) };
            }

            this.dlg.show2({ title: code + ": " + m.n, modal: false, immediately: true });

            this.jsd.setMolfile(org.helm.webeditor.monomers.getMolfile(m));
        }

        var scroll = scil.Utils.scrollOffset();
        this.dlg.moveTo(e.clientX + scroll.x + 30, e.clientY + scroll.y + 30);
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

        var fields = { jsd: { type: "jsdraw", width: 200, height: 150, viewonly: true } };
        this.dlg = scil.Form.createDlgForm("", fields, null, { hidelabel: true, modal: false, noclose: true });
        this.jsd = this.dlg.form.fields.jsd.jsd;
        this.dlg.hide(true);
    },

    hide: function () {
        if (this.dlg != null && this.dlg.isVisible()) {
            this.dlg.hide(true);
        }
    }
};