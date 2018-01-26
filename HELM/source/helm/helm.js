/*******************************************************************************
* Copyright (C)2018, The Pistoia Alliance
*  Version 2.1.0.2018-01-26
* 
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

// https://github.com/PistoiaHELM/HELMEditor/blob/master/resources/conf/DefaultMonomerCategorizationTemplate.xml
// 

/**
@project HELM Web Editor
@version 2.1.0
@description HELM Web Editor built on JSDraw.Lite
*/

/**
* HELM namespace
* @namespace org.helm.webeditor
*/

/**
* HELM Version
* @property org.helm.webeditor.version
*/


if (typeof (org) == "undefined")
    org = {};
if (org.helm == null)
    org.helm = {};

org.helm.webeditor = {
    kVersion: "2.1.0.2017-11-13",
    atomscale: 2,
    bondscale: 1.6,
    allowHeadToHeadConnection: true,
    ambiguity: false,

    HELM: {
        BASE: "HELM_BASE",
        SUGAR: "HELM_SUGAR",
        LINKER: "HELM_LINKER",
        AA: "HELM_AA",
        CHEM: "HELM_CHEM",
        BLOB: "HELM_BLOB",
        NUCLEOTIDE: "HELM_NUCLETIDE" // only for the combo *
    },

    blobtypes: ["Bead", "Gold Particle"],

    /**
    * Test if a node is HELM monomer
    * @function isHelmNode
    */
    isHelmNode: function (a) {
        if (a == null)
            return false;

        var biotype = typeof (a) == "string" ? a : a.biotype();
        return biotype == org.helm.webeditor.HELM.BASE || biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.LINKER ||
            biotype == org.helm.webeditor.HELM.AA || biotype == org.helm.webeditor.HELM.CHEM || biotype == org.helm.webeditor.HELM.BLOB || biotype == org.helm.webeditor.HELM.NUCLEOTIDE;
    },

    /**
    * List HELM Monomer Types
    * @function monomerTypeList
    */
    monomerTypeList: function () {
        var monomertypes = { "": "" };
        monomertypes[org.helm.webeditor.HELM.BASE] = "Base";
        monomertypes[org.helm.webeditor.HELM.SUGAR] = "Sugar";
        monomertypes[org.helm.webeditor.HELM.LINKER] = "Linker";
        monomertypes[org.helm.webeditor.HELM.AA] = "Amino Acid";
        monomertypes[org.helm.webeditor.HELM.CHEM] = "Chem";
        return monomertypes;
    },

    symbolCase: function (s) {
        return s == null ? null : s.toLowerCase();
    },

    /**
    * Show about box
    * @function about
    */
    about: function () {
        var me = this;
        if (this.aboutDlg == null) {
            var div = scil.Utils.createElement(null, "div");
            scil.Utils.createElement(div, "img", null, { width: 425, height: 145 }, { src: scil.Utils.imgSrc("img/helm.png") });

            scil.Utils.createElement(div, "div", "Built on <a target=_blank href='http://www.jsdraw.com'>JSDraw.Lite " + JSDraw2.kFileVersion + "</a> (open source), by <a target=_blank href='http://www.scillignece.com'>Scilligence</a>", { textAlign: "right", paddingRight: "26px" });
            var tbody = scil.Utils.createTable(div, null, null, { borderTop: "solid 1px gray", width: "100%" });
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", this.kVersion);
            scil.Utils.createElement(tr, "td", "&copy; 2016, <a target='_blank' href='http://www.pistoiaalliance.org/'>http://www.pistoiaalliance.org/</a>", { textAlign: "center" });
            scil.Utils.createElement(scil.Utils.createElement(tbody, "tr"), "td", "&nbsp;");
            var btn = scil.Utils.createElement(scil.Utils.createElement(div, "div", null, { textAlign: "center" }), "button", "OK", { width: scil.Utils.buttonWidth + "px" });

            me.aboutDlg = new JSDraw2.Dialog("About HELM Web Editor", div);
            scil.connect(btn, "onclick", function (e) { me.aboutDlg.hide(); e.preventDefault(); });
        }
        this.aboutDlg.show();
    },

    isAmbiguous: function (elem, biotype) {
        if (elem == "*" || elem == "_" || biotype == org.helm.webeditor.HELM.AA && elem == 'X' ||
            (biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.BASE || biotype == org.helm.webeditor.HELM.LINKER) && elem == 'N') {
            return true;
        }

        if (!scil.Utils.startswith(elem, '(') || !scil.Utils.endswith(elem, ')'))
            return false;

        elem = elem.substr(1, elem.length - 2);
        var ss = org.helm.webeditor.IO.split(elem, ',');
        if (ss.length > 1)
            return true;

        ss = org.helm.webeditor.IO.split(elem, '+');
        if (ss.length > 1)
            return true;

        return false;
    }
};

scil.helm = org.helm.webeditor;
