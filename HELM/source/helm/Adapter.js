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

org.helm.webeditor.Adapter = {
    init: function (url) {
        org.helm.webeditor.Adapter.url = url; // http://localhost:8080/HELMMonomerService-master/webService/service/library

        scil.Utils.onAjaxCallback = org.helm.webeditor.Adapter.onAjaxCallback;
        scil.Utils.onajaxcall = org.helm.webeditor.Adapter.onajaxcall;
    },

    startApp: function (div, options) {
        org.helm.webeditor.Adapter.init(options.url);

        if (options.onValidateHelm == null)
            options.onValidateHelm = this.onValidateHelm;
        if (options.onCleanUpStructure == null)
            options.onCleanUpStructure = this.onCleanUpStructure;
        if (options.onMonomerSmiles == null)
            org.helm.webeditor.Monomers.onMonomerSmiles = this.onMonomerSmiles;
        else
            org.helm.webeditor.Monomers.onMonomerSmiles = options.onMonomerSmiles;

        scil.Utils.ajax(org.helm.webeditor.Adapter.url + "/monomer/ALL", function (ret) {
            org.helm.webeditor.Adapter.startApp2(div, options);
        });
    },

    onAjaxCallback: function (ret) {
        if (scil.Utils.isNullOrEmpty(ret))
            return;

        // rules:
        // TODO ...

        // monomers:
        var list = ret.monomers;
        if (list == null) {
            org.helm.webeditor.Adapter.toHWE(ret, ret);
            return;
        }

        if (ret.limit == null || ret.limit == 0) {
            org.helm.webeditor.Adapter.loadMonomers(ret);
        }
        else {
            var rows = [];
            for (var i = 0; i < list.length; ++i) {
                var x = list[i];
                var m = { symbol: x.symbol, name: x.name, createddate: x.createDate };
                org.helm.webeditor.Adapter.toHWE(m, x);
                rows.push(m);
            }
            if (ret.offset != null && ret.limit > 0) {
                ret.page = ret.offset / ret.limit + 1;
                var mod = ret.total % ret.limit;
                ret.pages = (ret.total - mod) / ret.limit + (mod > 0 ? 1 : 0);
            }
            ret.rows = rows;
        }
    },

    onajaxcall: function (args, opts) {
        args.headers = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' };
        switch (args.url) {
            case "helm.monomer.load":
                args.url = org.helm.webeditor.Adapter.url + "/monomer/" + args.content.id;
                opts.verb = "get";
                break;
            case "helm.monomer.list":
                var limit = args.content.countperpage;
                if (!(limit > 0))
                    limit = 10;
                var page = args.content.page;
                if (!(page > 0))
                    page = 1;
                var offset = (page - 1) * limit;
                var pt = scil.Utils.isNullOrEmpty(args.content.polymertype) ? "ALL" : args.content.polymertype;
                args.url = org.helm.webeditor.Adapter.url + "/monomer/" + pt + "?limit=" + limit + "&offset=" + offset;
                if (!scil.Utils.isNullOrEmpty(args.content.symbol))
                    args.url += "&filter=" + escape(args.content.symbol) + "&filterField=symbol";
                else if (!scil.Utils.isNullOrEmpty(args.content.name))
                    args.url += "&filter=" + escape(args.content.name) + "&filterField=name";
                opts.verb = "get";
                break;
            case "helm.monomer.save":
                if (scil.Utils.isNullOrEmpty(args.content.id)) // new monomer
                    args.content.id = args.polymerType + "/" + args.symbol;
                args.url = org.helm.webeditor.Adapter.url + "/monomer/" + args.content.id;
                opts.verb = "put";
                args.content.id = null;
                org.helm.webeditor.Adapter.fromHWE(args.content);
                args.postData = scil.Utils.json2str(args.content, null, true);
                delete args.content;
                break;
            case "helm.monomer.del":
                args.url = org.helm.webeditor.Adapter.url + "/monomer/" + args.content.id;
                opts.verb = "del";
                break;

            case "helm.rule.load":
                args.url = org.helm.webeditor.Adapter.url + "/rule/" + args.content.id;
                opts.verb = "get";
                break;
            case "helm.rule.list":
                var limit = args.content.countperpage;
                if (!(limit > 0))
                    limit = 10;
                var page = args.content.page;
                if (!(page > 0))
                    page = 1;
                var offset = (page - 1) * limit;
                args.url = org.helm.webeditor.Adapter.url + "/rule?limit=" + limit + "&offset=" + offset;
                opts.verb = "get";
                break;
            case "helm.rule.save":
                args.url = org.helm.webeditor.Adapter.url + "/rule";
                opts.verb = "put";
                args.content.id = null;
                org.helm.webeditor.Adapter.fromHWE(args.content);
                args.postData = scil.Utils.json2str(args.content, null, true);
                delete args.content;
                break;
            case "helm.rule.del":
                args.url = org.helm.webeditor.Adapter.url + "/delete/" + args.content.id;
                opts.verb = "del";
                break;

            default:
                if (opts.verb == null)
                    opts.verb = "get";
                break;
        }
        opts.ignoresucceedcheck = true;
    },


    startApp2: function (div, options) {
        org.helm.webeditor.ambiguity = options.ambiguity;
        new scil.helm.AppToolbar(options.toolbarholder, "helm/img/", options.toolbarbuttons);
        app = new scil.helm.App(div, options);
    },

    loadMonomers: function (ret) {
        org.helm.webeditor.Monomers.clear();
        var list = ret.monomers;
        for (var i = 0; i < list.length; ++i) {
            var x = list[i];
            var m = { id: x.symbol, n: x.name, na: x.naturalAnalog, type: x.polymerType, mt: x.monomerType, m: x.molfile };

            m.at = {};
            var rs = 0;
            if (x.rgroups != null) {
                for (var k = 0; k < x.rgroups.length; ++k) {
                    var r = x.rgroups[k];
                    m.at[r.label] = r.capGroupName;
                    ++rs;
                }
            }
            m.rs = rs;

            org.helm.webeditor.Monomers.addOneMonomer(m);
        }
    },

    toHWE: function (m, ret) {
        m.id = ret.polymerType + "/" + ret.symbol;
        m.naturalanalog = ret.naturalAnalog;
        m.polymertype = ret.polymerType;
        m.monomertype = ret.monomerType;
        m.author = "";

        if (ret.rgroups == null)
            return;
        for (var k = 0; k < ret.rgroups.length; ++k) {
            var r = ret.rgroups[k];
            m[scil.helm.symbolCase(r.label)] = r.capGroupName;
        }
    },

    fromHWE: function (ret) {
        ret.naturalAnalog = ret.naturalanalog;
        ret.polymerType = ret.polymertype;
        ret.monomerType = ret.monomertype;

        var rgroups = [];
        for (var i = 1; i < 5; ++i) {
            if (ret["r" + i] != null)
                rgroups.push({ label: "R" + i, capGroupName: ret["r" + i] })
        }
        ret.rgroups = rgroups;
    },

    onValidateHelm: function (me) {
        var url = me.options.validateurl;
        if (scil.Utils.isNullOrEmpty(url)) {
            scil.Utils.alert("The validation url is not configured yet");
            return;
        }

        me.setNotationBackgroundColor("white");
        var helm = scil.Utils.getInnerText(me.notation);
        if (scil.Utils.isNullOrEmpty(helm))
            return;

        scil.Utils.ajax(url,
            function (ret) { me.setNotationBackgroundColor(ret.Validation == "valid" ? "#9fc" : "#fcf"); },
            { HELMNotation: helm },
            { onError: function (data) { me.setNotationBackgroundColor("#fcf"); }, verb: "post", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }
            });
    },

    onCleanUpStructure: function (mol, me) {
        //        scil.Utils.ajax(me.options.cleanupurl, function (ret) {
        //            me.structureview.setMolfile(ret == null ? null : ret.output);
        //        }, { input: mol.getMolfile(), inputformat: "mol", outputformat: "mol" });
        var url = me.options.cleanupurl;
        var molfile = mol.getMolfile();
        scil.Utils.ajax(url,
            function (ret) { m.m = ret.Molfile; },
            { SMILES: molfile },
            { verb: "post", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }
            });
    },

    onMonomerSmiles: function (m, smiles) {
        var url = org.helm.webeditor.Monomers.cleanupurl;
        scil.Utils.ajax(url,
            function (ret) { m.m = ret.Molfile; },
            { SMILES: smiles },
            { verb: "post", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }
            });
    }
};