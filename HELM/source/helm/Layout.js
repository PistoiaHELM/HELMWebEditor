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
* Layout class
* @class org.helm.webeditor.Layout
*/
org.helm.webeditor.Layout = {
    /**
    * Clean/lay out a molecule
    * @function clean
    */
    clean: function (jsd, a) {
        var m = jsd.m;
        var bondlength = jsd.bondlength;

        m.clearFlag();
        var chains = org.helm.webeditor.Chain._getChains(m, a);

        org.helm.webeditor.Chain._removeChainID(m.atoms);
        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];

            // set chain id
            org.helm.webeditor.Chain._setChainID(chain, i);

            if (!chain.hasBase() && chain.atoms.length > 50) {
                chain.layoutRows(bondlength, 10);
            }
            else {
                if (chain.isCircle()) {
                    chain.layoutCircle(bondlength);
                }
                else {
                    if (!this.layoutInnerCircle(chain, bondlength, m, i))
                        chain.layoutLine(bondlength);
                }
                chain.layoutBases();
            }

            chain.setFlag(true);
            chain.resetIDs();
        }

        jsd.updateGroupRect();

        this.layoutCrossChainBonds(m, chains, bondlength);
        this.layoutBranches(m);

        this.layoutFragments(m, bondlength);

        // clear chain id
        org.helm.webeditor.Chain._removeChainID(m.atoms);
    },

    layoutFragments: function (m, bondlength) {
        var frags = m.splitFragments();
        if (frags.length < 2)
            return;

        var r0 = frags[0].rect();
        var x = r0.center().x;
        var y = r0.bottom() + 3 * bondlength;
        for (var i = 1; i < frags.length; ++i) {
            var frag = frags[i];
            var r = frag.rect();
            frag.offset(x - r.center().x, y - r.top);
            y += r.height + 3 * bondlength;
        }
    },

    /**
    * Reset Monomer IDs (internal use)
    * @function resetIDs
    */
    resetIDs: function (m) {
        var chains = org.helm.webeditor.Chain._getChains(m);
        for (var i = 0; i < chains.length; ++i)
            chains[i].resetIDs();
    },

    /**
    * Lay out inner circle (internal use)
    * @function layoutInnerCircle
    */
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

    /**
    * Lay out circle (internal use)
    * @function layoutCircle
    */
    layoutCircle: function (atoms, bondlength, startdeg) {
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

    /**
    * Lay out cross-chain bonds (internal use)
    * @function layoutCrossChainBonds
    */
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
                else {
                    var chain1 = chains[b.a1._chainid];
                    var chain2 = chains[b.a2._chainid];
                    if (chain1.atoms.length < chain2.atoms.length) {
                        a1 = b.a2;
                        a2 = b.a1;
                    }
                    else {
                        a1 = b.a1;
                        a2 = b.a2;
                    }
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
                    // cross-chain connection
                    var bonds = m.getNeighborBonds(a1);
                    if (bonds.length == 3) {
                        scil.Utils.delFromArray(bonds, b);

                        var p1 = bonds[0].otherAtom(a1).p;
                        var p2 = bonds[1].otherAtom(a1).p;
                        var p = new JSDraw2.Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
                        if (p.distTo(a1.p) < bondlength / 30) {
                            // p1, a1.p and p2 in a line
                            p = p1.clone();
                            p.rotateAround(a1.p, -90, bondlength * 3);
                        }
                        else {
                            p.rotateAround(a1.p, 180, bondlength * 3);
                        }

                        var chain = chains[a2._chainid];
                        p.offset(-a2.p.x, -a2.p.y);
                        chain.move(p);

                        bonds = m.getNeighborBonds(a2);
                        if (bonds.length == 3) {
                            scil.Utils.delFromArray(bonds, b);

                            var deg;
                            var c = a2.p.clone();

                            var ang1 = a1.p.angleTo(c);

                            var p1 = bonds[0].otherAtom(a2).p;
                            var p2 = bonds[1].otherAtom(a2).p;
                            var p = new JSDraw2.Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
                            if (p.distTo(c) < bondlength / 30) {
                                // p1, a2.p and p2 in a line
                                var ang2 = p2.angleTo(c);
                                deg = (ang1 - ang2) - 90;
                            }
                            else {
                                var ang2 = p.angleTo(c);
                                deg = (ang1 + 180) - ang2;
                            }

                            chain.rotate(deg, c);
                        }
                    }
                    else {
                        var p = a1.p.clone().offset(0, bondlength * 3);
                        if (this._hasOverlap(chains, fixed, p, bondlength / 30))
                            p = a1.p.clone().offset(0, -bondlength * 3);
                        var delta = p.offset(-a2.p.x, -a2.p.y);
                        chains[a2._chainid].move(delta);
                    }
                }

                fixed[a1._chainid] = true;
                fixed[a2._chainid] = true;
            }
        }
    },

    _hasOverlap: function (chains, fixed, p, tor) {
        for (var i = 0; i < chains.length; ++i) {
            if (!fixed[i])
                continue;

            var atoms = chains[i].atoms;
            for (var k = 0; k < atoms.length; ++k) {
                if (atoms[k].p.distTo(p) < tor)
                    return true;
            }
        }

        return false;
    },

    /**
    * Layout branches (internal use)
    * @function layoutBranches
    */
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

    /**
    * Get rectangle (internal use)
    * @function getRect
    */
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
