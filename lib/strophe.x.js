"use strict";
// Copyright (c) Markus Kohlhase, 2011
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var strophe_js_1 = require("strophe.js");
// a little helper
var helper = {
    fill: function (src, target, klass) {
        return __spreadArrays(target, src.map(function (f) { return (f instanceof klass ? f : new klass(f)); }));
    },
    createHtmlFieldCouple: function (f) {
        var div = $("<div>");
        var id = "Strophe.x.Field-" + f.type + "-" + f.var;
        div
            .append("<label for='" + id + "'>" + (f.label || "") + "</label>")
            .append($(f.toHTML()).attr("id", id))
            .append("<br />");
        return div.children();
    },
    getHtmlFields: function (htmlIn) {
        var html = $(htmlIn);
        return __spreadArrays(html.find("input").toArray(), html.find("select").toArray(), html.find("textarea").toArray());
    },
};
var Form = /** @class */ (function () {
    function Form(opt) {
        this.type = "form";
        this.fields = [];
        this.items = [];
        this.reported = [];
        this.reported = [];
        if (opt) {
            if (opt.type) {
                this.type = opt.type;
            }
            this.title = opt.title;
            this.instructions = opt.instructions;
            if (opt.fields) {
                if (opt.fields) {
                    this.fields = helper.fill(opt.fields, this.fields, Field);
                }
            }
            else if (opt.items) {
                if (opt.items) {
                    this.items = helper.fill(opt.items, this.items, Item);
                }
                this.updateReported();
            }
        }
    }
    Form.prototype.updateReported = function () {
        var _this = this;
        this.items.forEach(function (item) {
            return item.fields.forEach(function (field) {
                if (!_this.reported.some(function (val) { return val === field.var; })) {
                    _this.reported = __spreadArrays(_this.reported, [field.var]);
                }
            });
        });
    };
    Form.prototype.toXML = function () {
        var xml = strophe_js_1.$build("x", { xmlns: "jabber:x:data", type: this.type });
        if (this.title) {
            xml.c("title").t(this.title.toString()).up();
        }
        if (this.instructions) {
            xml.c("instructions").t(this.instructions.toString()).up();
        }
        if (this.fields.length > 0) {
            this.fields.forEach(function (f) { return xml.cnode(f.toXML()).up(); });
        }
        else if (this.items.length > 0) {
            xml.c("reported");
            this.reported.forEach(function (r) { return xml.c("field", { var: r }).up(); });
            xml.up();
            this.items.forEach(function (i) { return xml.cnode(i.toXML()).up(); });
        }
        return xml.tree();
    };
    Form.prototype.toJSON = function () {
        var json = {
            type: this.type,
            title: this.title,
            instructions: this.instructions,
            fields: this.fields.map(function (field) { return field.toJSON(); }),
            items: this.items.map(function (item) { return item.toJSON(); }),
            reported: this.reported,
        };
        return json;
    };
    Form.prototype.toHTML = function () {
        var form = $("<form data-type='" + this.type + "'>");
        if (this.title) {
            form.append("<h1>" + this.title + "</h1>");
        }
        if (this.instructions) {
            form.append("<p>" + this.instructions + "</p>");
        }
        if (this.fields.length > 0) {
            this.fields.forEach(function (f) {
                return helper.createHtmlFieldCouple(f).appendTo(form);
            });
        }
        else if (this.items.length > 0) {
            this.items.forEach(function (i) { return $(i.toHTML()).appendTo(form); });
        }
        return form[0];
    };
    Form.fromXML = function (xmlIn) {
        var xml = $(xmlIn);
        var f = new Form({
            type: xml.attr("type"),
        });
        var title = xml.find("title");
        if (title.length === 1) {
            f.title = title.text();
        }
        var instr = xml.find("instructions");
        if (instr.length === 1) {
            f.instructions = instr.text();
        }
        var fields = xml.find("field");
        var items = xml.find("item");
        if (items.length > 0) {
            f.items = items.toArray().map(Item.fromXML);
        }
        else if (fields.length > 0) {
            f.fields = fields.toArray().map(Field.fromXML);
        }
        var reported = xml.find("reported");
        if (reported.length === 1) {
            fields = reported.find("field");
            f.reported = fields.toArray().map(function (r) { return $(r).attr("var"); });
        }
        return f;
    };
    Form.fromHTML = function (htmlIn) {
        var html = $(htmlIn);
        var f = new Form({
            type: html.attr("data-type"),
        });
        var title = html.find("h1").text();
        if (title) {
            f.title = title;
        }
        var instructions = html.find("p").text();
        if (instructions) {
            f.instructions = instructions;
        }
        var items = html.find("fieldset");
        var fields = helper.getHtmlFields(htmlIn);
        if (items.length > 0) {
            f.items = items.toArray().map(Item.fromHTML);
            f.updateReported();
        }
        else if (fields.length > 0) {
            f.fields = fields.map(Field.fromHTML);
        }
        return f;
    };
    return Form;
}());
var FieldMultiType;
(function (FieldMultiType) {
    FieldMultiType["list-multi"] = "list-multi";
    FieldMultiType["jid-multi"] = "jid-multi";
    FieldMultiType["text-multi"] = "text-multi";
    FieldMultiType["hidden"] = "hidden";
})(FieldMultiType || (FieldMultiType = {}));
var Field = /** @class */ (function () {
    function Field(opt) {
        var _a;
        this.type = "text-single";
        this.var = "_no_var_was_defined_";
        this.required = false;
        this.options = [];
        this.values = [];
        if (opt) {
            this.type = opt.type;
            if (opt.desc) {
                this.desc = opt.desc;
            }
            if (opt.label) {
                this.label = opt.label;
            }
            this.var = (_a = opt.var) !== null && _a !== void 0 ? _a : "_no_var_was_defined_";
            this.required = opt.required === true || opt.required === "true";
            if (opt.options) {
                this.addOptions(opt.options);
            }
            if (opt.value) {
                this.addValue(opt.value);
            }
            if (opt.values) {
                this.addValues(opt.values);
            }
        }
    }
    Field.prototype.addValue = function (val) {
        return this.addValues([val]);
    };
    Field.prototype.addValues = function (vals) {
        var multi = this.type in FieldMultiType;
        if (multi || (!multi && vals.length === 1)) {
            this.values = __spreadArrays(this.values, vals.map(function (v) { return v.toString(); }));
        }
        return this;
    };
    Field.prototype.addOption = function (opt) {
        return this.addOptions([opt]);
    };
    Field.prototype.addOptions = function (opts) {
        if (this.type === "list-single" || this.type === "list-multi") {
            if (typeof opts[0] !== "object") {
                opts = opts.map(function (o) { return new FieldOption({ value: o.toString() }); });
            }
            this.options = helper.fill(opts, this.options, FieldOption);
        }
        return this;
    };
    Field.prototype.toJSON = function () {
        var json = {
            type: this.type,
            var: this.var,
            required: this.required,
            desc: this.desc,
            label: this.label,
            values: this.values,
            options: this.options.map(function (o) { return o.toJSON(); }),
        };
        return json;
    };
    Field.prototype.toXML = function () {
        var attrs = {
            type: this.type,
            var: this.var,
            label: this.label,
        };
        var xml = strophe_js_1.$build("field", attrs);
        if (this.desc) {
            xml.c("desc").t(this.desc).up();
        }
        if (this.required) {
            xml.c("required").up();
        }
        if (this.values) {
            this.values.forEach(function (v) { return xml.c("value").t(v.toString()).up(); });
        }
        if (this.options) {
            this.options.forEach(function (o) { return xml.cnode(o.toXML()).up(); });
        }
        return xml.tree();
    };
    Field.prototype.toHTML = function () {
        var _this = this;
        var el;
        switch (this.type.toLowerCase()) {
            case "list-single":
            case "list-multi":
                el = $("<select>");
                if (this.type === "list-multi") {
                    el.attr("multiple", "multiple");
                }
                if (this.options.length > 0) {
                    this.options.forEach(function (option) {
                        var o = $(option.toHTML());
                        _this.values.forEach(function (value) {
                            if (value === option.value) {
                                o.attr("selected", "selected");
                            }
                        });
                        o.appendTo(el);
                    });
                }
                break;
            case "text-multi":
            case "jid-multi":
                el = $("<textarea>");
                var txt = this.values.join("\n");
                if (txt) {
                    el.text(txt);
                }
                break;
            case "text-single":
            case "boolean":
            case "text-private":
            case "hidden":
            case "fixed":
            case "jid-single":
                el = $("<input>");
                if (this.values) {
                    el.val(this.values[0]);
                }
                switch (this.type.toLowerCase()) {
                    case "text-single":
                        el.attr("type", "text");
                        el.attr("placeholder", this.desc || "");
                        break;
                    case "boolean":
                        el.attr("type", "checkbox");
                        var val = this.values[0].toString();
                        if (val && (val === "true" || val === "1")) {
                            el.attr("checked", "checked");
                        }
                        break;
                    case "text-private":
                        el.attr("type", "password");
                        break;
                    case "hidden":
                        el.attr("type", "hidden");
                        break;
                    case "fixed":
                        el.attr("type", "text").attr("readonly", "readonly");
                        break;
                    case "jid-single":
                        el.attr("type", "email");
                        break;
                }
                break;
            default:
                el = $("<input type='text'>");
        }
        el.attr("name", this.var);
        if (this.required) {
            el.attr("required", "true");
        }
        return el[0];
    };
    Field.fromXML = function (xmlIn) {
        var xml = $(xmlIn);
        return new Field({
            type: xml.attr("type"),
            var: xml.attr("var"),
            label: xml.attr("label"),
            desc: xml.find("desc").text(),
            required: xml.find("required").length === 1,
            values: xml
                .find(">value")
                .toArray()
                .map(function (v) { return $(v).text(); }),
            options: xml.find("option").toArray().map(FieldOption.fromXML),
        });
    };
    Field._htmlElementToFieldType = function (html) {
        var type;
        var el = $(html);
        switch (el[0].nodeName.toLowerCase()) {
            case "textarea":
                type = "text-multi"; // or jid-multi
                break;
            case "select":
                if (el.attr("multiple") === "multiple") {
                    type = "list-multi";
                }
                else {
                    type = "list-single";
                }
                break;
            case "input":
                switch (el.attr("type")) {
                    case "checkbox":
                        type = "boolean";
                        break;
                    case "email":
                        type = "jid-single";
                        break;
                    case "hidden":
                        type = "hidden";
                        break;
                    case "password":
                        type = "text-private";
                        break;
                    case "text":
                        var r = el.attr("readonly") === "readonly";
                        if (r) {
                            type = "fixed";
                        }
                        else {
                            type = "text-single";
                        }
                        break;
                    default:
                        throw "Could not determine type for input element";
                }
                break;
            default:
                throw "Could not determine type for node";
        }
        return type;
    };
    Field.fromHTML = function (htmlIn) {
        var _a, _b;
        var el;
        var html = $(htmlIn);
        var type = Field._htmlElementToFieldType(htmlIn);
        var f = new Field({
            type: type,
            var: html.attr("name"),
            required: html.attr("required") === "required",
        });
        switch (type) {
            case "list-multi":
            case "list-single":
                f.values = html
                    .find("option:selected")
                    .toArray()
                    .map(function (el) { var _a, _b; return (_b = (_a = $(el).val()) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""; });
                f.options = html
                    .find("option")
                    .toArray()
                    .map(function (el) { return FieldOption.fromHTML(el); });
                break;
            case "text-multi":
            case "jid-multi":
                var txt = html.text();
                if (txt.trim() !== "") {
                    f.values = txt.split("\n");
                }
                break;
            case "text-single":
            case "boolean":
            case "text-private":
            case "hidden":
            case "fixed":
            case "jid-single":
                var value = (_b = (_a = html.val()) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "";
                if (value.trim() !== "") {
                    f.values = [value];
                }
                break;
        }
        return f;
    };
    return Field;
}());
var FieldOption = /** @class */ (function () {
    function FieldOption(opt) {
        this.label = "";
        this.value = "";
        if (opt === null || opt === void 0 ? void 0 : opt.label) {
            this.label = opt.label;
        }
        if (opt === null || opt === void 0 ? void 0 : opt.value) {
            this.value = opt.value.toString();
        }
    }
    FieldOption.prototype.toXML = function () {
        return strophe_js_1.$build("option", { label: this.label })
            .c("value")
            .t(this.value.toString())
            .tree();
    };
    FieldOption.prototype.toJSON = function () {
        return { label: this.label, value: this.value };
    };
    FieldOption.prototype.toHTML = function () {
        return $("<option>")
            .attr("value", this.value)
            .text(this.label || this.value)[0];
    };
    FieldOption.fromXML = function (xml) {
        return new FieldOption({
            label: $(xml).attr("label"),
            value: $(xml).text(),
        });
    };
    FieldOption.fromHTML = function (html) {
        return new FieldOption({
            value: $(html).attr("value"),
            label: $(html).text(),
        });
    };
    return FieldOption;
}());
var Item = /** @class */ (function () {
    function Item(opts) {
        this.fields = [];
        if (opts === null || opts === void 0 ? void 0 : opts.fields) {
            this.fields = helper.fill(opts.fields, this.fields, Field);
        }
    }
    Item.prototype.toXML = function () {
        var xml = strophe_js_1.$build("item");
        this.fields.forEach(function (f) { return xml.cnode(f.toXML()).up(); });
        return xml.tree();
    };
    Item.prototype.toJSON = function () {
        var json = {
            fields: this.fields.map(function (field) { return field.toJSON(); }),
        };
        return json;
    };
    Item.prototype.toHTML = function () {
        var fieldset = $("<fieldset>");
        this.fields.forEach(function (f) {
            return helper.createHtmlFieldCouple(f).appendTo(fieldset);
        });
        return fieldset[0];
    };
    Item.fromXML = function (xmlIn) {
        var xml = $(xmlIn);
        var fields = xml.find("field");
        return new Item({
            fields: fields.toArray().map(function (f) { return Field.fromXML(f); }),
        });
    };
    Item.fromHTML = function (html) {
        return new Item({
            fields: helper.getHtmlFields(html).map(Field.fromHTML),
        });
    };
    return Item;
}());
strophe_js_1.Strophe.x = {
    Form: Form,
    Field: Field,
    Option: FieldOption,
    Item: Item,
};
strophe_js_1.Strophe.addConnectionPlugin("x", {
    init: function (conn) {
        var _a, _b;
        strophe_js_1.Strophe.addNamespace("DATA", "jabber:x:data");
        (_a = conn.disco) === null || _a === void 0 ? void 0 : _a.addFeature(strophe_js_1.Strophe.NS.DATA);
        return (_b = conn.disco) === null || _b === void 0 ? void 0 : _b.addNode(strophe_js_1.Strophe.NS.DATA, {
            items: [],
        });
    },
    parseFromResult: function (result) {
        var _a;
        if (result.nodeName.toLowerCase() === "x") {
            return Form.fromXML(result);
        }
        else {
            return Form.fromXML((_a = $(result).find("x")) === null || _a === void 0 ? void 0 : _a[0]);
        }
    },
});
var $form = function (opt) { return new strophe_js_1.Strophe.x.Form(opt); };
exports.$form = $form;
var $field = function (opt) {
    return new strophe_js_1.Strophe.x.Field(opt);
};
exports.$field = $field;
var $opt = function (opt) {
    return new strophe_js_1.Strophe.x.Option(opt);
};
exports.$opt = $opt;
var $item = function (opt) { return new strophe_js_1.Strophe.x.Item(opt); };
exports.$item = $item;
