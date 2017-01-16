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
* Formula class
* @class org.helm.webeditor.Formula
*/
org.helm.webeditor.Formula = {
    /**
    * Calculate the MF of a molecule (internal use)
    * @function getMF
    */
    getMF: function (m, html) {
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

    /**
    * Create subscription (internal use)
    * @function 
    */
    subscription: function (n, html) {
        if (n == 1)
            return "";
        return html ? "<sub>" + n + "</sub>" : n;
    },

    /**
    * Calculate the MW of a molecule (internal use)
    * @function getMW
    */
    getMW: function (m) {
        var stats = this.getAtomStats(m);
        var sum = 0;
        for (var e in stats) {
            if (e != "R")
                sum += stats[e] * org.helm.webeditor.Interface.getElementMass(e);
        }
        return Math.round(sum * 10000) / 10000.0;
    },

    /**
    * Calculate atom counts (internal use)
    * @function getAtomStats
    */
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

    /**
    * Count monomers (internal use)
    * @function countMonomer
    */
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

    /**
    * Deduct R group (internal use)
    * @function deduceR
    */
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
};