//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.Editor = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof parent == "string")
            parent = scil.byId(parent);
        this.canvas = null;

        var tr = scil.Utils.createElement(scil.Utils.createTable(parent, 0, 0), "tr");
        var left = scil.Utils.createElement(tr, "td", null, null, { valign: "top" });
        var right = scil.Utils.createElement(tr, "td", null, null, { valign: "top" });

        var me = this;
        var fn = function () {
            me.canvas = new JSDraw(right, options);
            if (options.showmonomerexplorer) {
                me.canvas.helm.monomerexplorer = new org.helm.webeditor.MonomerExplorer(left, me.canvas.helm, { width: 300, height: options.height - 45 });
                me.canvas._testdeactivation = function (e, ed) {
                    var src = e.target || e.srcElement;
                    return scil.Utils.hasAnsestor(src, me.canvas.helm.monomerexplorer.div);
                };
            }
            if (options.onloaded != null)
                options.onloaded(me);
        };

        if (options.monomerlibraryxml != null)
            org.helm.webeditor.monomers.loadFromUrl(options.monomerlibraryxml, function () { fn(); });
        else
            fn();
    }
});