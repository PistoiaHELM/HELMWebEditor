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

    /**
    * Initialize the manager (internal use)
    * @function init
    */
    init: function (parent) {
        var me = this;

        this.page = new scil.Page(parent);

        var me = this;
        this.buttons = [
            "-",
            { type: "a", src: scil.Utils.imgSrc("img/open.gif"), title: "Import Monomers", onclick: function () { me.uploadFile(true); } },
            "-",
            { type: "a", src: scil.Utils.imgSrc("img/save.gif"), title: "Export Monomers", items: ["JSON", "SDF"], onclick: function (cmd) { me.exportFile(cmd); } },
            "-",
            { type: "input", key: "symbol", labelstyle: { fontSize: "90%" }, label: "Symbol/Name", styles: { width: 100 }, autosuggesturl: this.options.ajaxurl + "helm.monomer.suggest", onenter: function () { me.refresh(); } },
            { type: "select", key: "polymertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), label: "Polymer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            { type: "select", key: "monomertype", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), label: "Monomer Type", styles: { width: 100 }, onchange: function () { me.refresh(); } },
        //{ type: "select", key: "status", labelstyle: { fontSize: "90%" }, items: org.helm.webeditor.MonomerLibApp.getStatuses(), label: "Status", styles: { width: 100 }, onchange: function () { me.refresh(); } },
            {type: "select", key: "countperpage", labelstyle: { fontSize: "90%" }, label: "Count", items: ["", 10, 25, 50, 100], onchange: function () { me.refresh(); } }
        ];

        this.monomers = this.page.addForm({
            caption: "Monomer List",
            key: "id",
            object: "helm.monomer",
            imagewidth: 30,
            buttons: this.buttons,
            onbeforerefresh: function (args) { me.onbeforerefresh(args); },
            onbeforesave: function (data, args, form) { return me.onbeforesave(data, args, form); },
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
                createddate: { label: "Created Date", type: "date", width: 100 }
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

    onbeforesave: function (data, args, form) {
        if (data.polymertype != "CHEM" && scil.Utils.isNullOrEmpty(data.naturalanalog)) {
            scil.Utils.alert("Natural Analog cannot be blank");
            return false;
        }

        data.molfile = form.fields.molfile.jsd.getMolfile();

        // check R caps
        var ratoms = {};
        var atoms = form.fields.molfile.jsd.m.atoms;
        for (var i = 0; i < atoms.length; ++i) {
            var a = atoms[i];
            if (a.elem == "R") {
                var r = (a.alias == null ? "R" : a.alias);
                if (ratoms[r.toLowerCase()] != null) {
                    scil.Utils.alert("The R cannot be used twice: " + r);
                    return false;
                }
                ratoms[r.toLowerCase()] = r;
            }
        }

        for (var r in ratoms) {
            var cap = data[r];
            if (scil.Utils.isNullOrEmpty(cap)) {
                scil.Utils.alert("The cap of " + ratoms[r] + " is not defined yet");
                return false;
            }
        }

        for (var i = 1; i <= 5; ++i) {
            var r = "r" + i;
            if (!scil.Utils.isNullOrEmpty(data[r]) && ratoms[r] == null) {
                scil.Utils.alert("R" + i + " is defined, but not drawn in the structure");
                return false;
            }
        }
    },

    /**
    * Refresh the list (internal use)
    * @function refresh
    */
    refresh: function (view) {
        this.monomers.refresh();
    },

    /**
    * Event handler before refreshing (internal use)
    * @function onbeforerefresh
    */
    onbeforerefresh: function (args) {
        scil.Form.getButtonValuesByKey(this.buttons, ["status", "polymertype", "monomertype", "status", "symbol", "countperpage"], args);
    },

    /**
    * Import from file (internal use)
    * @function uploadFile
    */
    uploadFile: function (duplicatecheck) {
        scil.Utils.uploadFile("Import Monomer Library", "Select HELM monomer xml file, json or SDF file (" + (duplicatecheck ? "with" : "without") + " duplicate check)", this.options.ajaxurl + "helm.monomer.uploadlib",
            function (ret) { scil.Utils.alert(ret.n + " monomers are imported"); }, { duplicatecheck: duplicatecheck });
    },

    exportFile: function (ext) {
        window.open(this.options.ajaxurl.replace("/post?", "/get?") + "helm.monomer.savefile&wrapper=raw&ext=" + ext, "_blank");
    }
});

scil.apply(org.helm.webeditor.MonomerLibApp, {
    caps: ["", "H", "OH", "X"],

    /**
    * Get all supported fields (internal use)
    * @function getFields
    */
    getFields: function() {
        return {
            id: { type: "hidden" },
            symbol: { label: "Symbol", required: true },
            name: { label: "Name", required: true, width: 800 },
            polymertype: { label: "Polymer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getPolymerTypes(), width: 100 },
            monomertype: { label: "Monomer Type", required: true, type: "select", items: org.helm.webeditor.MonomerLibApp.getMonomerTypes(), width: 100 },
            naturalanalog: { label: "Natural Analog", width: 100 },
            author: { label: "Author", width: 100 },
            smiles: { label: "SMILES", width: 800 },
            molfile: { label: "Structure", type: "jsdraw", width: 800, height: 300 },
            r1: { label: "R1", type: "select", items: this.caps },
            r2: { label: "R2", type: "select", items: this.caps },
            r3: { label: "R3", type: "select", items: this.caps },
            r4: { label: "R4", type: "select", items: this.caps },
            r5: { label: "R5", type: "select", items: this.caps }
        }
    },

    /**
    * Tool function (internal use)
    * @function getValueByKey
    */
    getValueByKey: function (list, key) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i].key == key)
                return list[i].b.value;
        }
        return null;
    },

    /**
    * List polymer types (internal use)
    * @function getPolymerTypes
    */
    getPolymerTypes: function () {
        return ["", "RNA", "CHEM", "PEPTIDE"];
    },

    /**
    * List monomer types (internal use)
    * @function getMonomerTypes
    */
    getMonomerTypes: function () {
        return ["", "Backbone", "Branch", "Undefined"]
    },

    /**
    * List of statuses (internal use)
    * @function getStatuses
    */
    getStatuses: function () {
        return ["", "New", "Approved", "Retired"]
    }
});