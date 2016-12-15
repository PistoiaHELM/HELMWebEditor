//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* HELM Editor App class
* @class org.helm.webeditor.App
*/
org.helm.webeditor.App = scil.extend(scil._base, {
    /**
    @property {MonomerExplorer} mex - Monomer Explorer
    **/
    /**
    @property {JSDraw2.Editor} canvas - Drawing Canvas
    **/
    /**
    @property {DIV} notation - HELM Notation
    **/
    /**
    @property {DIV} sequence - Biological Sequence
    **/
    /**
    @property {scil.Form} properties - HELM Property Table
    **/
    /**
    @property {JSDraw2.Editor} structureview - Structure Viewer
    **/

    /**
    * @constructor App
    * @param {DOM} parent - The parent element to host the Editor App
    * @param {dict} options - options on how to render the App
    * <pre>
    * mexfontsize: {string} Monomer Explorer font size, e.g. "90%"
    * mexrnapinontab: {bool} show RNA pin icon on its tab on Monomer Explorer
    * mexmonomerstab: {bool} show Monomers tab on Monomer Explorer
    * mexfavoritefirst: {bool} display favorite items first on Monomer Explorer
    * mexfilter: {bool} display Filter box on Monomer Explorer
    * sequenceviewonly: {bool} show Sequence View in viewonly mode
    * showabout: {bool} show about button
    * topmargin: {number} top margin
    * calculatorurl: {string} ajax web service url to calculate properties
    * cleanupurl: {string} ajax web service url to clean up structures
    * monomersurl: {string} ajax web service url to load all monomers
    * rulesurl: {string} ajax web service url to load all rules
    *
    * <b>Example:</b>
    *    &lt;div id="div1" style="margin: 5px; margin-top: 15px"&gt;&lt;/div&gt;
    *    &lt;script type="text/javascript"&gt;
    *     scil.ready(function () {
    *         var app = new scil.helm.App("div1", { showabout: false, mexfontsize: "90%", mexrnapinontab: true, 
    *             topmargin: 20, mexmonomerstab: true, sequenceviewonly: false, mexfavoritefirst: true, mexfilter: true });
    *     });
    *    &lt;/script&gt;
    * </pre>
    **/
    constructor: function (parent, options) {
        this.toolbarheight = 30;

        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.mex = null;
        this.canvas = null;
        this.sequence = null;
        this.notation = null;
        this.properties = null;
        this.structureview = null;

        this.options = options == null ? {} : options;

        if (!scil.Utils.isNullOrEmpty(this.options.jsdrawservice))
            JSDrawServices = { url: this.options.jsdrawservice };

        if (this.options.rulesurl != null) {
            scil.Utils.ajax(this.options.rulesurl, function (ret) {
                if (ret.rules != null)
                    ret = ret.rules;
                org.helm.webeditor.RuleSet.loadDB(ret);
            });
        }

        if (this.options.monomersurl != null) {
            var me = this;
            scil.Utils.ajax(this.options.monomersurl, function (ret) {
                if (ret.monomers != null)
                    ret = ret.monomers;
                org.helm.webeditor.Monomers.loadDB(ret, me.options.monomerfun);
                me.init(parent);
            });
        }
        else {
            this.init(parent);
        }
    },

    calculateSizes: function () {
        var d = dojo.window.getBox();
        if (this.options.topmargin > 0)
            d.h -= this.options.topmargin;

        var leftwidth = 0;
        if (this.page != null && this.page.explorer != null && this.page.explorer.left != null)
            leftwidth = this.page.explorer.left.offsetWidth;
        if (!(leftwidth > 0))
            leftwidth = 300;

        var ret = { height: 0, topheight: 0, bottomheight: 0, leftwidth: 0, rightwidth: 0 };
        ret.height = d.h - 90 - (this.options.mexfilter != false ? 30 : 0) - (this.options.mexfind ? 60 : 0);
        ret.leftwidth = leftwidth;
        ret.rightwidth = d.w - leftwidth - 25;
        ret.topheight = d.h * 0.7;
        ret.bottomheight = d.h - ret.topheight - 130;

        return ret;
    },

    init: function (parent) {
        var me = this;

        var sizes = this.calculateSizes();

        var tree = {
            caption: this.options.topmargin > 0 ? null : "Palette",
            marginBottom: "2px",
            marginTop: this.options.topmargin > 0 ? "17px" : null,
            onresizetree: function (width) { me.resizeWindow(); },
            onrender: function (div) { me.treediv = div; me.createPalette(div, sizes.leftwidth - 10, sizes.height); }
        };
        this.page = new scil.Page(parent, tree, { resizable: true, leftwidth: sizes.leftwidth });
        scil.Utils.unselectable(this.page.explorer.left);

        var control = this.page.addDiv();
        var sel = scil.Utils.createSelect(control, ["Detailed Sequence", "Sequence"], "Detailed Sequence", null, { border: "none" });
        scil.connect(sel, "onchange", function () { me.swapCanvasSequence(); });

        this.canvasform = this.page.addForm({
            //caption: "Canvas",
            type: "custom",
            marginBottom: "2px",
            oncreate: function (div) { me.createCanvas(div, sizes.rightwidth, sizes.topheight); }
        });

        this.handle = this.page.addResizeHandle(function (delta) { return me.onresize(delta); }, 8);

        this.sequencebuttons = [
            { label: "Format", type: "select", items: ["", "RNA", "Peptide"], key: "format" },
            { src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply Sequence", onclick: function () { me.updateCanvas("sequence", false); } },
            { src: scil.Utils.imgSrc("img/add.gif"), label: "Append", title: "Append Sequence", onclick: function () { me.updateCanvas("sequence", true); } }
        ];

        this.tabs = this.page.addTabs({ marginBottom: "2px", onShowTab: function () { me.updateProperties(); } });
        this.tabs.addForm({
            caption: "Sequence",
            type: "custom",
            tabkey: "sequence",
            buttons: this.options.sequenceviewonly ? null : this.sequencebuttons,
            oncreate: function (div) { me.createSequence(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "HELM",
            type: "custom",
            tabkey: "notation",
            buttons: this.options.sequenceviewonly ? null : [
                { src: scil.Utils.imgSrc("img/moveup.gif"), label: "Apply", title: "Apply HELM Notation", onclick: function () { me.updateCanvas("notation", false); } },
                { src: scil.Utils.imgSrc("img/add.gif"), label: "Append", title: "Append HELM Notation", onclick: function () { me.updateCanvas("notation", true); } }
            ],
            oncreate: function (div) { me.createNotation(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "Properties",
            type: "custom",
            tabkey: "properties",
            oncreate: function (div) { me.createProperties(div, sizes.rightwidth, sizes.bottomheight); }
        });

        this.tabs.addForm({
            caption: "Structure View",
            type: "custom",
            tabkey: "structureview",
            oncreate: function (div) { me.createStructureView(div, sizes.rightwidth, sizes.bottomheight); }
        });

        scil.connect(window, "onresize", function (e) { me.resizeWindow(); });
    },

    resizeWindow: function () {
        var sizes = this.calculateSizes();
        this.canvas.resize(sizes.rightwidth, sizes.topheight - 70);

        var s = { width: sizes.rightwidth + "px", height: sizes.bottomheight + "px" };
        scil.apply(this.sequence.style, s);
        scil.apply(this.notation.style, s);

        s = { width: sizes.rightwidth + "px", height: (sizes.bottomheight + this.toolbarheight) + "px" };
        scil.apply(this.properties.parent.style, s);

        this.structureview.resize(sizes.rightwidth, sizes.bottomheight + this.toolbarheight);

        this.mex.resize(sizes.height);
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
                this.structureview.resize(0, bottom - delta);
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
                this.structureview.resize(0, top + delta);
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
        var args = {
            skin: "w8", showabout: this.options.showabout, showtoolbar: this.options.canvastoolbar != false, helmtoolbar: true, showmonomerexplorer: true,
            inktools: false, width: width, height: height, ondatachange: function () { me.updateProperties(); },
            onselectionchanged: function () { me.onselectionchanged(); },
            onselectcurrent: function (e, obj, ed) { me.onselectcurrent(e, obj, ed); }
        };

        this.canvas = org.helm.webeditor.Interface.createCanvas(div, args);
        this.canvas.helm.monomerexplorer = this.mex;
        this.mex.plugin = this.canvas.helm;

        this.canvas._testdeactivation = function (e, ed) {
            var src = e.target || e.srcElement;
            return scil.Utils.hasAnsestor(src, me.canvas.helm.monomerexplorer.div);
        };
    },

    onselectcurrent: function (e, obj, ed) {
        var a = JSDraw2.Atom.cast(obj);
        if (a == null || ed.start != null || ed.contextmenu != null && ed.contextmenu.isVisible()) {
            org.helm.webeditor.MolViewer.hide();
            return;
        }
        var type = a == null ? null : a.biotype();
        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        var s = a == null ? null : a.elem;
        var m = set == null ? null : set[s.toLowerCase()];
        org.helm.webeditor.MolViewer.show(e, type, m, s, ed);
    },

    createSequence: function (div, width, height) {
        var atts = {};
        if (!this.options.sequenceviewonly)
            atts.contenteditable = "true";
        this.sequence = scil.Utils.createElement(div, "div", null, { width: width, height: height, overfloatY: "scroll" }, atts);
    },

    createNotation: function (div, width, height) {
        var atts = {};
        if (!this.options.sequenceviewonly)
            atts.contenteditable = "true";
        this.notation = scil.Utils.createElement(div, "div", null, { width: width, height: height, overfloatY: "scroll" }, atts);
    },

    createProperties: function (div, width, height) {
        var d = scil.Utils.createElement(div, "div", null, { width: width, overflow: "scroll", height: height + this.toolbarheight });

        var fields = {
            mw: { label: "Molecular Weight" },
            mf: { label: "Molecular Formula" },
            ec: { label: "Extinction Coefficient" }
        };
        this.properties = new scil.Form({ viewonly: true });
        this.properties.render(d, fields, { immediately: true });
    },

    createStructureView: function (div, width, height) {
        var d = scil.Utils.createElement(div, "div", null, { width: width, height: height + this.toolbarheight });
        this.structureview = new JSDraw2.Editor(d, { viewonly: true })
    },

    resize: function () {
        var d = dojo.window.getBox();
        var width = d.w;
        var height = d.h;
        var left = d.l;
        var top = d.t;
    },

    updateCanvas: function (key, append) {
        var format = null;
        if (this.sequencebuttons != null)
            format = this.getValueByKey(this.sequencebuttons, "format");

        var plugin = this.canvas.helm;
        var s = null;
        if (key == "sequence") {
            s = scil.Utils.trim(scil.Utils.getInnerText(this.sequence));
            // fasta
            s = s.replace(/[\n][>|;].*[\r]?[\n]/ig, '').replace(/^[>|;].*[\r]?[\n]/i, '');
            // other space
            s = s.replace(/[ \t\r\n]+/g, '')
        }
        else {
            s = scil.Utils.getInnerText(this.notation);
        }
        plugin.setSequence(s, format, plugin.getDefaultNodeType(org.helm.webeditor.HELM.SUGAR), plugin.getDefaultNodeType(org.helm.webeditor.HELM.LINKER), append);
    },

    getValueByKey: function (list, key) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i].key == key)
                return list[i].b.value;
        }
        return null;
    },

    updateProperties: function () {
        switch (this.tabs.tabs.currentTabKey()) {
            case "sequence":
                if (this.sequence != null)
                    this.sequence.innerHTML = this.canvas.getSequence(true);
                break;
            case "notation":
                if (this.notation != null)
                    this.notation.innerHTML = this.canvas.getHelm(true);
                break;
            case "properties":
                this.calculateProperties();
                break;
            case "structureview":
                this.updateStructureView();
                break;
        }
    },

    onselectionchanged: function () {
        switch (this.tabs.tabs.currentTabKey()) {
            case "sequence":
                if (this.sequence != null) {
                    this.sequence.innerHTML = this.canvas.getSequence(true);
                }
                break;
            case "notation":
                if (this.notation != null)
                    this.notation.innerHTML = this.canvas.getHelm(true);
                break;
            case "structureview":
                this.updateStructureView();
                break;
        }
    },

    calculateProperties: function () {
        if (this.properties == null)
            return;

        var data = {};
        this.properties.setData(data);
        if (this.options.calculatorurl != null) {
            var me = this;
            var helm = this.canvas.getHelm();
            if (helm != null) {
                scil.Utils.ajax(this.options.calculatorurl, function (ret) {
                    me.properties.setData(ret);
                }, { helm: helm });
            }
        }
        else {
            data.mw = Math.round(this.canvas.getMolWeight() * 100) / 100;
            data.mf = this.canvas.getFormula(true);
            data.ec = Math.round(this.canvas.getExtinctionCoefficient(true) * 100) / 100;
            this.properties.setData(data);
        }
    },

    getSelectedAsMol: function (m) {
        var ret = new JSDraw2.Mol();
        for (var i = 0; i < m.atoms.length; ++i) {
            if (m.atoms[i].selected)
                ret.atoms.push(m.atoms[i]);
        }

        var atoms = ret.atoms;
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (b.selected && b.a1.selected && b.a2.selected)
                ret.bonds.push(b);
        }

        return ret;
    },

    selectBondsOfSelectedAtoms: function (m) {
        var n = 0;
        for (var i = 0; i < m.bonds.length; ++i) {
            var b = m.bonds[i];
            if (!b.selected && b.a1.selected && b.a2.selected) {
                b.selected = true;
                ++n;
            }
        }

        return n;
    },

    updateStructureView: function () {
        if (this.structureview == null)
            return;

        if (this.selectBondsOfSelectedAtoms(this.canvas.m) > 0)
            this.canvas.refresh();
        var selected = this.getSelectedAsMol(this.canvas.m);

        var m = null;
        var branches = {};
        var chains = org.helm.webeditor.Chain.getChains(selected, branches);
        if (chains == null || chains.length == 0) {
            if (selected != null && selected.atoms.length == 1) {
                // only a base selected
                var a = selected.atoms[0];
                var mon = org.helm.webeditor.Monomers.getMonomer(a);
                m = org.helm.webeditor.Interface.createMol(org.helm.webeditor.monomers.getMolfile(mon));
            }
        }
        else {
            this.canvas.m.clearFlag();
            org.helm.webeditor.Chain._removeChainID(this.canvas.m.atoms);
            for (var i = 0; i < chains.length; ++i)
                org.helm.webeditor.Chain._setChainID(chains[i], i);

            m = new JSDraw2.Mol();
            // expand backbone
            for (var i = 0; i < chains.length; ++i)
                chains[i]._expandBackbone(m, this.canvas.helm);

            if (branches != null) {
                // expand branches
                for (var i = 0; i < chains.length; ++i)
                    chains[i]._connectBranches(m, this.canvas.helm, branches);

                // connect cross chain bonds
                var bonds = branches.bonds;
                if (bonds != null) {
                    for (var i = 0; i < bonds.length; ++i) {
                        var b = bonds[i];
                        if (!b.f) {
                            var t = org.helm.webeditor.MolViewer.findR(m, "R" + b.r1, b.a1);
                            var s = org.helm.webeditor.MolViewer.findR(m, "R" + b.r2, b.a2);
                            if (t != null && s != null) {
                                m.atoms.splice(scil.Utils.indexOf(m.atoms, t.a1), 1);
                                m.bonds.splice(scil.Utils.indexOf(m.bonds, t.b), 1);

                                m.atoms.splice(scil.Utils.indexOf(m.atoms, s.a1), 1);
                                m.bonds.splice(scil.Utils.indexOf(m.bonds, s.b), 1);

                                var bond = new JSDraw2.Bond(t.a0, s.a0);
                                m.addBond(bond);
                            }
                        }
                    }
                }
            }

            org.helm.webeditor.Chain._removeChainID(this.canvas.m.atoms);
            this.canvas.m.clearFlag();
        }

        this.structureview.clear(true);
        if (m == null)
            return;

        if (this.options.cleanupurl != null) {
            var me = this;
            scil.Utils.ajax(this.options.cleanupurl, function (ret) {
                me.structureview.setMolfile(ret == null ? null : ret.output);
            }, { input: m.getMolfile(), inputformat: "mol", outputformat: "mol" });
        }
        else {
            this.structureview.setMolfile(m.getMolfile());
        }
    }
});

