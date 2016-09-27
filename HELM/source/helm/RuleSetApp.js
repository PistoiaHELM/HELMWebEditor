//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* RuleSetApp class
* @class org.helm.webeditor.RuleSetApp
* Recommended database schema:
* <pre>
* **********************************************************
* create table HELMRules
* (
* id bigint not null identity(1, 1) primary key,
* Category nvarchar(256),
* Name nvarchar(512) not null,
* Script nvarchar(max),
* Description nvarchar(max),
* Author nvarchar(256),
* CreatedDate DateTime default getdate()
* );
* **********************************************************
* </pre>
* JSON Schema
* <pre>
* {
*     id: 3,                                          // rule internal ID
*     name: 'Replace base A with U',                  // rule long name
*     script: '	\nfunction(plugin) {\n // ... \n}',   // rule script
*     description: null,                              // rule full description
*     author: null,                                   // rule author
*     createddate: null,                              // rule created date
*     category: null                                  // rule category
* }
* </pre>
**/
org.helm.webeditor.RuleSetApp = scil.extend(scil._base, {
    /**
    * @constructor RuleSetApp
    * @param {DOM} parent - The parent element to host the Ruleset Manager
    * @bio {dict} options - options on how to render the App
    * <pre>
    * ajaxurl: {string} The service url for the ajax
    * <b>Example:</b>
    *     <div id="div1" style="margin: 5px; margin-top: 15px"></div>
    *     <script type="text/javascript">
    *       scil.ready(function () {
    *         new org.helm.webeditor.RuleSetApp("div1", { ajaxurl: "../service/ajaxtool/post?cmd=" });
    *       });
    *     </script>
    * </pre>
    **/
    constructor: function (parent, options) {
        if (typeof (parent) == "string")
            parent = scil.byId(parent);
        this.options = options == null ? {} : options;
        scil.Page.ajaxurl = this.options.ajaxurl;
        this.init(parent);
    },

    init: function (parent) {
        var me = this;

        this.page = new scil.Page(parent);

        var me = this;
        this.buttons = [
            "-",
            { type: "select", key: "category", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.RuleSetApp.categories, label: "Category", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "countperpage", labelstyle: { fontSize: "90%" }, label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
        ];

        var fields = org.helm.webeditor.RuleSetApp.getFields();
        fields.script.button = [{ label: "Test Script", onclick2: function (field) { me.testscript(field); } },
            { label: "Test Applying", onclick2: function (field, form) { me.testapplying(field, form); } }
        ];
        fields.test = { label: "Test Structure", type: "jsdraw", helmtoolbar: true, width: 800, height: 300 };
        this.rules = this.page.addForm({
            caption: "Rule Set",
            key: "id",
            object: "helm.rule",
            buttons: this.buttons,
            onbeforerefresh: function (args) { me.onbeforerefresh(args); },
            onbeforesave: function (data, args, form) { data.test = null; },
            columns: {
                id: { label: "ID", width: 50, iskey: true },
                category: { label: "Category", width: 60 },
                name: { label: "Name", width: 100 },
                description: { label: "Description", width: 200 },
                author: { label: "Author", width: 100 },
                createddate: { label: "Created Date", type: "date", width: 100 }
            },
            formcaption: "Rule",
            fields: fields,
            defaultvalues: { script: "function(plugin) {\n\n}\n\n//function(plugin) { \n//    scil.Utils.ajax('http://SERVER/youerservice', function(ret) {\n//        plugin.setHelm(ret.new_helm);\n//    });\n//} " }
        });

        this.page.addForm({
            caption: "Rule",
            type: "form",
            object: "helm.rule",
            fields: org.helm.webeditor.RuleSetApp.getFields()
        }, this.rules);

        this.rules.refresh();
    },

    refresh: function (view) {
        this.rules.refresh();
    },

    onbeforerefresh: function (args) {
        scil.Form.getButtonValuesByKey(this.buttons, ["category", "countperpage"], args);
    },

    testapplying: function (field, form) {
        var plugin = form.fields.test.jsd.helm;
        plugin.applyRule(field.value);
    },

    testscript: function (field) {
        var s = field.value;
        if (scil.Utils.trim(s) == "")
            return;

        try {
            eval("var __fun=" + s);
            if (typeof (__fun) == "function")
                scil.Utils.alert("Looks good!");
            else
                scil.Utils.alert("It should be a Javascript function, like this: \nfunction(plugin) {\n //... \n}");
        }
        catch (e) {
            scil.Utils.alert(e.message);
        }
    }
});

scil.apply(org.helm.webeditor.RuleSetApp, {
    categories: ["", "General"],

    getFields: function () {
        return {
            id: { label: "ID", viewonly: true },
            category: { label: "Category", width: 200, type: "select", items: this.categories },
            name: { label: "Name", width: 800 },
            description: { label: "Description", type: "textarea", width: 800, height: 40 },
            author: { label: "Author", width: 100 },
            script: { label: "Javascript", type: "textarea", width: 800, height: 160 }
        }
    }
});