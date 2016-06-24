//////////////////////////////////////////////////////////////////////////////////
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

        //this.layoutBranches(m);
    },

    resetIDs: function(m) {
        var chains = org.helm.webeditor.Chain._getChains(m);
        for (var i = 0; i < chains.length; ++i)
            chains[i].resetIDs();
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
