//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* MonomerExplorer class
* @class org.helm.webeditor.MonomerExplorer
*/
org.helm.webeditor.MonomerExplorer = scil.extend(scil._base, {
    constructor: function (parent, plugin, options) {
        this.plugin = plugin;
        this.options = options == null ? {} : options;
        this.height = null;
        var w = this.options.monomerwidth > 0 ? this.options.monomerwidth : 50;
        this.kStyle = { borderRadius: "5px", border: "solid 1px gray", backgroundRepeat: "no-repeat", display: "table", width: w, height: w, float: "left", margin: 2 };

        if (this.options.mexuseshape)
            this.kStyle.border = null;

        //this.lastselect = {};
        this.selected = {};
        this.selected[org.helm.webeditor.HELM.BASE] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.BASE);
        this.selected[org.helm.webeditor.HELM.LINKER] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.LINKER);
        this.selected[org.helm.webeditor.HELM.SUGAR] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.SUGAR);
        this.selected[org.helm.webeditor.HELM.AA] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.AA);
        this.selected[org.helm.webeditor.HELM.CHEM] = org.helm.webeditor.Monomers.getDefaultMonomer(org.helm.webeditor.HELM.CHEM);

        var me = this;
        this.div = scil.Utils.createElement(parent, "div", null, { fontSize: this.options.mexfontsize == null ? "90%" : this.options.mexfontsize });
        if (this.options.mexfind) {
            var d = scil.Utils.createElement(this.div, "div", null, { background: "#eee", borderBottom: "solid 1px gray", padding: "4px 0 4px 0" });
            var tbody = scil.Utils.createTable(d, 0, 0);
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", "Quick Replace:", null, { colSpan: 3 });
            this.findtype = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "select", null, { width: 100 });
            scil.Utils.listOptions(this.findtype, org.helm.webeditor.monomerTypeList(), null, true, false);

            tr = scil.Utils.createElement(tbody, "tr");
            this.findinput = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input", null, { width: 60 });
            scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "span", "&rarr;");
            this.findreplace = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input", null, { width: 60 });
            scil.Utils.createButton(scil.Utils.createElement(tr, "td", null, { textAlign: "right" }), { label: "Update", onclick: function () { me.findReplace(); } });
        }
        if (this.options.mexfilter != false) {
            var d = scil.Utils.createElement(this.div, "div", null, { background: "#eee", borderBottom: "solid 1px gray", padding: "4px 0 4px 0" });
            var tbody = scil.Utils.createTable(d, 0, 0);
            var tr = scil.Utils.createElement(tbody, "tr");
            scil.Utils.createElement(tr, "td", JSDraw2.Language.res("Filter") + ":", { paddingLeft: "5px" });
            this.filterInput = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "input");
            scil.connect(this.filterInput, "onkeyup", function (e) { me.filter(e); });
        }

        var tabs = [];
        if (this.options.mexmonomerstab)
            tabs.push({ caption: "Monomers", tabkey: "monomers" });
        else
            this.addMonomerTabs(tabs);
        tabs.push({ caption: "Rules", tabkey: "rule" });

        var width = this.options.width != null ? this.options.width : 300;
        this.height = this.options.height != null ? this.options.height : 400;
        this.tabs = new scil.Tabs(scil.Utils.createElement(this.div, "div", null, { padding: "5px" }), {
            onShowTab: function (td) { me.onShowTab(td); },
            tabpadding: this.options.mexmonomerstab ? "10px" : "5px 2px 1px 2px",
            tabs: tabs,
            marginBottom: 0
        });

        this.dnd = this.createDnD(this.div);
        scil.connect(document.body, "onmousemove", function (e) { me.showMol(e); });

        org.helm.webeditor.MonomerExplorer.loadNucleotides();
    },

    addMonomerTabs: function (tabs) {
        if (this.options.mexfavoritetab != false)
            tabs.push({ caption: "Favorite", tabkey: "favorite" });

        tabs.push({ caption: "Chem", tabkey: "chem" });
        tabs.push({ caption: "Peptide", tabkey: "aa" });
        tabs.push({ caption: "RNA", tabkey: "rna" });
    },

    findReplace: function () {
        this.plugin.replaceAll(this.findinput.value, this.findreplace.value, this.findtype.value);
    },

    filter: function (e) {
        var key = this.tabs.currentTabKey();
        if (key == "rule") {
            org.helm.webeditor.RuleSet.filterRules(this.rules, this.filterInput.value, this.rules_category.value);
        }
        else {
            this.filterGroup(this.filterInput.value);
        }


        //var tab = null;
        //if (key == "monomers") {
        //    key = this.monomerstabs.currentTabKey();
        //    if (key == "chem" || key == "aa")
        //        tab = this.monomerstabs.currenttab;
        //    else if (key == "rna")
        //        tab = this.rnatabs.currenttab;
        //}
        //else {
        //    tab = this.tabs.currenttab;
        //}

        //this.filterGroup(tab.clientarea, this.filterInput.value);
    },

    filterGroup: function (s) {
        if (s == "")
            s = null;

        var groups = this.curtab.clientarea.className == "filtergroup" ? [this.curtab.clientarea] : this.curtab.clientarea.getElementsByClassName("filtergroup");
        for (var k = 0; k < groups.length; ++k) {
            var startingwith = [];
            var containing = [];
            var hidden = [];

            var parent = groups[k];
            for (var i = 0; i < parent.childNodes.length; ++i) {
                var d = parent.childNodes[i];
                var name = scil.Utils.getInnerText(d);
                var f = 1;
                if (s != null) {
                    if (scil.Utils.startswith(name.toLowerCase(), s))
                        f = 1;
                    else if (name.toLowerCase().indexOf(s) >= 0)
                        f = 2;
                    else
                        f = 0;
                }

                if (f == 1)
                    startingwith.push({ id: name, div: d });
                else if (f == 2)
                    containing.push({ id: name, div: d });
                else
                    hidden.push(d);
            }

            startingwith.sort(org.helm.webeditor.MonomerExplorer.compareMonomers);
            if (containing.length > 0) {
                containing.sort(org.helm.webeditor.MonomerExplorer.compareMonomers);
                startingwith = startingwith.concat(containing);
            }

            var last = null;
            for (var i = 0; i < startingwith.length; ++i) {
                var d = startingwith[i];
                parent.insertBefore(d.div, parent.childNodes[i]);
                last = d.div;
                if (s != null)
                    d.div.firstChild.firstChild.innerHTML = this.highlightString(d.id, s);
                else
                    d.div.firstChild.firstChild.innerHTML = d.id;
                d.div.style.display = "table";
            }

            for (var i = 0; i < hidden.length; ++i)
                hidden[i].style.display = "none";
        }
    },

    highlightString: function (s, q) {
        var p = s.toLowerCase().indexOf(q);
        if (p < 0)
            return s;

        return s.substr(0, p) + "<span style='background:yellow'>" + s.substr(p, q.length) + "</span>" + s.substr(p + q.length);
    },

    reloadTab: function (type) {
        var key = null;
        switch (type) {
            case "nucleotide":
                key = type;
                break;
            case org.helm.webeditor.HELM.AA:
                key = "aa";
                break;
            case org.helm.webeditor.HELM.CHEM:
                key = "chem";
                break;
            case org.helm.webeditor.HELM.BASE:
                key = "base";
                break;
            case org.helm.webeditor.HELM.LINKER:
                key = "linker";
                break;
            case org.helm.webeditor.HELM.SUGAR:
                key = "sugar";
                break;
            default:
                return;
        }

        var td = this.tabs.findTab(key);
        if (td == null && this.monomerstabs != null)
            td = this.monomerstabs.findTab(key);
        if (td == null)
            td = this.rnatabs.findTab(key);

        if (td != null)
            this.onShowTab(td, true);
    },

    reloadTabs: function () {
        var list = this.tabs.tr.childNodes;
        for (var i = 0; i < list.length; ++i) {
            var td = list[i];
            scil.Utils.removeAll(td.clientarea);
            td._childrencreated = false;
        }

        this.onShowTab(this.tabs.currenttab);
    },

    resize: function (height) {
        this.height = height;

        if (this.divRule != null)
            this.divRule.style.height = this.getHeight("rule") + "px";
        if (this.divFavorite != null)
            this.divFavorite.style.height = this.getHeight("favorite") + "px";
        if (this.divChem != null)
            this.divChem.style.height = this.getHeight("chem") + "px";
        if (this.divAA != null)
            this.divAA.style.height = this.getHeight("aa") + "px";

        if (this.rnatabs != null)
            this.rnatabs.resizeClientarea(0, this.getHeight("RNA"));
    },

    getHeight: function (key) {
        var d1 = this.options.mexmonomerstab ? 0 : 14;
        var d2 = this.options.mexmonomerstab ? 0 : 47;
        var d3 = this.options.mexmonomerstab ? 0 : 46;
        switch (key) {
            case "rule":
                return this.height - 19 + d1;
            case "favorite":
                return this.height - 33 + d2;
            case "chem":
                return this.height - 33 + d2;
            case "aa":
                return this.height - 33 + d2;
            case "RNA":
                return this.height - 59 + d3;
        }

        return this.height;
    },

    onShowTab: function (td, forcerecreate) {
        if (td == null)
            return;

        this.filterInput.value = "";
        this.curtab = td;
        this.filterGroup("");

        var key = td.getAttribute("key");
        if (forcerecreate || key == "favorite" && org.helm.webeditor.MonomerExplorer.favorites.changed) {
            td._childrencreated = false;
            if (key == "favorite")
                org.helm.webeditor.MonomerExplorer.favorites.changed = false;
        }

        if (this.plugin != null && this.plugin.jsd != null)
            this.plugin.jsd.doCmd("helm_" + key);
        if (td._childrencreated)
            return;
        td._childrencreated = true;

        var me = this;
        var div = td.clientarea;
        scil.Utils.unselectable(div);
        scil.Utils.removeAll(div);

        if (key == "favorite") {
            this.divFavorite = scil.Utils.createElement(div, "div", null, { width: "100%", height: this.getHeight(key), overflowY: "scroll" });
            this.recreateFavorites(this.divFavorite);
        }
        else if (key == "rna") {
            var d = scil.Utils.createElement(div, "div");
            this.createMonomerGroup3(d, "RNA", 0, false);
        }
        else if (key == "nucleotide") {
            var dict = org.helm.webeditor.MonomerExplorer.loadNucleotides();
            var list = scil.Utils.getDictKeys(dict);
            this.createMonomerGroup4(div, key, list);
        }
        else if (key == "aa") {
            this.divAA = scil.Utils.createElement(div, "div", null, { width: "100%", height: this.getHeight(key), overflowY: "scroll" });
            dojo.connect(this.divAA, "onmousedown", function (e) { me.select(e); });
            dojo.connect(this.divAA, "ondblclick", function (e) { me.dblclick(e); });
            this.createMonomerGroup4(this.divAA, org.helm.webeditor.HELM.AA, null, false, this.options.mexgroupanalogs != false);
        }
        else if (key == "chem") {
            this.divChem = scil.Utils.createElement(div, "div", null, { width: "100%", height: this.getHeight(key), overflowY: "scroll" });
            this.createMonomerGroup(this.divChem, org.helm.webeditor.HELM.CHEM);
        }
        else if (key == "base") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.BASE, null, null, this.options.mexgroupanalogs != false);
        }
        else if (key == "sugar") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.SUGAR, null);
        }
        else if (key == "linker") {
            this.createMonomerGroup4(div, org.helm.webeditor.HELM.LINKER, null, true);
        }
        else if (key == "rule") {
            var toolbar = scil.Utils.createElement(div, "div", null, { background: "#ccc" });
            scil.Utils.createElement(toolbar, "span", "Category:");
            this.rules_category = scil.Utils.createElement(toolbar, "select");
            scil.Utils.listOptions(this.rules_category, org.helm.webeditor.RuleSetApp.categories);
            var me = this;
            scil.connect(this.rules_category, "onchange", function () { org.helm.webeditor.RuleSet.filterRules(me.rules, me.filterInput.value, me.rules_category.value) });

            this.divRule = scil.Utils.createElement(div, "div", null, { width: "100%", height: this.getHeight(key), overflowY: "scroll" });
            this.rules = org.helm.webeditor.RuleSet.listRules(this.divRule, function (script) { me.plugin.applyRule(script); }, function (scripts) { me.plugin.applyRules(scripts); });
        }
        else if (key == "monomers") {
            var d = scil.Utils.createElement(div, "div", null, { paddingTop: "5px" });

            if (this.options.canvastoolbar == false) {
                var b = scil.Utils.createElement(d, "div", "<img src='" + scil.Utils.imgSrc("helm/arrow.png") + "' style='vertical-align:middle'>Mouse Pointer", { cursor: "pointer", padding: "2px", border: "solid 1px gray", margin: "5px" });
                scil.connect(b, "onclick", function () { me.plugin.jsd.doCmd("lasso"); });
            }

            var tabs = [];
            this.addMonomerTabs(tabs);
            this.monomerstabs = new scil.Tabs(d, {
                onShowTab: function (td) { me.onShowTab(td); },
                tabpadding: "5px 2px 1px 2px",
                tabs: tabs,
                marginBottom: 0
            });
        }
    },

    listRules: function () {

    },

    getMonomerDictGroupByAnalog: function (type) {
        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        //for (var k in set)
        //    set[k].id = k;

        var ret = {};
        var aa = type == org.helm.webeditor.HELM.AA;
        if (aa) {
            ret["C-Term"] = [];
            ret["N-Term"] = [];
        }

        for (var k in set) {
            var m = set[k];
            var na = m.na;
            if (aa) {
                if (m.at.R1 == null)
                    na = "C-Term";
                else if (m.at.R2 == null)
                    na = "N-Term";
            }
            if (scil.Utils.isNullOrEmpty(na))
                na = "X";
            if (ret[na] == null)
                ret[na] = [];
            ret[na].push(m);
        }

        for (var k in ret)
            ret[k] = this.getMonomerNames(ret[k]);

        return ret;
    },

    getMonomerList: function (list, type, addnull) {
        if (list != null) {
            list.sort();
            return list;
        }

        var set = org.helm.webeditor.Monomers.getMonomerSet(type);
        //for (var k in set)
        //    set[k].id = k;
        list = scil.Utils.getDictValues(set);
        return this.getMonomerNames(list, addnull);
    },

    getMonomerNames: function (list, addnull) {
        var ret = [];
        if (addnull)
            ret.push("null");

        list.sort(org.helm.webeditor.MonomerExplorer.compareMonomers);
        for (var i = 0; i < list.length; ++i)
            ret.push(list[i].id);

        return ret;
    },

    createMonomerGroup: function (div, type, list, addnull) {
        var me = this;
        list = this.getMonomerList(list, type, addnull);
        div.style.overflowY = "scroll";
        this._listMonomers(div, list, type, this.options.mexfavoritefirst);
        dojo.connect(div, "onmousedown", function (e) { me.select(e); });
        dojo.connect(div, "ondblclick", function (e) { me.dblclick(e); });
    },

    createMonomerGroup3: function (div, group, i, createbar) {
        var me = this;
        var parent = scil.Utils.createElement(div, "div");
        if (createbar) {
            var bar = scil.Utils.createElement(parent, "div", group + ":", { background: "#ddd", borderTop: "solid 1px #aaa", marginTop: i == 0 ? null : "1px" });
            if (i > 0)
                new scil.Resizable(bar, { direction: "y", mouseovercolor: "#aaf", onresize: function (delta, resizable) { return me.onresize(delta, i); } });
        }

        var d = scil.Utils.createElement(parent, "div");
        dojo.connect(d, "onmousedown", function (e) { me.select(e); });
        dojo.connect(d, "ondblclick", function (e) { me.dblclick(e); });

        if (group == "RNA") {
            var half = " style='font-size: 80%;padding-left:20px;background-repeat:no-repeat;background-position:left center;background-image:";

            var base = org.helm.webeditor.Monomers.bases["A"] == null ? "a" : "A";
            var linker = org.helm.webeditor.Monomers.linkers["P"] == null ? "p" : "P";
            var sugar = org.helm.webeditor.Monomers.sugars["R"] == null ? "r" : "R";

            var tabs = [
                    { caption: "<div title='Nucleotide (Combined)' " + half + scil.Utils.imgSrc("img/helm_nucleotide.gif", true) + "'>R(A)P</div>", tabkey: "nucleotide", onmenu: this.options.mexrnapinontab ? function (e) { me.onPinMenu(e); } : null },
                    { caption: "<div title='Base' " + half + scil.Utils.imgSrc("img/helm_base.gif", true) + "'>" + base + "</div>", tabkey: "base" },
                    { caption: "<div title='Sugar' " + half + scil.Utils.imgSrc("img/helm_sugar.gif", true) + "'>" + sugar + "</div>", tabkey: "sugar" },
                    { caption: "<div title='Linker' " + half + scil.Utils.imgSrc("img/helm_linker.gif", true) + "'>" + linker + "</div>", tabkey: "linker" }
                ];
            this.rnatabs = new scil.Tabs(scil.Utils.createElement(d, "div", null, { paddingTop: "5px" }), {
                onShowTab: function (td) { me.onShowTab(td); }, //function (td) { me.onShowRNATab(td); },
                tabpadding: "2px",
                tabs: tabs,
                marginBottom: 0,
                clientareaheight: this.getHeight("RNA")
            });
        }
        //else if (group == "Chem") {
        //    d.style.overflowY = "scroll";
        //    d.style.height = height + "px";
        //    var list = this.getMonomerList(null, org.helm.webeditor.HELM.CHEM);
        //    this._listMonomers(d, list, org.helm.webeditor.HELM.CHEM, true);
        //}
        //else if (group == "Peptide") {
        //    d.style.overflowY = "scroll";
        //    d.style.height = height + "px";
        //    this.createMonomerGroup4(d, org.helm.webeditor.HELM.AA, null, false, this.options.mexgroupanalogs != false);
        //    //var list = this.getMonomerList(null, org.helm.webeditor.HELM.AA);
        //    //this._listMonomers(d, list, org.helm.webeditor.HELM.AA, true);
        //}
    },

    onPinMenu: function (e) {
        if (this.pinmenu == null) {
            var me = this;
            var items = [{ caption: "Pin This Nucleotide"}];
            this.pinmenu = new scil.ContextMenu(items, function () { me.addNucleotide(); });
        }
        this.pinmenu.show(e.clientX, e.clientY);
    },

    createMonomerGroup4: function (div, type, list, addnull, groupbyanalog) {
        if (groupbyanalog) {
            var dict = this.getMonomerDictGroupByAnalog(type);

            var list = [];
            if (this.options.mexfavoritefirst) {
                for (var k in dict) {
                    var list2 = dict[k];
                    for (var i = 0; i < list2.length; ++i) {
                        var a = list2[i];
                        if (org.helm.webeditor.MonomerExplorer.favorites.contains(a, type))
                            list.push(a);
                    }
                }
                this._listMonomer2(div, scil.Utils.imgTag("star.png"), list, type, 20);
            }

            list = scil.Utils.getDictKeys(dict);
            list.sort();
            var list2 = [];
            for (var i = 0; i < list.length; ++i) {
                var k = list[i];
                if (k == "C-Term" || k == "N-Term") {
                    list2.push(k);
                    continue;
                }
                this._listMonomer2(div, k, dict[k], type, 20);
            }

            for (var i = 0; i < list2.length; ++i) {
                var k = list2[i];
                this._listMonomer2(div, k, dict[k], type, 60);
            }
        }
        else {
            if (type == "nucleotide" && !this.options.mexrnapinontab) {
                var me = this;
                var d = this.createMonomerDiv(div, scil.Utils.imgTag("pin.png"), null, null, false);
                d.setAttribute("title", "Pin This Nucleotide");
                scil.connect(d, "onclick", function () { me.addNucleotide(); })
            }
            var list = this.getMonomerList(list, type, addnull);
            this._listMonomers(div, list, type, this.options.mexfavoritefirst);
        }
    },

    addNucleotide: function (tab) {
        var notation = this.getCombo();
        var dict = org.helm.webeditor.MonomerExplorer.nucleotides;
        for (var k in dict) {
            if (notation == dict[k]) {
                scil.Utils.alert("There is a defined nucleotide called: " + k);
                return;
            }
        }

        var me = this;
        scil.Utils.prompt2({
            caption: "Pin Nucleotide: " + notation,
            message: "Please give a short name for the nucleotide, " + notation,
            callback: function (s) { if (org.helm.webeditor.MonomerExplorer.addCustomNucleotide(s, notation)) me.reloadTab("nucleotide"); }
        });
    },

    _listMonomer2: function (div, k, list, type, width) {
        if (list.length == 0)
            return;

        var tbody = scil.Utils.createTable(div, 0, 0);
        var tr = scil.Utils.createElement(tbody, "tr");
        var left = scil.Utils.createElement(tr, "td", null, { verticalAlign: "top" });
        var right = scil.Utils.createElement(tr, "td", null, { verticalAlign: "top" });
        scil.Utils.createElement(left, "div", k, { width: width, background: "#eee", border: "solid 1px #aaa", textAlign: "center" });
        this._listMonomers(right, list, type);
    },

    createMonomerGroupFav: function (div, caption, type) {
        var list = org.helm.webeditor.MonomerExplorer.favorites.getList(type);
        if (list == null || list.length == 0)
            return;

        list.sort();
        scil.Utils.createElement(div, "div", caption + ":", { background: "#ddd", border: "solid 1px #ddd" });
        var d = scil.Utils.createElement(div, "div", null, { display: "table", paddingBottom: "10px" });
        this._listMonomers(d, list, type, false);

        var me = this;
        dojo.connect(d, "onmousedown", function (e) { me.select(e); });
        dojo.connect(d, "ondblclick", function (e) { me.dblclick(e); });
    },

    _listMonomers: function (div, list, type, mexfavoritefirst) {
        div.className = "filtergroup";

        if (mexfavoritefirst) {
            var list2 = [];
            for (var i = 0; i < list.length; ++i) {
                if (org.helm.webeditor.MonomerExplorer.favorites.contains(list[i], type))
                    this.createMonomerDiv(div, list[i], type);
                else
                    list2.push(list[i]);
            }

            for (var i = 0; i < list2.length; ++i)
                this.createMonomerDiv(div, list2[i], type);
        }
        else {
            for (var i = 0; i < list.length; ++i)
                this.createMonomerDiv(div, list[i], type);
        }
    },

    recreateFavorites: function (d) {
        this.createMonomerGroupFav(d, "Nucleotide", org.helm.webeditor.MonomerExplorer.kNucleotide);
        this.createMonomerGroupFav(d, "Base", org.helm.webeditor.HELM.BASE);
        this.createMonomerGroupFav(d, "Sugar", org.helm.webeditor.HELM.SUGAR);
        this.createMonomerGroupFav(d, "Linker", org.helm.webeditor.HELM.LINKER);
        this.createMonomerGroupFav(d, "Chemistry", org.helm.webeditor.HELM.CHEM);
        this.createMonomerGroupFav(d, "Peptide", org.helm.webeditor.HELM.AA);
    },

    createMonomerDiv: function (parent, name, type, style, star) {
        var fav = org.helm.webeditor.MonomerExplorer.favorites.contains(name, type);

        if (style == null)
            style = scil.clone(this.kStyle);
        else
            style = scil.apply(scil.clone(this.kStyle), style);

        if (this.options.mexusecolor != false) {
            var color;
            var custom = org.helm.webeditor.MonomerExplorer.customnucleotides;
            if (type == "nucleotide" && custom != null && custom[name] != null)
                color = { backgroundcolor: "#afa" };
            else
                color = style.backgroundColor = org.helm.webeditor.Monomers.getColor2(type, name);
            style.backgroundColor = color == null ? null : color.backgroundcolor;
        }

        if (star != false)
            style.backgroundImage = scil.Utils.imgSrc("img/star" + (fav ? "" : "0") + ".png", true);

        var div = scil.Utils.createElement(parent, "div", null, style, { helm: type, bkcolor: style.backgroundColor, star: (star ? 1 : null) });
        scil.Utils.unselectable(div);

        if (this.options.mexuseshape)
            this.setMonomerBackground(div, 0);

        var d = scil.Utils.createElement(div, "div", null, { display: "table-cell", textAlign: "center", verticalAlign: "middle" });
        scil.Utils.createElement(d, "div", name, { overflow: "hidden", width: this.kStyle.width });

        return div;
    },

    setMonomerBackground: function (div, f) {
        var type = div.getAttribute("helm");
        if (scil.Utils.isNullOrEmpty(type))
            return;

        var bk = type.toLowerCase();
        if (type != org.helm.webeditor.MonomerExplorer.kNucleotide)
            bk = bk.substr(bk.indexOf('_') + 1);
        div.style.backgroundImage = scil.Utils.imgSrc("img/mon-" + bk + f + ".png", true);
    },

    getMonomerDiv: function (e) {
        var div = e.target || e.srcElement;
        if (div == null || div.tagName == null)
            return;

        for (var i = 0; i < 3; ++i) {
            var type = div.getAttribute("helm");
            if (!scil.Utils.isNullOrEmpty(type))
                break;
            div = div.tagName == "BODY" ? null : div.parentNode;
            if (div == null)
                break;
        }
        return scil.Utils.isNullOrEmpty(type) ? null : div;
    },

    createDnD: function (div) {
        var me = this;
        return new scil.DnD(div, {
            onstartdrag: function (e, dnd) {
                return me.getMonomerDiv(e);
            },
            oncreatecopy: function (e, dnd) {
                if (me.dnd.floatingbox == null) {
                    var maxZindex = scil.Utils.getMaxZindex();
                    var style = {
                        float: null, backgroundImage: null,
                        filter: 'alpha(opacity=80)', opacity: 0.8, color: org.helm.webeditor.MonomerExplorer.color,
                        backgroundColor: org.helm.webeditor.MonomerExplorer.backgroundcolor,
                        zIndex: (maxZindex > 0 ? maxZindex : 100) + 1, position: "absolute"
                    };
                    if (me.options.useshape)
                        style.backgroundColor = null;
                    me.dnd.floatingbox = me.createMonomerDiv(document.body, null, null, style, false);
                }
                me.dnd.floatingbox.style.display = "table";
                me.dnd.floatingbox.style.backgroundColor = org.helm.webeditor.MonomerExplorer.backgroundcolor;
                me.dnd.floatingbox.innerHTML = dnd.src.innerHTML;
                me.dnd.floatingbox.setAttribute("helm", dnd.src.getAttribute("helm"));
                if (me.options.useshape)
                    me.setMonomerBackground(me.dnd.floatingbox, 1);
                return me.dnd.floatingbox;

            },
            ondrop: function (e, dnd) {
                if (me.dnd.floatingbox == null)
                    return;

                me.dnd.floatingbox.style.display = "none";
                var type = me.dnd.floatingbox.getAttribute("helm");
                me.plugin.dropMonomer(type, scil.Utils.getInnerText(me.dnd.floatingbox), e);
            },
            oncancel: function (dnd) {
                if (me.dnd.floatingbox == null)
                    return;

                me.dnd.floatingbox.style.display = "none";
                var type = me.dnd.floatingbox.getAttribute("helm");
            }
        });
    },

    showMol: function (e) {
        var src = this.getMonomerDiv(e);
        if (src != null && !this.dnd.isDragging()) {
            var type = src.getAttribute("helm");
            var set = type == org.helm.webeditor.MonomerExplorer.kNucleotide ? org.helm.webeditor.MonomerExplorer.nucleotides : org.helm.webeditor.Monomers.getMonomerSet(type);
            var s = scil.Utils.getInnerText(src);
            var m = set[s];
            org.helm.webeditor.MolViewer.show(e, type, m, s);
        }
        else {
            var src = e.srcElement || e.target;
            if (!scil.Utils.isChildOf(src, this.plugin.jsd.div))
                org.helm.webeditor.MolViewer.hide();
        }
    },

    splitLists: function (set) {
        var lists = [[], [], [], []];
        for (var k in set) {
            var m = set[k];
            if (m.at.R1 == null)
                lists[2].push(k);
            else if (m.at.R2 == null)
                lists[3].push(k);
            else if (k.length == 1)
                lists[0].push(k);
            else
                lists[1].push(k);
        }

        return lists;
    },

    changeFavorite: function (div) {
        var f = div.getAttribute("star") != "1";

        if (f) {
            div.setAttribute("star", "1");
            div.style.backgroundImage = scil.Utils.imgSrc("img/star.png", true);
        }
        else {
            div.setAttribute("star", "");
            div.style.backgroundImage = scil.Utils.imgSrc("img/star0.png", true);
        }

        var type = div.getAttribute("helm");
        var s = scil.Utils.getInnerText(div);
        org.helm.webeditor.MonomerExplorer.favorites.add(s, f, type);

        //this.reloadTab(type);
    },

    select: function (e) {
        var div = this.getMonomerDiv(e);
        if (div != null) {
            var d = scil.Utils.getOffset(div, true);
            var scroll = scil.Utils.getParent(div.parentNode, "div");
            var dx = e.clientX - d.x + scroll.scrollLeft;
            var dy = e.clientY - d.y + scroll.scrollTop;
            if (dx >= 0 && dx < 16 && dy >= 0 && dy < 16) {
                // favorite
                this.changeFavorite(div);
                e.preventDefault();
                return;
            }
        }

        var helm = div == null ? null : div.getAttribute("helm");
        if (scil.Utils.isNullOrEmpty(helm))
            return;

        this.plugin.jsd.activate(true);

        var name = scil.Utils.getInnerText(div);
        if (helm == org.helm.webeditor.MonomerExplorer.kNucleotide) {
            var s = org.helm.webeditor.MonomerExplorer.nucleotides[name];
            var p1 = s.indexOf('(');
            var p2 = s.indexOf(")");
            var sugar = org.helm.webeditor.IO.trimBracket(s.substr(0, p1));
            var base = org.helm.webeditor.IO.trimBracket(s.substr(p1 + 1, p2 - p1 - 1));
            var linker = org.helm.webeditor.IO.trimBracket(s.substr(p2 + 1));

            if (scil.Utils.isNullOrEmpty(linker))
                linker = "null";

            this.selected[org.helm.webeditor.HELM.BASE] = base;
            this.selected[org.helm.webeditor.HELM.LINKER] = linker;
            this.selected[org.helm.webeditor.HELM.SUGAR] = sugar;

            if (this.rnatabs != null) {
                var tabs = this.rnatabs;
                tabs.findTab("nucleotide").childNodes[0].innerHTML = s;
                tabs.findTab("sugar").childNodes[0].innerHTML = sugar;
                tabs.findTab("linker").childNodes[0].innerHTML = linker;
                tabs.findTab("base").childNodes[0].innerHTML = base;
            }
        }
        else {
            name = org.helm.webeditor.IO.trimBracket(name);
            if (this.rnatabs != null) {
                var tab = null;
                var tabs = this.rnatabs;
                switch (helm) {
                    case org.helm.webeditor.HELM.SUGAR:
                        tab = tabs.findTab("sugar");
                        break;
                    case org.helm.webeditor.HELM.LINKER:
                        tab = tabs.findTab("linker");
                        break;
                    case org.helm.webeditor.HELM.BASE:
                        tab = tabs.findTab("base");
                        break;
                }
                if (tab != null)
                    tab.childNodes[0].innerHTML = name;
            }

            this.selected[helm] = name;
            if (tabs != null)
                tabs.findTab("nucleotide").childNodes[0].innerHTML = this.getCombo();
        }

        if (this.lastdiv != null) {
            this.lastdiv.style.color = "";
            if (this.options.mexuseshape) {
                this.setMonomerBackground(this.lastdiv, 0);
            }
            else {
                var s = this.lastdiv.getAttribute("bkcolor");
                this.lastdiv.style.backgroundColor = s == null ? "" : s;
            }
        }
        if (this.options.mexuseshape)
            this.setMonomerBackground(div, 1);
        else
            div.style.backgroundColor = org.helm.webeditor.MonomerExplorer.backgroundcolor;
        div.style.color = org.helm.webeditor.MonomerExplorer.color;
        this.lastdiv = div;

        if (this.plugin != null && this.plugin.jsd != null) {
            switch (helm) {
                case org.helm.webeditor.HELM.AA:
                    this.plugin.jsd.doCmd("helm_aa");
                    break;
                case org.helm.webeditor.HELM.CHEM:
                    this.plugin.jsd.doCmd("helm_chem");
                    break;
                case org.helm.webeditor.HELM.BASE:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_base");
                    break;
                case org.helm.webeditor.HELM.LINKER:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_linker");
                    break;
                case org.helm.webeditor.HELM.SUGAR:
                    this.plugin.jsd.doCmd(this.options.alwaysdrawnucleotide ? "helm_nucleotide" : "helm_sugar");
                    break;
                case org.helm.webeditor.MonomerExplorer.kNucleotide:
                    this.plugin.jsd.doCmd("helm_nucleotide");
                    break;
            }
        }
    },

    getCombo: function () {
        var sugar = this.selected[org.helm.webeditor.HELM.SUGAR];
        var linker = this.selected[org.helm.webeditor.HELM.LINKER];
        var base = this.selected[org.helm.webeditor.HELM.BASE];
        var s = org.helm.webeditor.IO.getCode(sugar);
        if (!org.helm.webeditor.Monomers.hasR(org.helm.webeditor.HELM.SUGAR, sugar, "R3"))
            s += "()";
        else
            s += "(" + org.helm.webeditor.IO.getCode(base) + ")";
        if (linker != "null")
            s += org.helm.webeditor.IO.getCode(linker);
        return s;
    },

    dblclick: function (e) {
        var div = this.getMonomerDiv(e);
        var helm = div == null ? null : div.getAttribute("helm");
        if (org.helm.webeditor.isHelmNode(helm)) {
            if (this.plugin.dblclickMomonor(helm, scil.Utils.getInnerText(div)) == 0)
                scil.Utils.beep();
        }
    }
});


scil.apply(org.helm.webeditor.MonomerExplorer, {
    kUseShape: false,
    kNucleotide: "nucleotide",
    backgroundcolor: "blue",
    color: "white",
    customnucleotides: null,
    favorites: new scil.Favorite("monomers", function (name, f, type) { org.helm.webeditor.MonomerExplorer.onAddFavorite(name, f, type); }),

    nucleotides: {
        A: "R(A)P",
        C: "R(C)P",
        G: "R(G)P",
        T: "R(T)P",
        U: "R(U)P"
    },

    compareMonomers: function (a, b) {
        if (a.id == b.id)
            return 0;
        else if (a.id.length != b.id.length && (a.id.length == 1 || b.id.length == 1))
            return a.id.length > b.id.length ? 1 : -1;
        else
            return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
    },

    onAddFavorite: function (name, f, type) {
        if (!f && type == "nucleotide" && this.customnucleotides != null && this.customnucleotides[name] != null) {
            delete this.customnucleotides[name];
            this.saveNucleotides();
        }
    },

    addCustomNucleotide: function (name, notation) {
        name = scil.Utils.trim(name);
        if (scil.Utils.isNullOrEmpty(name)) {
            scil.Utils.alert("The short name cannot be blank");
            return false;
        }

        if (this.nucleotides[name] != null) {
            scil.Utils.alert("The short name is used for: " + this.nucleotides[name]);
            return false;
        }

        if (this.customnucleotides == null)
            this.customnucleotides = {};

        this.nucleotides[name] = notation;
        this.customnucleotides[name] = notation;
        this.saveNucleotides();
        this.favorites.add(name, true, "nucleotide");

        return true;
    },

    saveNucleotides: function () {
        var s = scil.Utils.json2str(this.customnucleotides);
        scil.Utils.createCookie("scil_helm_nucleotides", s);
    },

    loadNucleotides: function () {
        if (this._nucleotidesloaded)
            return this.nucleotides;

        if (this.nucleotides == null)
            this.nucleotides = [];

        this._nucleotidesloaded = true;
        var s = scil.Utils.readCookie("scil_helm_nucleotides");
        this.customnucleotides = scil.Utils.eval(s);
        if (this.customnucleotides != null && this.customnucleotides.length == null) {
            var list = {};
            for (var k in this.customnucleotides) {
                if (this.nucleotides[k] == null) {
                    list[k] = this.customnucleotides[k];
                    this.nucleotides[k] = this.customnucleotides[k];
                }
            }
            this.customnucleotides = list;
        }
        return this.nucleotides;
    },

    showDlg: function (jsd) {
        this.createDlg(jsd);
        this.dlg.show2({ owner: jsd, modal: false });
        jsd.helm.monomerexplorer = this.mex;
    },

    createDlg: function (jsd) {
        if (this.dlg != null)
            return;

        var div = scil.Utils.createElement(null, "div", null, { width: 500 });
        this.dlg = new scil.Dialog("Monomer Explorer", div);
        this.dlg.show2({ owner: jsd, modal: false });

        this.mex = new org.helm.webeditor.MonomerExplorer(div, jsd.helm, { height: 350 });
        this.dlg.moveCenter();
    }
});
