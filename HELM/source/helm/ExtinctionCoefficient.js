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
* ExtinctionCoefficient class
* @class org.helm.webeditor.ExtinctionCoefficient
*/
org.helm.webeditor.ExtinctionCoefficient = {
    // εcalc = x(5500 M-1 cm-1) + y(1490 M-1 cm-1) + z(125 M-1 cm-1), where
    // “x” is the number of tryptophan residues per mole of protein, 
    // “y” is the number of tyrosine residues per mole of protein, 
    // "z” is the number of cystine residues per mole of protein.
    peptide: { W: 5500, Y: 1490, C: 62.5 },

    //Extinction Coefficient for nucleotide and dinucleotides in sngle strand E(260) M-1cm-1 x 10-3
    // Characterization of RNAs
    // [22] Absorbance Melting Curves of RNA, p304-325
    // Josehp Puglish and Ignacio Tinoco, Jr.
    // Methods in Enzymology, Vol. 180
    rna: {
        A: 15.34,
        C: 7.6,
        G: 12.16,
        U: 10.21,
        T: 8.7,
        AA: 13.65,
        AC: 10.67,
        AG: 12.79,
        AU: 12.14,
        AT: 11.42,
        CA: 10.67,
        CC: 7.52,
        CG: 9.39,
        CU: 8.37,
        CT: 7.66,
        GA: 12.92,
        GC: 9.19,
        GG: 11.43,
        GU: 10.96,
        GT: 10.22,
        UA: 12.52,
        UC: 8.90,
        UG: 10.40,
        UU: 10.11,
        UT: 9.45,
        TA: 11.78,
        TC: 8.15,
        TG: 9.70,
        TU: 9.45,
        TT: 8.61
    },

    /**
    * Calculate the extinction coefficient of a molecule (internal use)
    * @function calculate
    */
    calculate: function (m) {
        var chains = org.helm.webeditor.Chain.getChains(m);
        if (chains == null || chains.length == 0)
            return "";

        var sum = 0;
        for (var i = 0; i < chains.length; ++i) {
            var chain = chains[i];
            var ss = chain._getPolymers();
            for (var k = 0; k < ss.length; ++k) {
                if (ss[k].type == "RNA")
                    sum += this._calculateRNA(ss[k].atoms);
                else if (ss[k].type == "Peptide")
                    sum += this._calculatePeptide(ss[k].atoms);
            }
        }

        return sum;
    },

    /**
    * Calculate the extinction coefficient of a peptide (internal use)
    * @function _calculatePeptide
    */
    _calculatePeptide: function (atoms) {
        if (atoms == null || atoms.length == 0)
            return 0;

        var counts = {};
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            var m = org.helm.webeditor.Monomers.getMonomer(a);
            var e = m == null ? null : m.na;
            if (e != null && this.peptide[e]) {
                if (counts[e] == null)
                    counts[e] = 1;
                else
                    ++counts[e];
            }
        }

        var result = 0;
        for (var k in counts)
            result += this.peptide[k] * counts[k];
        return result / 1000.0;
    },

    /**
    * Calculate the extinction coefficient of a RNA (internal use)
    * @function _calculateRNA
    */
    _calculateRNA: function (atoms) {
        if (atoms == null || atoms.length == 0)
            return 0;

        var counts = {};
        var lastE = null;
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            var m = org.helm.webeditor.Monomers.getMonomer(a);
            var e = m == null ? null : m.na;
            if (e == null) {
                lastE = null;
                continue;
            }

            if (this.rna[e]) {
                if (counts[e] == null)
                    counts[e] = 1;
                else
                    ++counts[e];
            }
            else if (lastE != null && this.rna[lastE + e]) {
                if (counts[lastE + e] == null)
                    counts[lastE + e] = 1;
                else
                    ++counts[lastE + e];
            }

            lastE = e;
        }

        var result = 0;
        for (var k in counts)
            result += this.rna[k] * counts[k];
        return result;
    } 
};