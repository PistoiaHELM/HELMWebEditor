//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**********************************************************
create table HELMRules
(
id bigint not null identity(1, 1) primary key,
Name nvarchar(256) not null,
Script nvarchar(max),
Note nvarchar(max),
Author nvarchar(256),
CreatedDate DateTime default getdate()
);
**********************************************************/

org.helm.webeditor.RuleSetApp = scil.extend(scil._base, {
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
            { type: "select", key: "countperpage", label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
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
                name: { label: "Name", width: 100 },
                note: { label: "Note", width: 200 },
                author: { label: "Author", width: 100 },
                createddate: { label: "Created Date", type: "date", width: 100 }
            },
            formcaption: "Rule",
            fields: fields,
            defaultvalues: { script: "function(plugin) {\n\n}" }
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
        args.countperpage = org.helm.webeditor.MonomerLibApp.getValueByKey(this.buttons, "countperpage");
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
    getFields: function() {
        return {
            id: { label: "ID", viewonly: true },
            name: { label: "Name", width: 800 },
            note: { label: "Note", type: "textarea", width: 800, height: 40 },
            script: { label: "Javascript", type: "textarea", width: 800, height: 160 }
        }
    }
});