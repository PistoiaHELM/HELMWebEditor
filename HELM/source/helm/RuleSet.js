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
* RuleSet class
* @class org.helm.webeditor.RuleSet
*/
org.helm.webeditor.RuleSet = {
    kApplyAll: false,

    rules: [
        { id: 1, category: "Demo", name: "Replace base A with U", description: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'U');return n > 0;}" },
        { id: 2, category: "Demo", name: "Replace base A with G", description: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'G');return n > 0;}" },
        { id: 3, category: "Test", name: "Replace base A with T", description: "", script: "function(plugin) {var n = plugin.replaceMonomer(org.helm.webeditor.HELM.BASE, 'A', 'T');return n > 0;}" }
    ],

    loadDB: function(list) {
        this.rules = list;
    },

    favorites: new scil.Favorite("ruleset"),

    saveTextDB: function (url) {
        var cols = ["id", "name", "description", "script", "author", "category"];

        var n = 0;
        var ret = "";
        for (var i = 0; i < this.rules.length; ++i) {
            var r = this.rules[i];
            var s = "";
            for (var k = 0; k < cols.length; ++k)
                s += (k > 0 ? "|" : "") + r[cols[k]];
            ret += JSDraw2.Base64.encode(s) + "\n";
            ++n;
        }

        ret = n + "\n" + ret;
        if (url == null)
            return ret;

        var args = { client: "jsdraw", wrapper: "none", filename: "rules.txt", directsave: 1, contents: ret };
        scil.Utils.post(url, args, "_blank");
    },

    addFavorite: function (e) {
        var img = e.srcElement || e.target;
        var tr = scil.Utils.getParent(img, "TR");
        var id = tr.getAttribute("ruleid");

        var f = img.getAttribute("star") != "1";
        if (f) {
            img.setAttribute("star", "1");
            img.src = scil.Utils.imgSrc("img/star.png");
        }
        else {
            img.setAttribute("star", "");
            img.src = scil.Utils.imgSrc("img/star0.png");
        }

        this.favorites.add(id, f);
    },

    filterRules: function(tbody, s, category) {
        s = scil.Utils.trim(s).toLowerCase();
        var list = tbody.childNodes;
        for (var i = 0; i < this.rules.length; ++i) {
            var r = this.rules[i];
            var tr = list[i + 1];
            if ((s == "" || r.name.toLowerCase().indexOf(s) >= 0) && (scil.Utils.isNullOrEmpty(category) || category == r.category))
                tr.style.display = "";
            else
                tr.style.display = "none";
        }
    },

    listRules: function(div, apply, applyall){
        scil.Utils.removeAll(div);

        var me = this;
        var tbody = scil.Utils.createTable(div, 0, 0, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr", null, { background: "#eee", display: (this.kApplyAll ? "" : "none") });
        var chk = scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "checkbox");
        scil.Utils.createButton(scil.Utils.createElement(tr, "td", null, { textAlign: "right", padding: "3px 3px 3px 0" }, { colSpan: 3 }), this.createApplyAll("Apply All", applyall, tbody));
        scil.connect(chk, "onclick", function () { me.checkAll(tbody); });

        var k = 1;
        var list = [];
        for (var i = 0; i < this.rules.length; ++i) {
            var r = this.rules[i];
            var fav = this.favorites.contains(r.id);
            if (this.favorites.contains(r.id))
                this.listOneRule(tbody, r, ++k, apply, true);
            else
                list.push(r);
        }

        for (var i = 0; i < list.length; ++i)
            this.listOneRule(tbody, list[i], ++k, apply);

        return tbody;
    },

    listOneRule: function (tbody, r, i, apply, fav) {
        var me = this;
        var tr = scil.Utils.createElement(tbody, "tr", null, { background: i % 2 == 1 ? "#eee" : null }, { ruleid: r.id });
        scil.Utils.createElement(scil.Utils.createElement(tr, "td"), "checkbox", null, { display: (this.kApplyAll ? "" : "none"), width: "1%" });

        var td = scil.Utils.createElement(tr, "td");
        scil.Utils.createElement(td, "img", null, { /*width: "1%"*/ }, { star: (fav ? 1 : null), src: scil.Utils.imgSrc("img/star" + (fav ? "" : "0") + ".png") }, function (e) { me.addFavorite(e); });

        td = scil.Utils.createElement(tr, "td", null, { width: "99%" });
        this.listOneRule2(td, r, apply, i);
    },

    listOneRule2: function (td, rule, fun, i) {
        var s = rule.name;
        if (scil.Utils.isNullOrEmpty(s))
            s = rule.description;
        if (s.length > 50)
            s = s.substr(0, 47) + "...";

        var tbody = scil.Utils.createTable(td, 0, 0, { width: "100%" });
        var tr = scil.Utils.createElement(tbody, "tr");
        scil.Utils.createElement(tr, "td", "[" + rule.id + "] " + s, { padding: "3px 0 3px 0" }, { title: rule.description });
        var button = scil.Utils.createElement(scil.Utils.createElement(tr, "td", null, { textAlign: "right" }), "button", JSDraw2.Language.res("Apply"), { display: "none" });

        var me = this;
        scil.connect(button, "onclick", function () { fun(rule.script); });
        scil.connect(td, "onmouseover", function (e) { button.style.display = ""; });
        scil.connect(td, "onmouseout", function (e) { button.style.display = "none"; });
    },

    checkAll: function(tbody) {
        var nodes = tbody.childNodes;
        var f = nodes[0].childNodes[0].childNodes[0].checked;
        for (var i = 1; i < nodes.length; ++i) {
            var tr = nodes[i];
            tr.childNodes[0].childNodes[0].checked = f;
        }
    },

    createApplyAll: function (label, fun, tbody) {
        return {
            label: label, type: "a", onclick: function (e) {
                var list = [];
                var nodes = tbody.childNodes;
                for (var i = 1; i < nodes.length; ++i) {
                    var tr = nodes[i];
                    if (tr.childNodes[0].childNodes[0].checked)
                        list.push(parseInt(tr.getAttribute("ruleid")));
                }

                if (list.length == 0)
                    scil.Utils.alert("No rule selected");
                else
                    fun(list);
            }
        };
    },

    applyRules: function (plugin, ruleids) {
        if (ruleids.length == 0)
            return;

        var list = [];
        for (var i = 0; i < ruleids.length; ++i) {
            for (var k = 0; k < this.rules.length; ++k) {
                var r = this.rules[k];
                if (ruleids[i] == r.id) {
                    list.push(r);
                    break;
                }
            }
        }

        var args = { plugin: plugin, n: list.length, changed: 0, list: list, cloned: plugin.jsd.clone() };
        this._applyNextRule(args);
    },

    applyRule: function (plugin, script) {
        var list = [{ script: script, name: null }];
        var args = { plugin: plugin, n: list.length, changed: 0, list: list, cloned: plugin.jsd.clone() };
        this._applyNextRule(args);
    },

    _applyNextRule: function (args) {
        if (args.list.length == 0)
            return;

        var me = this;

        // get the first rule 
        var rule = args.list[0];
        args.list.splice(0, 1);

        // callback function when the rule is applied
        var callback = function (f, error) {
            if (error != null) {
                // some rule failed
                scil.Utils.alert(error);
                args.plugin.jsd.restoreClone(args.cloned);
                return;
            }

            if (f)
                ++args.changed; // structure changed

            if (args.list.length > 0) {
                // continue to apply the next rule
                me._applyNextRule(args);
                return;
            }

            // all rules are applied
            if (args.changed > 0) {
                args.plugin.jsd.pushundo(args.cloned);
                args.plugin.jsd.refresh(true);
                scil.Utils.alert((args.n > 1 ? "Rules" : "Rule") + " applied successfully!");
            }
            else {
                scil.Utils.alert((args.n > 1 ? "Rules" : "Rule") + " applied, but nothing changed!");
            }
        };
        this._applyOneRule(args.plugin, rule.script, rule.name, callback);
    },

    _applyOneRule: function (plugin, script, name, callback) {
        var rulefun = null;
        if (typeof (script) == "string")
            rulefun = scil.Utils.eval(script);
        else if (typeof (script) == "function")
            rulefun = script;

        var f = false;
        var error = null;
        if (rulefun == null) {
            error = "Error: Invalid rule function: " + name;
        }
        else {
            try {
                f = rulefun(plugin);
            }
            catch (e) {
                error = "Error: " + (name == null ? "" : name) + "\n---------------\n" + e.message + "\n---------------\n" + e.stack;
            }
        }

        callback(f, error);
    }
};