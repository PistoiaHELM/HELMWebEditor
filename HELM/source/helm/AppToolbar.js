//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////


/**
* AppToolbar class
* @class org.helm.webeditor.AppToolbar
*/
org.helm.webeditor.AppToolbar = scil.extend(scil._base, {
    constructor: function (parent, imgpath, buttons) {
        if (typeof(parent) == "string")
            parent = scil.byId(parent);

        this.div = scil.Utils.createElement(parent, "div", null, { position: "absolute", zIndex: 1, top: "-70px", width: "100%", height: 80, background: "#eee", borderBottom: "1px solid gray" });
        var tbody = scil.Utils.createTable(this.div, null, null, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr");

        scil.Utils.createElement(tr, "td", "<img src='" + imgpath + "helm20.png' />", { width: "30%" });
        var td = scil.Utils.createElement(tr, "td", null, { width: "40%", textAlign: "center" });
        scil.Utils.createElement(tr, "td", null, { width: "30%" });

        tbody = scil.Utils.createTable(td, null, null, { textAlign: "center" });
        tbody.parentNode.setAttribute("align", "center");
        var tr1 = scil.Utils.createElement(tbody, "tr");
        var tr2 = scil.Utils.createElement(tbody, "tr");

        for (var i = 0; i < buttons.length; ++i) {
            var b = buttons[i];
            scil.Utils.createElement(tr2, "td", b.label, { padding: "0 10px 0 10px" });

            var d = scil.Utils.createElement(tr1, "td", null, { padding: "0 10px 0 10px" });
            if (b.url == null)
                d.innerHTML = "<img src='" + imgpath + b.icon + "' />";
            else
                d.innerHTML = "<a href='" + b.url + "'><img src='" +imgpath + b.icon + "' /></a>";
        }

        var me = this;
        scil.connect(this.div, "onmouseout", function (e) {
            me.div.style.top = "-70px";
        });
        scil.connect(this.div, "onmouseover", function (e) {
            me.div.style.top = "0";
        });
    }
});