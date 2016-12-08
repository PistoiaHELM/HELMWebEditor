//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
// 2.0.0-2016-12-08
//
//////////////////////////////////////////////////////////////////////////////////


// https://github.com/PistoiaHELM/HELMEditor/blob/master/resources/conf/DefaultMonomerCategorizationTemplate.xml
// 

/**
@project HELM Web Editor
@version 2.0.0
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
    kVersion: "2.0.0.2016-11-21p",
    atomscale: 2,
    bondscale: 1.6,

    HELM: {
        BASE: "HELM_BASE",
        SUGAR: "HELM_SUGAR",
        LINKER: "HELM_LINKER",
        AA: "HELM_AA",
        CHEM: "HELM_CHEM"
    },

    isHelmNode: function (a) {
        if (a == null)
            return false;

        var biotype = typeof(a) == "string" ? a : a.biotype();
        return biotype == org.helm.webeditor.HELM.BASE || biotype == org.helm.webeditor.HELM.SUGAR || biotype == org.helm.webeditor.HELM.LINKER ||
            biotype == org.helm.webeditor.HELM.AA || biotype == org.helm.webeditor.HELM.CHEM;
    },

    monomerTypeList: function() {
        var monomertypes = { "": "" };
        monomertypes[org.helm.webeditor.HELM.BASE] = "Base";
        monomertypes[org.helm.webeditor.HELM.SUGAR] = "Sugar";
        monomertypes[org.helm.webeditor.HELM.LINKER] = "Linker";
        monomertypes[org.helm.webeditor.HELM.AA] = "Amino Acid";
        monomertypes[org.helm.webeditor.HELM.CHEM] = "Chem";
        return monomertypes;
    },

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
    }
};

scil.helm = org.helm.webeditor;
