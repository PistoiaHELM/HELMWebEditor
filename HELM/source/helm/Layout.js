//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* Layout class
* @class org.helm.webeditor.Layout
*/
org.helm.webeditor.Layout = {
    clean: function (m, bondlength, a) {
        m.clearFlag();
        var chains = org.helm.webeditor.Chain._getChains(m, a);

        this._removeChainID(m.atoms);
        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];

            // set chain id
            for (var k = 0; k < chain.atoms.length; ++k) {
                chain.atoms[k]._chainid = i;
                if (chain.bases[k] != null)
                    chain.bases[k]._chainid = i;
            }

            if (chain.isCircle()) {
                chain.layoutCircle(bondlength);
            }
            else {
                if (!this.layoutInnerCircle(chain, bondlength, m, i))
                    chain.layoutLine(bondlength);
            }
            chain.layoutBases();

            chain.setFlag(true);
            chain.resetIDs();
        }

        this.layoutCrossChainBonds(m, chains, bondlength);
        this.layoutBranches(m);

        // clear chain id
        this._removeChainID(m.atoms);
    },

    resetIDs: function(m) {
        var chains = org.helm.webeditor.Chain._getChains(m);
        for (var i = 0; i < chains.length; ++i)
            chains[i].resetIDs();
    },

    _removeChainID: function(atoms) {
        for (var i = 0; i < atoms.length; ++i)
            delete atoms[i]._chainid;
    },

    layoutInnerCircle: function (chain, bondlength, m, chainid) {
        var pairs = [];
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1._chainid != null && b.a2._chainid != null && b.a1._chainid == chainid && b.a2._chainid == chainid && scil.Utils.indexOf(chain.bonds, b) < 0 && scil.Utils.indexOf(chain.basebonds, b) < 0) {
                var ai1 = scil.Utils.indexOf(chain.atoms, b.a1);
                var ai2 = scil.Utils.indexOf(chain.atoms, b.a2);
                var p1 = { a1: ai1 < ai2 ? ai1 : ai2, a2: ai1 < ai2 ? ai2 : ai1 };
                pairs.push(p1);
            }
        }

        if (pairs.length == 0)
            return false;

        // find the biggest circle
        var pair = pairs[0];
        for (var i = 1; i < pairs.length; ++i) {
            var r = pairs[i];
            if (r.a1 >= pair.a1 && r.a1 <= pair.a2 && r.a1 >= pair.a1 && r.a1 <= pair.a2) {
                pair = r;
            }
            else if (pair.a1 < r.a1 || pair.a1 > r.a2 || pair.a2 < r.a1 || pair.a2 > r.a2) {
                if (r.a2 - r.a1 > pair.a2 - pair.a1)
                    pair = r;
            }
        }

        var atoms = [];
        for (var i = pair.a1; i <= pair.a2; ++i)
            atoms.push(chain.atoms[i]);
        atoms.push(atoms[0]);
        this.layoutCircle(atoms, bondlength, -360 / (atoms.length - 1) / 2);

        var delta = org.helm.webeditor.bondscale * bondlength;
        var p = chain.atoms[pair.a1].p.clone();
        for (var i = pair.a1 - 1; i >= 0; --i) {
            p.x += delta;
            chain.atoms[i].p = p.clone();
        }

        p = chain.atoms[pair.a2].p.clone();
        for (var i = pair.a2 + 1; i < chain.atoms.length; ++i) {
            p.x += delta;
            chain.atoms[i].p = p.clone();
        }

        return true;
    },

    layoutCircle: function(atoms, bondlength, startdeg) {
        var rect = this.getRect(atoms);
        var origin = rect.center();
        
        var delta = org.helm.webeditor.bondscale * bondlength;
        var deg = 360 / (atoms.length - 1);
        var radius = (delta / 2) / Math.sin((deg / 2) * Math.PI / 180);

        var a = atoms[0];
        a.p = org.helm.webeditor.Interface.createPoint(origin.x + radius, origin.y);
        if (startdeg != null && startdeg != 0)
            a.p.rotateAround(origin, startdeg);

        for (var i = 1; i < atoms.length - 1; ++i)
            atoms[i].p = atoms[i - 1].p.clone().rotateAround(origin, -deg);
    },

    layoutCrossChainBonds: function (m, chains, bondlength) {
        var fixed = {};
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.a1._chainid != null && b.a2._chainid != null && b.a1._chainid != b.a2._chainid) {
                var a1, a2;
                if (fixed[b.a1._chainid] && fixed[b.a2._chainid]) {
                    continue;
                }
                else if (fixed[b.a1._chainid]) {
                    a1 = b.a1;
                    a2 = b.a2;
                }
                else if (fixed[b.a2._chainid]) {
                    a1 = b.a2;
                    a2 = b.a1;
                }
                else if (b.a1._chainid > b.a2._chainid) {
                    a1 = b.a2;
                    a2 = b.a1;
                }
                else {
                    a1 = b.a1;
                    a2 = b.a2;
                }

                if (b.type == JSDraw2.BONDTYPES.UNKNOWN) {
                    // hydrogen bond
                    if (b.a1.p.y > b.a2.p.y) {
                        a2 = b.a1;
                        a1 = b.a2;
                    }
                    else {
                        a2 = b.a2;
                        a1 = b.a1;
                    }
                    var chain = chains[a2._chainid];
                    chain.rotate(180);

                    var delta = a1.p.clone().offset(0, bondlength * org.helm.webeditor.bondscale).offset(-a2.p.x, -a2.p.y);
                    chain.move(delta);
                }
                else {
                    var delta = a1.p.clone().offset(0, bondlength * 3).offset(-a2.p.x, -a2.p.y);
                    chains[a2._chainid].move(delta);
                }

                fixed[a1._chainid] = true;
                fixed[a2._chainid] = true;
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

                if (b1 != null || b2 != null) {
                    if (b1 != null && b2 != null) {
                        var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                        var a2 = b2.a1 == center ? b2.a2 : b2.a1;

                        var ang = center.p.angleAsOrigin(a1.p, a2.p);
                        if (Math.abs(ang - 180) > 10)
                            a.p = a1.p.clone().rotateAround(center.p, ang / 2);
                        else
                            a.p = a1.p.clone().rotateAround(center.p, 90);
                    }
                    else {
                        if (b1 != null) {
                            var a1 = b1.a1 == center ? b1.a2 : b1.a1;
                            a.p = a1.p.clone().rotateAround(center.p, 180);
                        }
                        else if (b2 != null) {
                            var a2 = b2.a1 == center ? b2.a2 : b2.a1;
                            a.p = a2.p.clone().rotateAround(center.p, 180);
                        }
                    }

                    b.f = b.a1.f = b.a2.f = true;
                }
            }
        }
    },

    getRect: function (atoms) {
        var a = atoms[0];
        var x1 = a.p.x;
        var y1 = a.p.y;
        var x2 = x1;
        var y2 = y1;

        for (var i = 1; i < atoms.length; ++i) {
            var p = atoms[i].p;
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
    }
};
