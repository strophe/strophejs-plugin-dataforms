(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  // Copyright (c) Markus Kohlhase, 2011

  // a little helper
  var Field, Form, Item, Option, helper,
    indexOf = [].indexOf;

  helper = {
    fill: function(src, target, klass) {
      var f, l, len, results;
      results = [];
      for (l = 0, len = src.length; l < len; l++) {
        f = src[l];
        results.push(target.push(f instanceof klass ? f : new klass(f)));
      }
      return results;
    },
    createHtmlFieldCouple: function(f) {
      var div, id;
      div = $("<div>");
      id = `Strophe.x.Field-${f.type}-${f.var}`;
      div.append(`<label for='${id}'>${f.label || ''}</label>`).append($(f.toHTML()).attr("id", id)).append("<br />");
      return div.children();
    },
    getHtmlFields: function(html) {
      html = $(html);
      return [...html.find("input"), ...html.find("select"), ...html.find("textarea")];
    }
  };

  Form = (function() {
    class Form {
      constructor(opt) {
        var f, i, l, len, len1, m, ref, ref1, ref2, ref3;
        this.toXML = this.toXML.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.toHTML = this.toHTML.bind(this);
        this.fields = [];
        this.items = [];
        this.reported = [];
        if (opt) {
          if (ref = opt.type, indexOf.call(Form._types, ref) >= 0) {
            this.type = opt.type;
          }
          this.title = opt.title;
          this.instructions = opt.instructions;
          helper.fill = function(src, target, klass) {
            var f, l, len, results;
            results = [];
            for (l = 0, len = src.length; l < len; l++) {
              f = src[l];
              results.push(target.push(f instanceof klass ? f : new klass(f)));
            }
            return results;
          };
          if (opt.fields) {
            if (opt.fields) {
              helper.fill(opt.fields, this.fields, Field);
            }
          } else if (opt.items) {
            if (opt.items) {
              helper.fill(opt.items, this.items, Item);
            }
            ref1 = this.items;
            for (l = 0, len = ref1.length; l < len; l++) {
              i = ref1[l];
              ref2 = i.fields;
              for (m = 0, len1 = ref2.length; m < len1; m++) {
                f = ref2[m];
                if (!(ref3 = f.var, indexOf.call(this.reported, ref3) >= 0)) {
                  this.reported.push(f.var);
                }
              }
            }
          }
        }
      }

      toXML() {
        var f, i, l, len, len1, len2, m, n, r, ref, ref1, ref2, xml;
        xml = $build("x", {
          xmlns: "jabber:x:data",
          type: this.type
        });
        if (this.title) {
          xml.c("title").t(this.title.toString()).up();
        }
        if (this.instructions) {
          xml.c("instructions").t(this.instructions.toString()).up();
        }
        if (this.fields.length > 0) {
          ref = this.fields;
          for (l = 0, len = ref.length; l < len; l++) {
            f = ref[l];
            xml.cnode(f.toXML()).up();
          }
        } else if (this.items.length > 0) {
          xml.c("reported");
          ref1 = this.reported;
          for (m = 0, len1 = ref1.length; m < len1; m++) {
            r = ref1[m];
            xml.c("field", {
              var: r
            }).up();
          }
          xml.up();
          ref2 = this.items;
          for (n = 0, len2 = ref2.length; n < len2; n++) {
            i = ref2[n];
            xml.cnode(i.toXML()).up();
          }
        }
        return xml.tree();
      }

      toJSON() {
        var f, i, json, l, len, len1, m, ref, ref1;
        json = {type: this.type};
        if (this.title) {
          json.title = this.title;
        }
        if (this.instructions) {
          json.instructions = this.instructions;
        }
        if (this.fields.length > 0) {
          json.fields = [];
          ref = this.fields;
          for (l = 0, len = ref.length; l < len; l++) {
            f = ref[l];
            json.fields.push(f.toJSON());
          }
        } else if (this.items.length > 0) {
          json.items = [];
          json.reported = this.reported;
          ref1 = this.items;
          for (m = 0, len1 = ref1.length; m < len1; m++) {
            i = ref1[m];
            json.items.push(i.toJSON());
          }
        }
        return json;
      }

      toHTML() {
        var f, form, i, l, len, len1, m, ref, ref1;
        form = $(`<form data-type='${this.type}'>`);
        if (this.title) {
          form.append(`<h1>${this.title}</h1>`);
        }
        if (this.instructions) {
          form.append(`<p>${this.instructions}</p>`);
        }
        if (this.fields.length > 0) {
          ref = this.fields;
          for (l = 0, len = ref.length; l < len; l++) {
            f = ref[l];
            (helper.createHtmlFieldCouple(f)).appendTo(form);
          }
        } else if (this.items.length > 0) {
          ref1 = this.items;
          for (m = 0, len1 = ref1.length; m < len1; m++) {
            i = ref1[m];
            ($(i.toHTML())).appendTo(form);
          }
        }
        return form[0];
      }

      static fromXML(xml) {
        var f, fields, i, instr, items, j, r, reported, title;
        xml = $(xml);
        f = new Form({
          type: xml.attr("type")
        });
        title = xml.find("title");
        if (title.length === 1) {
          f.title = title.text();
        }
        instr = xml.find("instructions");
        if (instr.length === 1) {
          f.instructions = instr.text();
        }
        fields = xml.find("field");
        items = xml.find("item");
        if (items.length > 0) {
          f.items = (function() {
            var l, len, results;
            results = [];
            for (l = 0, len = items.length; l < len; l++) {
              i = items[l];
              results.push(Item.fromXML(i));
            }
            return results;
          })();
        } else if (fields.length > 0) {
          f.fields = (function() {
            var l, len, results;
            results = [];
            for (l = 0, len = fields.length; l < len; l++) {
              j = fields[l];
              results.push(Field.fromXML(j));
            }
            return results;
          })();
        }
        reported = xml.find("reported");
        if (reported.length === 1) {
          fields = reported.find("field");
          f.reported = (function() {
            var l, len, results;
            results = [];
            for (l = 0, len = fields.length; l < len; l++) {
              r = fields[l];
              results.push(($(r)).attr("var"));
            }
            return results;
          })();
        }
        return f;
      }

      static fromHTML(html) {
        var f, field, fields, i, instructions, item, items, j, l, len, len1, m, ref, ref1, ref2, title;
        html = $(html);
        f = new Form({
          type: html.attr("data-type")
        });
        title = html.find("h1").text();
        if (title) {
          f.title = title;
        }
        instructions = html.find("p").text();
        if (instructions) {
          f.instructions = instructions;
        }
        items = html.find("fieldset");
        fields = helper.getHtmlFields(html);
        if (items.length > 0) {
          f.items = (function() {
            var l, len, results;
            results = [];
            for (l = 0, len = items.length; l < len; l++) {
              i = items[l];
              results.push(Item.fromHTML(i));
            }
            return results;
          })();
          ref = f.items;
          for (l = 0, len = ref.length; l < len; l++) {
            item = ref[l];
            ref1 = item.fields;
            for (m = 0, len1 = ref1.length; m < len1; m++) {
              field = ref1[m];
              if (!(ref2 = field.var, indexOf.call(f.reported, ref2) >= 0)) {
                f.reported.push(field.var);
              }
            }
          }
        } else if (fields.length > 0) {
          f.fields = (function() {
            var len2, n, results;
            results = [];
            for (n = 0, len2 = fields.length; n < len2; n++) {
              j = fields[n];
              results.push(Field.fromHTML(j));
            }
            return results;
          })();
        }
        return f;
      }

    }
    Form._types = ["form", "submit", "cancel", "result"];

    Form.prototype.type = "form";

    Form.prototype.title = null;

    Form.prototype.instructions = null;

    return Form;

  }).call(undefined);

  Field = (function() {
    class Field {
      constructor(opt) {
        var ref, ref1;
        this.addValue = this.addValue.bind(this);
        this.addValues = this.addValues.bind(this);
        this.addOption = this.addOption.bind(this);
        this.addOptions = this.addOptions.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.toXML = this.toXML.bind(this);
        this.toHTML = this.toHTML.bind(this);
        this.options = [];
        this.values = [];
        if (opt) {
          if (ref = opt.type, indexOf.call(Field._types, ref) >= 0) {
            this.type = opt.type.toString();
          }
          if (opt.desc) {
            this.desc = opt.desc.toString();
          }
          if (opt.label) {
            this.label = opt.label.toString();
          }
          this.var = ((ref1 = opt.var) != null ? ref1.toString() : void 0) || "_no_var_was_defined_";
          this.required = opt.required === true || opt.required === "true";
          if (opt.options) {
            this.addOptions(opt.options);
          }
          if (opt.value) {
            opt.values = [opt.value];
          }
          if (opt.values) {
            this.addValues(opt.values);
          }
        }
      }

      addValue(val) {
        return this.addValues([val]);
      }

      addValues(vals) {
        var multi, ref, v;
        multi = (ref = this.type, indexOf.call(Field._multiTypes, ref) >= 0);
        if (multi || (!multi && vals.length === 1)) {
          this.values = [
            ...this.values,
            ...((function() {
              var l,
            len,
            results;
              results = [];
              for (l = 0, len = vals.length; l < len; l++) {
                v = vals[l];
                results.push(v.toString());
              }
              return results;
            })())
          ];
        }
        return this;
      }

      addOption(opt) {
        return this.addOptions([opt]);
      }

      addOptions(opts) {
        var o;
        if (this.type === "list-single" || this.type === "list-multi") {
          if (typeof opts[0] !== "object") {
            opts = (function() {
              var l, len, results;
              results = [];
              for (l = 0, len = opts.length; l < len; l++) {
                o = opts[l];
                results.push(new Option({
                  value: o.toString()
                }));
              }
              return results;
            })();
          }
          helper.fill(opts, this.options, Option);
        }
        return this;
      }

      toJSON() {
        var json, l, len, o, ref;
        json = {type: this.type, var: this.var, required: this.required};
        if (this.desc) {
          json.desc = this.desc;
        }
        if (this.label) {
          json.label = this.label;
        }
        if (this.values) {
          json.values = this.values;
        }
        if (this.options) {
          json.options = [];
          ref = this.options;
          for (l = 0, len = ref.length; l < len; l++) {
            o = ref[l];
            json.options.push(o.toJSON());
          }
        }
        return json;
      }

      toXML() {
        var attrs, l, len, len1, m, o, ref, ref1, v, xml;
        attrs = {type: this.type, var: this.var};
        if (this.label) {
          attrs.label = this.label;
        }
        xml = $build("field", attrs);
        if (this.desc) {
          xml.c("desc").t(this.desc).up();
        }
        if (this.required) {
          xml.c("required").up();
        }
        if (this.values) {
          ref = this.values;
          for (l = 0, len = ref.length; l < len; l++) {
            v = ref[l];
            xml.c("value").t(v.toString()).up();
          }
        }
        if (this.options) {
          ref1 = this.options;
          for (m = 0, len1 = ref1.length; m < len1; m++) {
            o = ref1[m];
            xml.cnode(o.toXML()).up();
          }
        }
        return xml.tree();
      }

      toHTML() {
        var el, k, l, len, len1, line, m, o, opt, ref, ref1, ref2, txt, val;
        switch (this.type.toLowerCase()) {
          case 'list-single':
          case 'list-multi':
            el = $("<select>");
            if (this.type === 'list-multi') {
              el.attr('multiple', 'multiple');
            }
            if (this.options.length > 0) {
              ref = this.options;
              for (l = 0, len = ref.length; l < len; l++) {
                opt = ref[l];
                if (!(opt)) {
                  continue;
                }
                o = $(opt.toHTML());
                ref1 = this.values;
                for (m = 0, len1 = ref1.length; m < len1; m++) {
                  k = ref1[m];
                  if (k.toString() === opt.value.toString()) {
                    o.attr('selected', 'selected');
                  }
                }
                o.appendTo(el);
              }
            }
            break;
          case 'text-multi':
          case 'jid-multi':
            el = $("<textarea>");
            txt = ((function() {
              var len2, n, ref2, results;
              ref2 = this.values;
              results = [];
              for (n = 0, len2 = ref2.length; n < len2; n++) {
                line = ref2[n];
                results.push(line);
              }
              return results;
            }).call(this)).join('\n');
            if (txt) {
              el.text(txt);
            }
            break;
          case 'text-single':
          case 'boolean':
          case 'text-private':
          case 'hidden':
          case 'fixed':
          case 'jid-single':
            el = $("<input>");
            if (this.values) {
              el.val(this.values[0]);
            }
            switch (this.type.toLowerCase()) {
              case 'text-single':
                el.attr('type', 'text');
                el.attr('placeholder', this.desc);
                break;
              case 'boolean':
                el.attr('type', 'checkbox');
                val = (ref2 = this.values[0]) != null ? typeof ref2.toString === "function" ? ref2.toString() : void 0 : void 0;
                if (val && (val === "true" || val === "1")) {
                  el.attr('checked', 'checked');
                }
                break;
              case 'text-private':
                el.attr('type', 'password');
                break;
              case 'hidden':
                el.attr('type', 'hidden');
                break;
              case 'fixed':
                el.attr('type', 'text').attr('readonly', 'readonly');
                break;
              case 'jid-single':
                el.attr('type', 'email');
            }
            break;
          default:
            el = $("<input type='text'>");
        }
        el.attr('name', this.var);
        if (this.required) {
          el.attr('required', this.required);
        }
        return el[0];
      }

      static fromXML(xml) {
        var o, v;
        xml = $(xml);
        return new Field({
          type: xml.attr("type"),
          var: xml.attr("var"),
          label: xml.attr("label"),
          desc: xml.find("desc").text(),
          required: xml.find("required").length === 1,
          values: (function() {
            var l, len, ref, results;
            ref = xml.find(">value");
            results = [];
            for (l = 0, len = ref.length; l < len; l++) {
              v = ref[l];
              results.push(($(v)).text());
            }
            return results;
          })(),
          options: (function() {
            var l, len, ref, results;
            ref = xml.find("option");
            results = [];
            for (l = 0, len = ref.length; l < len; l++) {
              o = ref[l];
              results.push(Option.fromXML(o));
            }
            return results;
          })()
        });
      }

      static _htmlElementToFieldType(el) {
        var r, type;
        el = $(el);
        switch (el[0].nodeName.toLowerCase()) {
          case "textarea":
            type = "text-multi"; // or jid-multi
            break;
          case "select":
            if (el.attr("multiple") === "multiple") {
              type = "list-multi";
            } else {
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
                r = el.attr("readonly") === "readonly";
                if (r) {
                  type = "fixed";
                } else {
                  type = "text-single";
                }
            }
        }
        return type;
      }

      static fromHTML(html) {
        var el, f, txt, type;
        html = $(html);
        type = Field._htmlElementToFieldType(html);
        f = new Field({
          type: type,
          var: html.attr("name"),
          required: html.attr("required") === "required"
        });
        switch (type) {
          case "list-multi":
          case "list-single":
            f.values = (function() {
              var l, len, ref, results;
              ref = html.find("option:selected");
              results = [];
              for (l = 0, len = ref.length; l < len; l++) {
                el = ref[l];
                results.push(($(el)).val());
              }
              return results;
            })();
            f.options = (function() {
              var l, len, ref, results;
              ref = html.find("option");
              results = [];
              for (l = 0, len = ref.length; l < len; l++) {
                el = ref[l];
                results.push(Option.fromHTML(el));
              }
              return results;
            })();
            break;
          case "text-multi":
          case "jid-multi":
            txt = html.text();
            if (txt.trim() !== "") {
              f.values = txt.split('\n');
            }
            break;
          case 'text-single':
          case 'boolean':
          case 'text-private':
          case 'hidden':
          case 'fixed':
          case 'jid-single':
            if (html.val().trim() !== "") {
              f.values = [html.val()];
            }
        }
        return f;
      }

    }
    Field._types = ["boolean", "fixed", "hidden", "jid-multi", "jid-single", "list-multi", "list-single", "text-multi", "text-private", "text-single"];

    Field._multiTypes = ["list-multi", "jid-multi", "text-multi", "hidden"];

    Field.prototype.type = "text-single";

    Field.prototype.desc = null;

    Field.prototype.label = null;

    Field.prototype.var = "_no_var_was_defined_";

    Field.prototype.required = false;

    return Field;

  }).call(undefined);

  Option = (function() {
    class Option {
      constructor(opt) {
        this.toXML = this.toXML.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.toHTML = this.toHTML.bind(this);
        if (opt) {
          if (opt.label) {
            this.label = opt.label.toString();
          }
          if (opt.value) {
            this.value = opt.value.toString();
          }
        }
      }

      toXML() {
        return $build("option", {
          label: this.label
        }).c("value").t(this.value.toString()).tree();
      }

      toJSON() {
        return {label: this.label, value: this.value};
      }

      toHTML() {
        return ($("<option>")).attr('value', this.value).text(this.label || this.value)[0];
      }

      static fromXML(xml) {
        return new Option({
          label: ($(xml)).attr("label"),
          value: ($(xml)).text()
        });
      }

      static fromHTML(html) {
        return new Option({
          value: ($(html)).attr("value"),
          label: ($(html)).text()
        });
      }

    }
    Option.prototype.label = "";

    Option.prototype.value = "";

    return Option;

  }).call(undefined);

  Item = class Item {
    constructor(opts) {
      this.toXML = this.toXML.bind(this);
      this.toJSON = this.toJSON.bind(this);
      this.toHTML = this.toHTML.bind(this);
      this.fields = [];
      if (opts != null ? opts.fields : void 0) {
        helper.fill(opts.fields, this.fields, Field);
      }
    }

    toXML() {
      var f, l, len, ref, xml;
      xml = $build("item");
      ref = this.fields;
      for (l = 0, len = ref.length; l < len; l++) {
        f = ref[l];
        xml.cnode(f.toXML()).up();
      }
      return xml.tree();
    }

    toJSON() {
      var f, json, l, len, ref;
      json = {};
      if (this.fields) {
        json.fields = [];
        ref = this.fields;
        for (l = 0, len = ref.length; l < len; l++) {
          f = ref[l];
          json.fields.push(f.toJSON());
        }
      }
      return json;
    }

    toHTML() {
      var f, fieldset, l, len, ref;
      fieldset = $("<fieldset>");
      ref = this.fields;
      for (l = 0, len = ref.length; l < len; l++) {
        f = ref[l];
        (helper.createHtmlFieldCouple(f)).appendTo(fieldset);
      }
      return fieldset[0];
    }

    static fromXML(xml) {
      var f, fields;
      xml = $(xml);
      fields = xml.find("field");
      return new Item({
        fields: (function() {
          var l, len, results;
          results = [];
          for (l = 0, len = fields.length; l < len; l++) {
            f = fields[l];
            results.push(Field.fromXML(f));
          }
          return results;
        })()
      });
    }

    static fromHTML(html) {
      var f;
      return new Item({
        fields: (function() {
          var l, len, ref, results;
          ref = helper.getHtmlFields(html);
          results = [];
          for (l = 0, len = ref.length; l < len; l++) {
            f = ref[l];
            results.push(Field.fromHTML(f));
          }
          return results;
        })()
      });
    }

  };

  Strophe.x = {
    Form: Form,
    Field: Field,
    Option: Option,
    Item: Item
  };

  Strophe.addConnectionPlugin('x', {
    init: function(conn) {
      var ref, ref1;
      Strophe.addNamespace('DATA', 'jabber:x:data');
      if (((ref = conn.disco) != null ? ref.addFeature : void 0) != null) {
        conn.disco.addFeature(Strophe.NS.DATA);
      }
      if (((ref1 = conn.disco) != null ? ref1.addNode : void 0) != null) {
        return conn.disco.addNode(Strophe.NS.DATA, {
          items: []
        });
      }
    },
    parseFromResult: function(result) {
      var ref;
      if (result.nodeName.toLowerCase() === "x") {
        return Form.fromXML(result);
      } else {
        return Form.fromXML((ref = ($(result)).find("x")) != null ? ref[0] : void 0);
      }
    }
  });

})));
