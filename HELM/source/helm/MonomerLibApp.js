//////////////////////////////////////////////////////////////////////////////////
//
// Pistoia HELM
// Copyright (C) 2016 Pistoia (www.pistoiaalliance.org)
// Created by Scilligence, built on JSDraw.Lite
//
//////////////////////////////////////////////////////////////////////////////////

/**
* MonomerLibApp class
* @class org.helm.webeditor.MonomerLibApp
* Recommended database schema:
* <pre>
* **********************************************************
* create table HELMMonomers
* (
* id bigint not null identity(1, 1) primary key,
* Symbol varchar(256) not null,
* Name varchar(256) not null,
* NaturalAnalog varchar(256),
* SMILES varchar(max),
* PolymerType varchar(256) not null,
* MonomerType varchar(256),
* Status varchar(256),
* Molfile varchar(max),
* Hashcode varchar(128),
* R1 varchar(256),
* R2 varchar(256),
* R3 varchar(256),
* R4 varchar(256),
* R5 varchar(256),
* Author nvarchar(256),
* CreatedDate DateTime default getdate()
* );
* **********************************************************
* </pre>
* JSON Schema
* <pre>
* {
*     id: 69,                     // monomer internal ID
*     symbol: 'Alexa',            // monomer symbol
*     name: 'Alexa Fluor 488',    // monomer long name
*     naturalanalog: null,        // natural analog
*     smiles: null,               // smiles
*     polymertype: 'CHEM',        // polymer type: CHEM, SUGAR, LINKER, BASE, AA
*     monomertype: null,          // momer type: Backbone, Branch, null
*     molfile: null,              // molfile of monomer, plain text, not BASE64 encoded or compressed
*     r1: 'X',                    // cap for R1 
*     r2: null,                   // cap for R2
*     r3: null,                   // cap for R3
*     r4: null,                   // cap for R4
*     r5: null,                   // cap for R5
*     author: null,               // monomer author
*     createddate: null           // monomer created date
* }
* </pre>
**/
org.helm.webeditor.MonomerLibApp = scil.extend(scil._base, {
    /**
    * @constructor MonomerLibApp
    * @param {DOM} parent - The parent element to host Monomer Manager
    * @bio {dict} options - options on how to render the App
    * <pre>
    * ajaxurl: {string} The service url for the ajax
    * <b>Example:</b>
    *     <div id="div1" style="margin: 5px; margin-top: 15px"></div>
    *     <script type="text/javascript">
    *       scil.ready(function () {
    *         new org.helm.webeditor.MonomerLibApp("div1", { ajaxurl: "../service/ajaxtool/post?cmd=" });
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
            { type: "a", src: scil.Utils.imgSrc("img/open.gif"), title: "Import Monomer XML Library", onclick: function () { me.uploadFile(); } },
            "-",
            { type: "input", key: "symbol", labelstyle: { fontSize: "90%" }, label: "Symbol", styles: { width: 100 }, autosuggesturl: this.options.ajaxurl + "helm.monomer.suggest", onenter: function () { me.refresh(); } },
            { type: "select", key: "polymertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), label: "Polymer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "monomertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), label: "Monomer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "status", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getStatuses(), label: "Status", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "countperpage", labelstyle: { fontSize: "90%" }, label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
        ];

        this.monomers = this.page.addForm({
            caption: "Monomer List",
            key: "id",
            object: "helm.monomer",
            imagewidth: 30,
            buttons: this.buttons,
            onbeforerefresh: function (args) { me.onbeforerefresh(args); },
            onbeforesave: function (data, args, form) { data.molfile = form.fields.molfile.jsd.getMolfile(); },
            columns: {
                id: { type: "hidden", iskey: true },
                symbol: { label: "Symbol", width: 100 },
                name: { label: "Name", width: 200 },
                naturalanalog: { label: "Natural Analog", width: 100 },
                polymertype: { label: "Polymer Type", width: 100 },
                monomertype: { label: "Monomer Type", width: 100 },
                r1: { label: "R1", width: 50 },
                r2: { label: "R2", width: 50 },
                r3: { label: "R3", width: 50 },
                author: { label: "Author", width: 100 },
                createddate: { label: "Created Date", type: "date", width: 100 },
                status: { label: "Status", width: 100 }
            },
            formcaption: "Monomer",
            fields: org.helm.webeditor.MonomerLibApp.getFields()
        });

        this.page.addForm({
            caption: "Monomer",
            type: "form",
            object: "helm.monomer",
            fields: org.helm.webeditor.MonomerLibApp.getFields()
        }, this.monomers);

        this.monomers.refresh();
    },

    refresh: function (view) {
        this.monomers.refresh();
    },

    onbeforerefresh: function (args) {
        scil.Form.getButtonValuesByKey(this.buttons, ["status", "polymertype", "monomertype", "status", "symbol", "countperpage"], args);
    },

    uploadFile: function (duplicatecheck) {
        scil.Utils.uploadFile("Import Monomer Library", "Select HELM monomer xml file (" + (duplicatecheck ? "with" : "without") + " duplicate check)", this.options.ajaxurl + "helm.monomer.uploadlib",
            function (ret) { scil.Utils.alert(ret.n + " monomers are imported"); }, { duplicatecheck: duplicatecheck });
    }
});

scil.apply(org.helm.webeditor.MonomerLibApp, {
    getFields: function() {
        return {
            id: { type: "hidden" },
            symbol: { label: "Symbol", required: true },
            name: { label: "Name", required: true, width: 800 },
            naturalanalog: { label: "Natural Analog", required: true, width: 100 },
            polymertype: { label: "Polymer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), width: 100 },
            monomertype: { label: "Monomer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), width: 100 },
            author: { label: "Author", width: 100 },
            status: { label: "Status", type: "select", items: org.helm.webeditor.MonomerLibApp.getStatuses(), width: 100 },
            molfile: { label: "Structure", type: "jsdraw", width: 800, height: 300 },
            r1: { label: "R1", type: "select", items: ["", "H", "OH", "X"] },
            r2: { label: "R2", type: "select", items: ["", "H", "OH", "X"] },
            r3: { label: "R3", type: "select", items: ["", "H", "OH", "X"] }
        }
    },

    getValueByKey: function (list, key) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i].key == key)
                return list[i].b.value;
        }
        return null;
    },

    getPolymerTypes: function () {
        return ["", "RNA", "CHEM", "PEPTIDE"];
    },

    getMonomerTypes: function () {
        return ["", "Backbone", "Branch", "Undefined"]
    },

    getStatuses: function () {
        return ["", "New", "Approved", "Retired"]
    }
});