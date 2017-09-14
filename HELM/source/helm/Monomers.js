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
* Monomers class
* @class org.helm.webeditor.Monomers
*/
org.helm.webeditor.Monomers = {
    defaultmonomers: { HELM_BASE: null, HELM_SUGAR: null, HELM_LINKER: null, HELM_AA: null, HELM_CHEM: null },

    blobs: { blob: { n: 'Blob', id: "Blob", na: 'B', rs: 0, at: {}, m: '' }, group: { n: 'Group', id: "Group", na: 'G', rs: 0, at: {}, m: ''} },

    /**
    * Clear monomer database (internal use)
    * @function clear
    */
    clear: function () {
        this.sugars = {};
        this.linkers = {};
        this.bases = {};
        this.aas = {};
        this.chems = {};
    },

    /**
    * Get the default monomer of a given monomer type (internal use)
    * @function getDefaultMonomer
    */
    getDefaultMonomer: function (monomertype) {
        var r = this.defaultmonomers[monomertype];
        if (r != null)
            return r;

        if (monomertype == org.helm.webeditor.HELM.BASE)
            return this._getFirstKey(org.helm.webeditor.Monomers.bases, "a");
        else if (monomertype == org.helm.webeditor.HELM.SUGAR)
            return this._getFirstKey(org.helm.webeditor.Monomers.sugars, "r");
        else if (monomertype == org.helm.webeditor.HELM.LINKER)
            return this._getFirstKey(org.helm.webeditor.Monomers.linkers, "p");
        else if (monomertype == org.helm.webeditor.HELM.AA)
            return this._getFirstKey(org.helm.webeditor.Monomers.aas, "A");
        else if (monomertype == org.helm.webeditor.HELM.CHEM)
            return this._getFirstKey(org.helm.webeditor.Monomers.chems, "R");
        else if (monomertype == org.helm.webeditor.HELM.BLOB)
            return this._getFirstKey(org.helm.webeditor.Monomers.blobs);
        return "?";
    },

    /**
    * Tool function (internal use)
    * @function _getFirstKey
    */
    _getFirstKey: function (set, key1, key2) {
        if (key1 != null && set[key1.toLowerCase()] != null)
            return set[key1.toLowerCase()].id;
        if (key2 != null && set[key2.toLowerCase()] != null)
            return set[key2.toLowerCase()].id;

        for (var k in set)
            return k;
        return "?";
    },

    /**
    * Save monomers as text database (internal use)
    * @function saveTextDB
    */
    saveTextDB: function (url) {
        var cols = ["id", "symbol", "name", "naturalanalog", "molfile", "smiles", "polymertype", "monomertype", "r1", "r2", "r3", "r4", "r5", "author", "createddate"];
        var s = "";
        var n = { n: 0 };
        s += this.saveMonomersAsText(this.aas, "PEPTIDE", "Undefined", cols, n);
        s += this.saveMonomersAsText(this.sugars, "RNA", "Backbone", cols, n);
        s += this.saveMonomersAsText(this.linkers, "RNA", "Backbone", cols, n);
        s += this.saveMonomersAsText(this.bases, "RNA", "Branch", cols, n);
        s += this.saveMonomersAsText(this.chems, "CHEM", "Undefined", cols, n);

        s = n.n + "\n" + s;
        if (url == null)
            return s;

        var args = { client: "jsdraw", wrapper: "none", filename: "monomers.txt", directsave: 1, contents: s };
        scil.Utils.post(url, args, "_blank");
    },

    /**
    * Save monomers into xml string (internal use)
    * @function saveMonomerDB
    */
    saveMonomerDB: function (url) {
        var s = "<MONOMER_DB>\n";
        s += "<PolymerList>\n";

        s += "<Polymer polymerType='PEPTIDE'>\n";
        s += this.saveMonomers(this.aas, "PEPTIDE", "Undefined");
        s += "</Polymer>\n";

        s += "<Polymer polymerType='RNA'>\n";
        s += this.saveMonomers(this.sugars, "RNA", "Backbone");
        s += this.saveMonomers(this.linkers, "RNA", "Backbone");
        s += this.saveMonomers(this.bases, "RNA", "Branch");
        s += "</Polymer>\n";

        s += "<Polymer polymerType='CHEM'>\n";
        s += this.saveMonomers(this.chems, "CHEM", "Undefined");
        s += "</Polymer>\n";

        s += "</PolymerList>\n";
        s += "</MONOMER_DB>";

        if (url == null)
            return s;

        var args = { client: "jsdraw", wrapper: "none", filename: "HELMMonomerDB.xml", directsave: 1, contents: s };
        scil.Utils.post(url, args, "_blank");
    },

    /**
    * Save all monomers into a text file
    * @function saveMonomersAsText
    */
    saveMonomersAsText: function (set, type, mt, cols, n) {
        var ret = "";
        for (var id in set) {
            var s = this.writeOneAsText({ id: ++n.n, symbol: id, monomertype: mt, polymertype: type, name: set[id].n, naturalanalog: set[id].na, m: set[id] }, cols);
            ret += JSDraw2.Base64.encode(s) + "\n";
        }

        return ret;
    },

    /**
    * Save all Monomers into xml 
    * @function saveMonomers
    */
    saveMonomers: function (set, type, mt) {
        var s = "";
        for (var id in set)
            s += this.writeOne({ id: id, mt: mt, type: type, m: set[id] });
        return s;
    },

    /**
    * Load monomer from a web service
    * @function loadFromUrl
    */
    loadFromUrl: function (url, callback) {
        var fn = function (xml) {
            org.helm.webeditor.monomers.loadFromXml(xml);
            if (callback != null)
                callback();
        };
        scil.Utils.download(url, fn);
    },

    /**
    * Load monomer from xml string 
    * @function loadFromXml
    */
    loadFromXml: function (s) {
        var doc = scil.Utils.parseXml(s);
        if (doc == null)
            return false;
        this.loadMonomers(doc);
    },

    /**
    * Load monomer from json array coming from database
    * @function loadDB
    */
    loadDB: function (list, makeMon, clearall) {
        if (clearall != false)
            this.clear();

        if (list.length == null && list.list != null)
            list = list.list;

        for (var i = 0; i < list.length; ++i) {
            var x = list[i];

            var m = null;
            if (makeMon != null) {
                m = makeMon(x);
            }
            else {
                m = { id: x.symbol, n: x.name, na: x.naturalanalog, type: x.polymertype, mt: x.monomertype, m: x.molfile };

                m.at = {};
                var rs = 0;
                for (var r = 1; r <= 5; ++r) {
                    if (x["r" + r]) {
                        m.at["R" + r] = x["r" + r];
                        ++rs;
                    }
                }
                m.rs = rs;
            }

            this.addOneMonomer(m);
        }
    },

    /**
    * Load monomer from XML 
    * @function loadMonomers
    */
    loadMonomers: function (doc, callback) {
        var list = doc.getElementsByTagName("Monomer");
        if (list == null || list.length == 0)
            return false;

        if (callback == null) {
            for (var i = 0; i < list.length; ++i) {
                var m = this.readOne(list[i]);
                if (m != null)
                    this.addOneMonomer(m);
            }
            return true;
        }

        var newmonomers = [];
        var overlapped = [];
        for (var i = 0; i < list.length; ++i) {
            var m = this.readOne(list[i]);
            var old = this.getMonomer(this.helm2Type(m), m.id);
            if (old == null)
                newmonomers.push(m);
            else {
                if (!org.helm.webeditor.Interface.molEquals(old, m))
                    overlapped.push(m);
            }
        }

        var me = this;
        this.renameNextMonomer(newmonomers, overlapped, function () {
            var renamed = [];
            for (var i = 0; i < newmonomers.length; ++i) {
                var m = newmonomers[i];
                me.addOneMonomer(m);
                if (m.oldname != null)
                    renamed.push(m);
            }
            callback(renamed);
        });
    },

    /**
    * Rename a monomer (internal use)
    * @function renameNextMonomer
    */
    renameNextMonomer: function (newmonomers, overlapped, callback) {
        if (overlapped.length == 0) {
            callback();
            return;
        }

        var me = this;
        var m = overlapped[0];

        scil.Utils.prompt2({
            caption: "Duplicate Monomer",
            message: "Monomer name, " + m.id + ", is used. Please enter a new name for it:",
            callback: function (s) {
                if (me.getMonomer(m.type, s) == null) {
                    m.oldname = m.id;
                    m.id = s;
                    newmonomers.push(m);
                    overlapped.splice(0, 1);
                }
                me.renameNextMonomer(newmonomers, overlapped, callback);
            }
        });
    },

    /**
    * Get the monomer set by its type (internal use)
    * @function getMonomerSet
    */
    getMonomerSet: function (a) {
        if (a == null)
            return null;
        if (a.T == "ATOM")
            a = a.biotype();
        if (a == org.helm.webeditor.HELM.BASE)
            return org.helm.webeditor.monomers.bases;
        else if (a == org.helm.webeditor.HELM.SUGAR)
            return org.helm.webeditor.monomers.sugars;
        else if (a == org.helm.webeditor.HELM.LINKER)
            return org.helm.webeditor.monomers.linkers;
        else if (a == org.helm.webeditor.HELM.AA)
            return org.helm.webeditor.monomers.aas;
        else if (a == org.helm.webeditor.HELM.CHEM)
            return org.helm.webeditor.monomers.chems;
        else if (a == org.helm.webeditor.HELM.BLOB)
            return org.helm.webeditor.monomers.blobs;
        return null;
    },

    /**
    * Get all monomer colors (internal use)
    * @function getMonomerColors
    */
    getMonomerColors: function (a) {
        if (a == null)
            return null;
        if (a.T == "ATOM")
            a = a.biotype();
        if (a == org.helm.webeditor.HELM.BASE)
            return org.helm.webeditor.MonomerColors.bases;
        else if (a == org.helm.webeditor.HELM.SUGAR)
            return org.helm.webeditor.MonomerColors.sugars;
        else if (a == org.helm.webeditor.HELM.LINKER)
            return org.helm.webeditor.MonomerColors.linkers;
        else if (a == org.helm.webeditor.HELM.AA)
            return org.helm.webeditor.MonomerColors.aas;
        else if (a == org.helm.webeditor.HELM.CHEM)
            return org.helm.webeditor.MonomerColors.chems;
        else if (a == org.helm.webeditor.HELM.BLOB)
            return org.helm.webeditor.MonomerColors.blobs;
        return null;
    },

    /**
    * Get monomer list of a type (internal use)
    * @function getMonomerList
    */
    getMonomerList: function (a) {
        var set = this.getMonomerSet(a);
        if (set == null)
            return null;

        var ret = [];
        for (var k in set)
            ret.push(set[k].id);

        return ret;
    },

    /**
    * Get a monomer by an object or its name (internal use)
    * @function getMonomer
    */
    getMonomer: function (a, name) {
        if (a == null && name == null)
            return null;

        var s, biotype;
        if (name == null) {
            biotype = a.biotype();
            s = a.elem;
        }
        else {
            biotype = a;
            s = org.helm.webeditor.IO.trimBracket(name);
        }

        if (s == "?") {
            return { id: '?', n: "?", na: '?', rs: 2, at: { R1: 'H', R2: 'H' }, m: "" };
        }

        var set = this.getMonomerSet(biotype);
        return set == null ? null : set[s.toLowerCase()];
    },

    /**
    * Check if the monomer have a R group (internal use)
    * @function hasR
    */
    hasR: function (type, name, r) {
        var m = this.getMonomer(type, name);
        return m != null && m.at != null && m.at[r] != null;
    },

    /**
    * Get monomer color by a monomer object (internal use)
    * @function getColor
    */
    getColor: function (a) {
        var m = this.getMonomer(a, a.elem);
        if (m == null)
            m = {};

        var mc = this.getMonomerColors(a);
        if (mc == null)
            mc = {};
        var color = mc[m.na];

        if (m.backgroundcolor == null && a.elem == "?")
            m.backgroundcolor = org.helm.webeditor.MonomerColors.unknown;

        return {
            linecolor: m.linecolor == null ? "#000" : m.linecolor,
            backgroundcolor: m.backgroundcolor == null ? (color == null ? "#eee" : color) : m.backgroundcolor,
            textcolor: m.textcolor == null ? "#000" : m.textcolor,
            nature: m.nature
        };
    },

    /**
    * Get monomer color by type by name (internal use)
    * @function getColor2
    */
    getColor2: function (type, name) {
        var m = this.getMonomer(type, name);
        if (m == null)
            m = {};

        var mc = this.getMonomerColors(type);
        if (mc == null)
            mc = {};
        var color = mc[m.na];

        return {
            linecolor: m.linecolor == null ? "#000" : m.linecolor,
            backgroundcolor: m.backgroundcolor == null ? (color == null ? "#eee" : color) : m.backgroundcolor,
            textcolor: m.textcolor == null ? "#000" : m.textcolor,
            nature: m.nature
        };
    },

    /**
    * Get the molfile of a monomer (internal use)
    * @function getMolfile
    */
    getMolfile: function (m) {
        if (m != null && m.m == null && m.mz != null)
            m.m = org.helm.webeditor.IO.uncompressGz(m.mz);
        return m == null ? null : m.m;
    },

    /**
    * Convert XML type to HELM Editor type (internal use)
    * @function helm2Type
    */
    helm2Type: function (m) {
        if (m.type == "PEPTIDE")
            return org.helm.webeditor.HELM.AA;
        else if (m.type == "CHEM")
            return org.helm.webeditor.HELM.CHEM;
        else if (m.type == "RNA") {
            if (m.mt == "Branch")
                return org.helm.webeditor.HELM.BASE;
            if (m.mt == "Backbone") {
                if (m.na == "P" || m.na == "p")
                    return org.helm.webeditor.HELM.LINKER;
                else
                    return org.helm.webeditor.HELM.SUGAR;
            }
        }
        return null;
    },

    smilesmonomerid: 0,
    smilesmonomers: {},
    addSmilesMonomer: function (type, smiles) {
        var ss = this.findSmilesRs(smiles);
        if (ss == null || ss.length == 0)
            return null;

        if (this.smilesmonomers[smiles] != null)
            return this.smilesmonomers[smiles];

        var m = { at: {}, smiles: smiles, issmiles: true };
        m.id = "#" + (++this.smilesmonomerid);
        m.name = "SMILES Monomer #" + this.smilesmonomerid;
        for (var i = 0; i < ss.length; ++i)
            m.at[ss[i]] = "H";
        m.rs = ss.length;
        var set = this.getMonomerSet(type);
        set[m.id.toLowerCase()] = m;

        this.smilesmonomers[smiles] = m;
        return m;
    },

    findSmilesRs: function (s) {
        // "C[13C@H](N[*])C([*])=O |$;;;_R1;;_R2;$|"

        var ret = [];
        // JSDraw like Rs
        for (var i = 1; i <= 5; ++i) {
            var s2 = s.replace(new RegExp("\\[R" + i + "\\]"), "");
            if (s2.length == s.length)
                continue;
            s = s2;
            ret.push("R" + i);
        }

        if (ret.length == 0) {
            // ChemAxon like Rs
            for (var i = 1; i <= 5; ++i) {
                var s2 = s.replace(new RegExp("_R" + i), "");
                if (s2.length == s.length)
                    continue;
                s = s2;
                ret.push("R" + i);
            }
        }

        return ret;
    },

    /**
    * add one monomer to HELM Editor (internal use)
    * @function addOneMonomer
    */
    addOneMonomer: function (m) {
        var set = this.getMonomerSet(this.helm2Type(m));
        if (set == null)
            return false;

        delete m.type;
        delete m.mt;

        set[m.id.toLowerCase()] = m;
        return true;
    },

    /**
    * Write one monomer into text file (internal use)
    * @function writeOneAsText
    */
    writeOneAsText: function (m, cols) {
        var molfile = m.m.mz;
        if (scil.Utils.isNullOrEmpty(molfile) && m.m.m != null)
            molfile = m.m.m;

        m.molfile = molfile;
        if (m.m.at != null) {
            for (var x in m.m.at)
                m[x.toLowerCase()] = m.m.at[x];
        }

        var s = "";
        for (var i = 0; i < cols.length; ++i) {
            if (i > 0)
                s += "|";
            var k = cols[i];
            s += m[k] == null ? "" : m[k];
        }
        return s;
    },

    /**
    * Save one monomer into xml (internal use)
    * @function writeOne
    */
    writeOne: function (m) {
        var molfile = this.getMolfile(m.m);
        if (molfile != null) {
            var s = org.helm.webeditor.IO.compressGz(molfile); // compress molfile
            if (s != null)
                molfile = s;
        }

        var s = "<Monomer>\n";
        s += "<MonomerID>" + scil.Utils.escXmlValue(m.id) + "</MonomerID>\n";
        s += "<MonomerSmiles>" + scil.Utils.escXmlValue(m.smiles) + "</MonomerSmiles>\n";
        s += "<MonomerMolFile>" + scil.Utils.escXmlValue(molfile) + "</MonomerMolFile>\n";
        s += "<NaturalAnalog>" + scil.Utils.escXmlValue(m.m.na) + "</NaturalAnalog>\n";
        s += "<MonomerType>" + scil.Utils.escXmlValue(m.mt) + "</MonomerType>\n";
        s += "<PolymerType>" + scil.Utils.escXmlValue(m.type) + "</PolymerType>\n";
        if (m.m.at != null) {
            s += "<Attachments>\n";
            for (var r in m.m.at) {
                var cap = m.m.at[r];
                s += "<Attachment>\n";
                s += "<AttachmentID>" + r + "-" + cap + "</AttachmentID>\n";
                s += "<AttachmentLabel>" + r + "</AttachmentLabel>\n";
                s += "<CapGroupName>" + cap + "</CapGroupName>\n";
                s += "<CapGroupSmiles></CapGroupSmiles>\n";
                s += "</Attachment>\n";
            }
            s += "</Attachments>\n";
        }
        s += "</Monomer>\n";
        return s;
    },

    /**
    * Read one monomer from XML (internal use)
    * @function readOne
    */
    readOne: function (e) {
        var s = this.readValue(e, "MonomerMolFile");
        var m = null;
        var mz = null;
        if (s != null) {
            if (s.indexOf("M  END") > 0)
                m = s; // uncompressed molfile
            else
                mz = s; // compressed molfile
        }

        var m = {
            type: this.readValue(e, "PolymerType"),
            mt: this.readValue(e, "MonomerType"),
            id: this.readValue(e, "MonomerID"),
            n: this.readValue(e, "MonomerName"),
            na: this.readValue(e, "NaturalAnalog"),
            mz: mz,
            m: m,
            at: {}
        };

        var rs = 0;
        var list = e.getElementsByTagName("Attachment");
        if (list != null) {
            for (var i = 0; i < list.length; ++i) {
                var a = list[i];
                var r = this.readValue(a, "AttachmentLabel");
                var cap = this.readValue(a, "CapGroupName");
                if (m.at[r] == null)
                    ++rs;
                m.at[r] = cap;
            }
        }

        m.rs = rs;
        return m;
    },

    /**
    * Tool function to ready XML text (internal use)
    * @function readValue
    */
    readValue: function (e, name) {
        var list = e.getElementsByTagName(name);
        if (list == null || list.length == 0)
            return null;
        return scil.Utils.getInnerText(list[0]);
    }
};

org.helm.webeditor.monomers = org.helm.webeditor.Monomers;



scil.helm.Monomers.aas = {
    'd': { id: 'D', n: 'Aspartic acid', na: 'D', m: '\n  Marvin  12021015502D          \n\n 10  9  0  0  0  0            999 V2000\n    7.4800   -2.7926    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.7655   -3.2050    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    6.0510   -2.7925    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.3365   -3.2049    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.6220   -2.7924    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.3364   -4.0299    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    7.4801   -1.9676    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.7654   -4.0300    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    8.1945   -3.2052    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    6.0510   -4.4425    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  6  1  0  0  0  0\n  4  5  2  0  0  0  0\n  8 10  1  0  0  0  0\nM  RGP  3   6   3   9   2  10   1\nM  END\n\n$$$$\n', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H'} },
    'e': { id: 'E', n: 'Glutamic acid', na: 'E', m: '\n  Marvin  12021015512D          \n\n 11 10  0  0  0  0            999 V2000\n    0.8787   -0.2594    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n    0.1643    0.1532    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.5503   -0.2592    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2646    0.1534    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5933    0.1530    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9792   -0.2590    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2645    0.9784    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5934    0.9780    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8786   -1.0844    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.3077   -0.2596    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    0.1641   -1.4969    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  1  0  0  0  0\n  1  9  1  0  0  0  0\n  1  2  1  1  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  7  2  0  0  0  0\n  4  6  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\nM  RGP  3   6   3  10   2  11   1\nM  END\n\n$$$$\n', rs: 3, at: { R2: 'OH', R3: 'OH', R1: 'H'} },
    'f': { id: 'F', n: 'Phenylalanine', na: 'F', m: '\n  Marvin  08190815502D          \n\n 13 13  0  0  0  0            999 V2000\n   -3.6075    2.0774    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.3219    1.6650    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.3220    0.8400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.6077    0.4274    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.8931    0.8398    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.8930    1.6648    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1785    2.0772    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.4640    1.6646    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -1.4641    0.8396    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7495    2.0770    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7493    2.9021    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0351    1.6644    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1786    0.4271    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8  7  1  1  0  0  0\n  8  9  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  2  0  0  0  0\n 10 12  1  0  0  0  0\n  9 13  1  0  0  0  0\nM  RGP  2  12   2  13   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'g': { id: 'G', n: 'Glycine', na: 'G', m: '\n  Marvin  08190815292D          \n\n  6  5  0  0  0  0            999 V2000\n   -0.7189   -0.6069    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0044   -0.1945    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0043    0.6304    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7190   -1.4318    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7101   -0.6071    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -1.4335   -1.8443    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  2  5  1  0  0  0  0\n  4  6  1  0  0  0  0\nM  RGP  2   5   2   6   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'a': { id: 'A', n: 'Alanine', na: 'A', m: '\n  Marvin  06250814262D          \n\n  7  6  0  0  0  0            999 V2000\n    5.4886   -3.0482    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2031   -3.4608    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n    6.9176   -3.0483    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2030   -4.2858    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    6.9177   -2.2233    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    7.6321   -3.4609    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    5.4886   -4.6983    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  1  0  0  0\n  4  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  5  2  0  0  0  0\n  3  6  1  0  0  0  0\n  4  7  1  0  0  0  0\nM  RGP  2   6   2   7   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'c': { id: 'C', n: 'Cysteine', na: 'C', m: '\n  Marvin  12021015502D          \n\n  9  8  0  0  0  0            999 V2000\n    0.8481    0.4124    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.1336    0.0000    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -0.5808    0.4126    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2952    0.0001    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    0.1335   -0.8249    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8482    1.2374    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5625   -0.0001    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -0.5810   -1.2374    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0097    0.4126    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  7  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nM  RGP  3   7   2   8   1   9   3\nM  END\n\n$$$$\n', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H'} },
    'l': { id: 'L', n: 'Leucine', na: 'L', m: '\n  Marvin  08200815002D          \n\n 10  9  0  0  0  0            999 V2000\n   -2.7541    2.1476    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4686    0.9102    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4686    1.7352    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.1830    2.1477    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0397    1.7351    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -1.3250    2.1476    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.3250    2.9726    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0397    0.9101    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.6105    1.7350    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7542    0.4976    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  1  0  0  0  0\n  5  1  1  1  0  0  0\n  3  2  1  0  0  0  0\n  3  4  1  0  0  0  0\n  5  8  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  9  1  0  0  0  0\n  8 10  1  0  0  0  0\nM  RGP  2   9   2  10   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'm': { id: 'M', n: 'Methionine', na: 'M', m: '\n  Marvin  08190815482D          \n\n 10  9  0  0  0  0            999 V2000\n   -4.1128    0.8183    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.8273   -0.4191    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.1127    1.6433    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.8272    0.4059    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -5.5418    0.8185    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.2563    0.4061    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -7.6852    0.4062    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.9707    0.8186    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3983    0.4057    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -5.5418   -0.8316    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  9  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  8  7  1  0  0  0  0\n  2 10  1  0  0  0  0\nM  RGP  2   9   2  10   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'n': { id: 'N', n: 'Asparagine', na: 'N', m: '\n  Marvin  08190815142D          \n\n 10  9  0  0  0  0            999 V2000\n    6.9268   -2.8241    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2123   -3.2366    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    5.4978   -2.8241    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.9268   -1.9991    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2123   -4.0616    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.7834   -3.2366    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.0690   -2.8242    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.7834   -4.0616    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    7.6413   -3.2366    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    5.6290   -4.6450    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  4  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  9  1  0  0  0  0\n  2  5  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  6  1  0  0  0  0\n  6  8  1  0  0  0  0\n  6  7  2  0  0  0  0\n  5 10  1  0  0  0  0\nM  RGP  2   9   2  10   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'h': { id: 'H', n: 'Histidine', na: 'H', m: '\n  Marvin  08190815312D          \n\n 12 12  0  0  0  0            999 V2000\n    1.2557    0.4210    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5412    0.0086    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -0.1733    0.4211    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.8878    0.0087    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1685   -0.3674    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.9114   -0.8159    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.6648    0.2860    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.7029   -1.0484    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5411   -0.8164    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2558    1.2461    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9702    0.0084    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -0.1733   -1.2289    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n 10  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 11  1  0  0  0  0\n  2  9  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  6  4  2  0  0  0  0\n  7  4  1  0  0  0  0\n  7  5  2  0  0  0  0\n  5  8  1  0  0  0  0\n  8  6  1  0  0  0  0\n  9 12  1  0  0  0  0\nM  RGP  2  11   2  12   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'i': { id: 'I', n: 'Isoleucine', na: 'I', m: '\n  Marvin  08190815422D          \n\n 10  9  0  0  0  0            999 V2000\n   -0.7783   -0.6153    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.4928   -0.2028    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.6506   -0.6155    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n    1.3652   -0.2031    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.3653    0.6219    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.6505   -1.4405    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0638   -0.2029    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -0.0637    0.6221    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0796   -0.6157    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0640   -1.8530    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  1  0  0  0  0\n  1  2  1  0  0  0  0\n  3  7  1  0  0  0  0\n  3  6  1  0  0  0  0\n  3  4  1  1  0  0  0\n  4  5  2  0  0  0  0\n  4  9  1  0  0  0  0\n  7  8  1  6  0  0  0\n  6 10  1  0  0  0  0\nM  RGP  2   9   2  10   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'k': { id: 'K', n: 'Lysine', na: 'K', m: '\n  Marvin  12021015522D          \n\n 12 11  0  0  0  0            999 V2000\n   -1.2102    2.0919    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9248    1.6794    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -2.6392    2.0920    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3538    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.0682    2.0920    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7828    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.4972    2.0921    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9248    0.8544    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2102    2.9169    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4958    1.6794    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6393    0.4419    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -6.2117    1.6796    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  9  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  8  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  8 11  1  0  0  0  0\n  7 12  1  0  0  0  0\nM  RGP  3  10   2  11   1  12   3\nM  END\n\n$$$$\n', rs: 3, at: { R2: 'OH', R1: 'H', R3: 'H'} },
    't': { id: 'T', n: 'Threonine', na: 'T', m: '\n  Marvin  08190820372D          \n\n  9  8  0  0  0  0            999 V2000\n   -3.2927    2.1067    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.0072    0.8691    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.2926    2.9316    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.0071    1.6941    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -5.4360    1.6943    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7216    2.1068    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -4.7215    2.9317    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.5783    1.6942    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7217    0.4566    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  4  1  1  1  0  0  0\n  1  8  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  6  1  0  0  0  0\n  6  5  1  0  0  0  0\n  6  7  1  1  0  0  0\n  2  9  1  0  0  0  0\nM  RGP  2   8   2   9   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'w': { id: 'W', n: 'Tryptophan', na: 'W', m: '\n  Marvin  08190820412D          \n\n 16 17  0  0  0  0            999 V2000\n   -0.4698    2.4303    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4698    3.2553    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.1843    1.1927    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.1843    2.0177    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -1.8988    2.4303    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6133    2.0177    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6271    1.1929    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3935    2.2860    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.8895    1.6267    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.7164    3.0451    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.5353    3.1451    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.0313    2.4859    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7084    1.7267    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4159    0.9513    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.2447    2.0178    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -1.8988    0.7802    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 15  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  8  6  1  0  0  0  0\n 14  7  1  0  0  0  0\n  8  9  2  0  0  0  0\n  8 10  1  0  0  0  0\n  9 14  1  0  0  0  0\n 13  9  1  0  0  0  0\n 10 11  2  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  2  0  0  0  0\n  3 16  1  0  0  0  0\nM  RGP  2  15   2  16   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'v': { id: 'V', n: 'Valine', na: 'V', m: '\n  Marvin  08190820502D          \n\n  9  8  0  0  0  0            999 V2000\n   -5.2963    0.6040    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.0107    0.1915    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -6.7252    1.4290    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.7252    0.6040    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -7.4396    0.1915    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.2963    1.4290    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.0107   -0.6335    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.5818    0.1915    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -6.7252   -1.0460    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  6  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1  8  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  4  1  1  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  0  0  0  0\n  7  9  1  0  0  0  0\nM  RGP  2   8   2   9   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'q': { id: 'Q', n: 'Glutamine', na: 'Q', m: '\n  Marvin  08190815272D          \n\n 11 10  0  0  0  0            999 V2000\n    2.8012   -4.0307    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0867   -4.4433    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    1.3722   -4.0307    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.6578   -4.4433    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8013   -3.2057    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7711   -4.4432    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0867   -5.2683    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0565   -3.2056    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0566   -4.0306    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5157   -4.4432    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    1.3722   -5.6808    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  5  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 10  1  0  0  0  0\n  2  7  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  9  1  0  0  0  0\n  9  6  1  0  0  0  0\n  9  8  2  0  0  0  0\n  7 11  1  0  0  0  0\nM  RGP  2  10   2  11   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'p': { id: 'P', n: 'Proline', na: 'P', m: '\n  Marvin  08190815522D          \n\n  9  9  0  0  0  0            999 V2000\n   -3.4704    1.8073    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.9525    1.1377    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4647    0.4725    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6812    0.7308    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6848    1.5558    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n   -1.9703    1.9683    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9703    2.7933    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2558    1.5558    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0978    0.1474    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  5  1  1  1  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  2  0  0  0  0\n  6  8  1  0  0  0  0\n  4  9  1  0  0  0  0\nM  RGP  2   8   2   9   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    's': { id: 'S', n: 'Serine', na: 'S', m: '\n  Marvin  08190820582D          \n\n  8  7  0  0  0  0            999 V2000\n   -2.0394    2.5340    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0394    3.3589    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7539    1.2964    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7539    2.1214    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -3.4683    2.5340    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.1827    2.1215    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.3249    2.1215    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4684    0.8839    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  7  1  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n  3  8  1  0  0  0  0\nM  RGP  2   7   2   8   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'r': { id: 'R', n: 'Arginine', na: 'R', m: '\n  Marvin  08190814412D          \n\n 13 12  0  0  0  0            999 V2000\n    8.4822   -2.8352    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.7677   -3.2478    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    7.0532   -2.8351    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.3388   -3.2477    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.6244   -2.8351    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.7676   -4.0214    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    8.4822   -2.0102    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.9099   -3.2477    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1954   -2.8351    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1954   -2.0101    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.4810   -3.2477    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    9.1967   -3.2477    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    6.9708   -4.2349    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  7  1  2  0  0  0  0\n  1  2  1  0  0  0  0\n  1 12  1  0  0  0  0\n  2  6  1  0  0  0  0\n  2  3  1  1  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  9 11  1  0  0  0  0\n  9 10  2  0  0  0  0\n  6 13  1  0  0  0  0\nM  RGP  2  12   2  13   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'} },
    'y': { id: 'Y', n: 'Tyrosine', na: 'Y', m: '\n  Marvin  08190820432D          \n\n 14 14  0  0  0  0            999 V2000\n   -2.8122    1.4277    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.5268    0.1903    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.8121    2.2527    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.5267    1.0153    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n   -4.2412    1.4279    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.9557    1.0154    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.6701    1.4280    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.3846    1.0155    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.6702   -0.2220    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.9558    0.1904    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.3847    0.1905    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -7.0992   -0.2219    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0977    1.0151    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -4.2412   -0.2222    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  3  1  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1 13  1  0  0  0  0\n  4  2  1  0  0  0  0\n  4  5  1  1  0  0  0\n  5  6  1  0  0  0  0\n 10  6  1  0  0  0  0\n  7  6  2  0  0  0  0\n  7  8  1  0  0  0  0\n  8 11  2  0  0  0  0\n 11  9  1  0  0  0  0\n  9 10  2  0  0  0  0\n 11 12  1  0  0  0  0\n  2 14  1  0  0  0  0\nM  RGP  2  13   2  14   1\nM  END\n\n$$$$\n', rs: 2, at: { R2: 'OH', R1: 'H'}}
};
scil.helm.Monomers.sugars = {
    'r': { id: 'R', n: 'Ribose', na: 'R', m: '\n  Marvin  06150820452D          \n\n 12 12  0  0  0  0            999 V2000\n    1.4617    2.2807    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7479    1.8672    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n    2.1768    1.8692    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    0.9625    1.0707    0.0000 C   0  0  2  0  0  0  0  0  0  0  0  0\n    1.9644    1.0721    0.0000 C   0  0  1  0  0  0  0  0  0  0  0  0\n    0.9637    0.2457    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.9656    0.2471    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5994    2.7216    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1756    2.9004    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    0.1279    3.0752    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.6971    3.2298    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    1.6650   -0.3083    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\n  2  4  1  0  0  0  0\n  2  8  1  1  0  0  0\n  3  5  1  0  0  0  0\n  3  9  1  1  0  0  0\n  4  5  1  0  0  0  0\n  4  6  1  6  0  0  0\n  5  7  1  6  0  0  0\n  6 12  1  0  0  0  0\n  8 10  1  0  0  0  0\n 10 11  1  0  0  0  0\nM  RGP  3   9   3  11   1  12   2\nM  END\n\n$$$$\n', rs: 3, at: { R3: 'OH', R1: 'H', R2: 'H'}}
};
scil.helm.Monomers.linkers = {
    'p': { id: 'P', n: 'Phosphate', na: 'P', m: '\n  Marvin  06150820472D          \n\n  5  4  0  0  0  0            999 V2000\n    0.1179    0.7366    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7071    0.7366    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    0.1179    1.5616    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.9429    0.7366    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    0.1179   -0.0884    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  2  0  0  0  0\n  1  4  1  0  0  0  0\n  1  5  1  0  0  0  0\nM  RGP  2   2   1   4   2\nM  END\n\n$$$$\n', rs: 2, at: { R1: 'OH', R2: 'OH'}}
};
scil.helm.Monomers.bases = {
    'g': { id: 'G', n: 'Guanine', na: 'G', m: '\n  Marvin  06150820502D          \n\n 12 13  0  0  0  0            999 V2000\n   -1.7509   -3.8489    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.0364   -4.2614    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.0364   -5.0864    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.7509   -5.4989    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.4654   -5.0864    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.4654   -4.2614    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.3220   -5.4989    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3925   -5.0864    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3925   -4.2614    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.7509   -3.0239    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.1798   -5.4989    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.3220   -6.3239    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  5 11  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 12  1  0  0  0  0\n  8  9  2  0  0  0  0\nM  RGP  1  12   1\nM  END\n\n$$$$\n', rs: 1, at: { R1: 'H'} },
    'a': { id: 'A', n: 'Adenine', na: 'A', m: '\n  Marvin  06150816552D          \n\n 11 12  0  0  0  0            999 V2000\n   -4.0674   -0.7795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3529   -1.1920    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3529   -2.0170    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.0674   -2.4295    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7818   -2.0170    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.7818   -1.1920    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6384   -2.4295    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9240   -2.0170    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9240   -1.1920    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.0674    0.0455    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6384   -3.2545    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1 10  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  2  1  0  0  0  0\n  9  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  7  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  2  0  0  0  0\n  5  6  1  0  0  0  0\n  7  8  1  0  0  0  0\n  7 11  1  0  0  0  0\n  8  9  2  0  0  0  0\nM  RGP  1  11   1\nM  END\n\n$$$$\n', rs: 1, at: { R1: 'H'} },
    'c': { id: 'C', n: 'Cytosine', na: 'C', m: '\n  Marvin  06150820522D          \n\n  9  9  0  0  0  0            999 V2000\n   -1.3611   -7.5896    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.6466   -8.0021    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.6466   -8.8271    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.3611   -9.2396    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0755   -8.8271    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0755   -8.0021    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.3611   -6.7646    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7900   -9.2396    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.3611  -10.0646    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  6  2  0  0  0  0\n  1  7  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  6  1  0  0  0  0\n  5  8  2  0  0  0  0\nM  RGP  1   9   1\nM  END\n\n$$$$\n', rs: 1, at: { R1: 'H'} },
    'u': { id: 'U', n: 'Uracil', na: 'U', m: '\n  Marvin  06150820512D          \n\n  9  9  0  0  0  0            999 V2000\n   -1.2138  -11.7383    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4993  -12.1508    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4993  -12.9758    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2138  -13.3884    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9283  -12.9758    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9283  -12.1508    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2138  -10.9133    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6427  -13.3883    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.2138  -14.2134    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\nM  RGP  1   9   1\nM  END\n\n$$$$\n', rs: 1, at: { R1: 'H'} },
    't': { id: 'T', n: 'Thymine', na: 'T', m: '\n  Marvin  06150820542D          \n\n 10 10  0  0  0  0            999 V2000\n    5.8512   -2.0140    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.5686   -2.4215    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.5744   -3.2465    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.8628   -3.6641    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1454   -3.2565    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1396   -2.4315    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    5.8455   -1.1891    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    4.4339   -3.6740    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    5.8686   -4.4891    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    7.3655   -2.2080    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  7  2  0  0  0  0\n  1  6  1  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  2  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  4  9  1  0  0  0  0\n  5  8  2  0  0  0  0\n  5  6  1  0  0  0  0\n  2 10  1  0  0  0  0\nM  RGP  1   9   1\nM  END\n\n$$$$\n', rs: 1, at: { R1: 'H'}}
};
scil.helm.Monomers.chems = {
    'example': { id: 'Example', n: 'Symmetric Doubler', na: null, m: '\n  Marvin  09241011262D          \n\n 23 22  0  0  0  0            999 V2000\n   -3.8304    2.5045    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.8304    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.1159    1.2670    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.4014    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.6869    1.2670    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.9725    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.2580    1.2670    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4565    1.6795    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4565    2.5045    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.6869    0.4420    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1709    2.9170    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1709    3.7420    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8854    4.1545    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8854    4.9795    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.5448    2.9170    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.5448    3.7420    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.2593    4.1545    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.2593    4.9795    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1709    1.2670    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.5448    1.2670    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0994   -0.2725    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n   -5.9738    5.3920    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n    2.5999    5.3920    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  1  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  1  0  0  0  0\n  6  7  1  0  0  0  0\n  7  8  1  0  0  0  0\n  8  9  1  0  0  0  0\n  5 10  1  0  0  0  0\n  9 11  1  0  0  0  0\n 11 12  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 14  1  0  0  0  0\n  1 15  1  0  0  0  0\n 15 16  1  0  0  0  0\n 16 17  1  0  0  0  0\n 17 18  1  0  0  0  0\n  8 19  2  0  0  0  0\n  2 20  2  0  0  0  0\n 10 21  1  0  0  0  0\n 18 22  1  0  0  0  0\n 14 23  1  0  0  0  0\nM  RGP  3  21   1  22   2  23   3\nM  END\n\n$$$$\n', rs: 3, at: { R1: 'H', R2: 'H', R3: 'H'} },
    'r': { id: 'R', n: 'R', na: null, m: null, rs: 0, at: {}}
};