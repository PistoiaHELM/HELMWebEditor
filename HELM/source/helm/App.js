//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

org.helm.webeditor.App = scil.extend(scil._base, {
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;
        this.init(parent);
    },

    init: function (parent) {
        var me = this;

        var d = dojo.window.getBox();
        var leftwidth = 300;
        var rightwidth = d.w - 300 - 50;
        var topheight = d.h * 0.7;
        var bottomheight = d.h - topheight - 130;

        var tree = {
            caption: "Palette",
            marginBottom: "2px",
            onrender: function (div) { me.createPalette(div, leftwidth - 10, d.h - 80 - (me.options.mexfilter != false ? 30 : 0) - (me.options.mexfind ? 60 : 0)); }
        };
        this.page = new scil.Page(parent, tree, { resizable: true, leftwidth: leftwidth });
        scil.Utils.unselectable(this.page.explorer.left);

        var control = this.page.addDiv();
        var sel = scil.Utils.createSelect(control, ["Detailed Sequence", "Sequence"], "Detailed Sequence", null, { border: "none" });
        scil.connect(sel, "onchange", function () { me.swapCanvasSequence(); });

        this.canvasform = this.page.addForm({
            //caption: "Canvas",
            type: "custom",
            marginBottom: "2px",
            oncreate: function (div) { me.createCanvas(div, rightwidth, topheight); }
        });

        this.handle = this.page.addResizeHandle(function (delta) { return me.onresize(delta); }, 8);

        this.tabs = this.page.addTabs({ marginBottom: "2px", onShowTab: function () { me.updateProperties(); } });
        this.tabs.addForm({
            caption: "Sequence",
            type: "custom",
            tabkey: "sequence",            
            buttons: this.options.sequenceviewonly ? null : [{ src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply Sequence", onclick: function () { me.updateCanvas("sequence"); } }],
            oncreate: function (div) { me.createSequence(div, rightwidth, bottomheight); }
        });

        this.tabs.addForm({
            caption: "HELM",
            type: "custom",
            tabkey: "notation",
            buttons: this.options.sequenceviewonly ? null : [{ src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply HELM Notation", onclick: function () { me.updateCanvas("notation"); } }],
            oncreate: function (div) { me.createNotation(div, rightwidth, bottomheight); }
        });

        this.tabs.addForm({
            caption: "Properties",
            type: "custom",
            tabkey: "properties",
            oncreate: function (div) { me.createProperties(div, rightwidth, bottomheight); }
        });
    },

    swapCanvasSequence: function () {
        var a = this.canvasform.form.dom;
        var h = this.handle;
        var b = this.tabs.tabs.dom;
        if (h.nextSibling == b) {
            a.parentNode.insertBefore(b, a);
            a.parentNode.insertBefore(h, a);
        }
        else {
            a.parentNode.insertBefore(b, a.nextSibling);
            a.parentNode.insertBefore(h, a.nextSibling);
        }
    },

    onresize: function (delta) {
        if (this.handle.nextSibling == this.tabs.tabs.dom) {
            var top = this.canvas.dimension.y;
            var bottom = scil.Utils.parsePixel(this.sequence.style.height);
            if (top + delta > 80 && bottom - delta > 20) {
                this.canvas.resize(0, top + delta);
                this.sequence.style.height = (bottom - delta) + "px";
                this.notation.style.height = (bottom - delta) + "px";
                this.properties.parent.style.height = (bottom - delta) + "px";
                return true;
            }
        }
        else {
            var top = scil.Utils.parsePixel(this.sequence.style.height);
            var bottom = this.canvas.dimension.y;
            if (top + delta > 20 && bottom - delta > 80) {
                this.sequence.style.height = (top + delta) + "px";
                this.notation.style.height = (top + delta) + "px";
                this.properties.parent.style.height = (top + delta) + "px";
                this.canvas.resize(0, bottom - delta);
                return true;
            }
        }
        return false;
    },

    createPalette: function (div, width, height) {
        var opt = scil.clone(this.options);
        opt.width = width;
        opt.height = height;
        this.mex = new org.helm.webeditor.MonomerExplorer(div, null, opt);
    },

    createCanvas: function (div, width, height) {
        div.style.border = "solid 1px #eee";

        var me = this;
        var args = { skin: "w8", showtoolbar: this.options.canvastoolbar != false, helmtoolbar: true, showmonomerexplorer: true, inktools: false, width: width, height: height, ondatachange: function () { me.updateProperties(); } };

        this.canvas = org.helm.webeditor.Interface.createCanvas(div, args);
        this.canvas.helm.monomerexplorer = this.mex;
        this.mex.plugin = this.canvas.helm;

        this.canvas._testdeactivation = function (e, ed) {
            var src = e.target || e.srcElement;
            return scil.Utils.hasAnsestor(src, me.canvas.helm.monomerexplorer.div);
        };
    },

    createSequence: function (div, width, height) {
        var atts = {};
        if (this.options.sequenceviewonly)
            atts.readOnly = "readonly";
        this.sequence = scil.Utils.createElement(div, "textarea", null, { width: width, height: height }, atts);
    },

    createNotation: function (div, width, height) {
        var atts = {};
        if (this.options.sequenceviewonly)
            atts.readOnly = "readonly";
        this.notation = scil.Utils.createElement(div, "textarea", null, { width: width, height: height }, atts);
    },

    createProperties: function (div, width, height) {
        var d = scil.Utils.createElement(div, "div", null, { width: width, overflow: "scroll", height: height });

        var fields = {
            mw: { label: "MW", type: "number", unit: "Da" },
            mf: { label: "MF" }
        };
        this.properties = new scil.Form({ viewonly: true });
        this.properties.render(d, fields, { immediately: true });
    },

    resize: function () {
        var d = dojo.window.getBox();
        var width = d.w;
        var height = d.h;
        var left = d.l;
        var top = d.t;
    },

    updateCanvas: function (key) {
        var plugin = this.canvas.helm;
        var s = key == "sequence" ? this.sequence.value : this.notation.value;
        plugin.setSequence(s, null, plugin.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR), plugin.getDefaultNodeType(org.helm.webeditor.HELM.LINKER));
    },

    updateProperties: function () {
        switch (this.tabs.tabs.currentTabKey()) {
            case "sequence":
                if (this.sequence != null)
                    this.sequence.value = this.canvas.getSequence();
                break;
            case "notation":
                if (this.notation != null)
                    this.notation.value = this.canvas.getHelm();
                break;
            case "properties":
                this.calculateProperties();
                break;
        }
    },

    calculateProperties: function () {
        if (this.properties == null)
            return;

        var data = {};
        data.mw = this.canvas.getMolWeight();
        data.mf = this.canvas.getFormula(true);
        this.properties.setData(data);
    }
});