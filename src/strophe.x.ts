// Copyright (c) Markus Kohlhase, 2011

import { Strophe, $build } from "strophe.js";

// a little helper
const helper = {
  fill<T>(src: readonly T[], target: readonly T[], klass: { new (arg: T): T }) {
    return [
      ...target,
      ...src.map((f) => (f instanceof klass ? f : new klass(f))),
    ];
  },

  createHtmlFieldCouple(f: Field) {
    const div = $("<div>");
    const id = `Strophe.x.Field-${f.type}-${f.var}`;
    div
      .append(`<label for='${id}'>${f.label || ""}</label>`)
      .append($(f.toHTML()).attr("id", id))
      .append("<br />");
    return div.children();
  },

  getHtmlFields(htmlIn: HTMLElement) {
    const html = $(htmlIn);
    return [
      ...html.find("input").toArray(),
      ...html.find("select").toArray(),
      ...html.find("textarea").toArray(),
    ];
  },
};

type FormType = "form" | "submit" | "cancel" | "result";
type FormOptions = {
  type?: FormType;
  title?: string;
  instructions?: string;
  fields?: Field[];
  items?: Item[];
};

class Form {
  type: FormType = "form";
  title: string | undefined;
  instructions: string | undefined;
  fields: Field[] = [];
  items: Item[] = [];
  reported: string[] = [];

  constructor(opt?: FormOptions) {
    this.reported = [];

    if (opt) {
      if (opt.type) {
        this.type = opt.type;
      }
      this.title = opt.title;
      this.instructions = opt.instructions;

      if (opt.fields) {
        if (opt.fields) {
          this.fields = helper.fill<Field>(opt.fields, this.fields, Field);
        }
      } else if (opt.items) {
        if (opt.items) {
          this.items = helper.fill<Item>(opt.items, this.items, Item);
        }

        this.updateReported();
      }
    }
  }

  updateReported() {
    this.items.forEach((item) =>
      item.fields.forEach((field) => {
        if (!this.reported.some((val) => val === field.var)) {
          this.reported = [...this.reported, field.var];
        }
      })
    );
  }

  toXML() {
    const xml = $build("x", { xmlns: "jabber:x:data", type: this.type });

    if (this.title) {
      xml.c("title").t(this.title.toString()).up();
    }
    if (this.instructions) {
      xml.c("instructions").t(this.instructions.toString()).up();
    }

    if (this.fields.length > 0) {
      this.fields.forEach((f) => xml.cnode(f.toXML()).up());
    } else if (this.items.length > 0) {
      xml.c("reported");

      this.reported.forEach((r) => xml.c("field", { var: r }).up());
      xml.up();

      this.items.forEach((i) => xml.cnode(i.toXML()).up());
    }

    return xml.tree();
  }

  toJSON() {
    const json = {
      type: this.type,
      title: this.title,
      instructions: this.instructions,
      fields: this.fields.map((field) => field.toJSON()),
      items: this.items.map((item) => item.toJSON()),
      reported: this.reported,
    };
    return json;
  }

  toHTML() {
    const form = $(`<form data-type='${this.type}'>`);
    if (this.title) {
      form.append(`<h1>${this.title}</h1>`);
    }
    if (this.instructions) {
      form.append(`<p>${this.instructions}</p>`);
    }

    if (this.fields.length > 0) {
      this.fields.forEach((f) =>
        helper.createHtmlFieldCouple(f).appendTo(form)
      );
    } else if (this.items.length > 0) {
      this.items.forEach((i) => $(i.toHTML()).appendTo(form));
    }

    return form[0];
  }

  static fromXML(xmlIn: Element) {
    const xml = $(xmlIn);
    const f = new Form({
      type: xml.attr("type") as FormType,
    });

    const title = xml.find("title");
    if (title.length === 1) {
      f.title = title.text();
    }

    const instr = xml.find("instructions");
    if (instr.length === 1) {
      f.instructions = instr.text();
    }

    let fields = xml.find("field");
    const items = xml.find("item");

    if (items.length > 0) {
      f.items = items.toArray().map(Item.fromXML);
    } else if (fields.length > 0) {
      f.fields = fields.toArray().map(Field.fromXML);
    }

    const reported = xml.find("reported");
    if (reported.length === 1) {
      fields = reported.find("field");
      f.reported = fields.toArray().map((r) => $(r).attr("var")!);
    }
    return f;
  }

  static fromHTML(htmlIn: HTMLElement) {
    const html = $(htmlIn);

    const f = new Form({
      type: html.attr("data-type") as FormType,
    });

    const title = html.find("h1").text();
    if (title) {
      f.title = title;
    }

    const instructions = html.find("p").text();
    if (instructions) {
      f.instructions = instructions;
    }

    const items = html.find("fieldset");
    const fields = helper.getHtmlFields(htmlIn);

    if (items.length > 0) {
      f.items = items.toArray().map(Item.fromHTML);
      f.updateReported();
    } else if (fields.length > 0) {
      f.fields = fields.map(Field.fromHTML);
    }

    return f;
  }
}

type FieldType =
  | "boolean"
  | "fixed"
  | "hidden"
  | "jid-multi"
  | "jid-single"
  | "list-multi"
  | "list-single"
  | "text-multi"
  | "text-private"
  | "text-single";

enum FieldMultiType {
  "list-multi" = "list-multi",
  "jid-multi" = "jid-multi",
  "text-multi" = "text-multi",
  "hidden" = "hidden",
}

type FieldValue = string | number;

interface FieldOptions {
  type: FieldType;
  desc?: string;
  label?: string;
  var?: string;
  required?: boolean | "true";
  options?: FieldOption[];
  value?: FieldValue;
  values?: FieldValue[];
}

class Field {
  type: FieldType = "text-single";
  desc: string | undefined;
  label: string | undefined;
  var: string = "_no_var_was_defined_";
  required = false as boolean;
  options = [] as FieldOption[];
  values = [] as string[];

  constructor(opt: FieldOptions) {
    if (opt) {
      this.type = opt.type;
      if (opt.desc) {
        this.desc = opt.desc;
      }
      if (opt.label) {
        this.label = opt.label;
      }
      this.var = opt.var ?? "_no_var_was_defined_";
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

  addValue(val: FieldValue) {
    return this.addValues([val]);
  }

  addValues(vals: FieldValue[]) {
    const multi = this.type in FieldMultiType;
    if (multi || (!multi && vals.length === 1)) {
      this.values = [...this.values, ...vals.map((v) => v.toString())];
    }
    return this;
  }

  addOption(opt: FieldOption) {
    return this.addOptions([opt]);
  }

  addOptions(opts: FieldOption[]) {
    if (this.type === "list-single" || this.type === "list-multi") {
      if (typeof opts[0] !== "object") {
        opts = opts.map((o) => new FieldOption({ value: o.toString() }));
      }
      this.options = helper.fill<FieldOption>(opts, this.options, FieldOption);
    }
    return this;
  }

  toJSON() {
    const json = {
      type: this.type,
      var: this.var,
      required: this.required,
      desc: this.desc,
      label: this.label,
      values: this.values,
      options: this.options.map((o) => o.toJSON()),
    };
    return json;
  }

  toXML() {
    const attrs = {
      type: this.type,
      var: this.var,
      label: this.label,
    };

    const xml = $build("field", attrs);

    if (this.desc) {
      xml.c("desc").t(this.desc).up();
    }
    if (this.required) {
      xml.c("required").up();
    }

    if (this.values) {
      this.values.forEach((v) => xml.c("value").t(v.toString()).up());
    }

    if (this.options) {
      this.options.forEach((o) => xml.cnode(o.toXML()).up());
    }
    return xml.tree();
  }

  toHTML() {
    let el: JQuery<HTMLElement>;
    switch (this.type.toLowerCase()) {
      case "list-single":
      case "list-multi":
        el = $("<select>");
        if (this.type === "list-multi") {
          el.attr("multiple", "multiple");
        }

        if (this.options.length > 0) {
          this.options.forEach((option) => {
            const o = $(option.toHTML());
            this.values.forEach((value) => {
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
        const txt = this.values.join("\n");
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
            const val = this.values[0].toString();
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
  }

  static fromXML(xmlIn: Element) {
    const xml = $(xmlIn);
    return new Field({
      type: xml.attr("type") as FieldType,
      var: xml.attr("var"),
      label: xml.attr("label"),
      desc: xml.find("desc").text(),
      required: xml.find("required").length === 1,
      values: xml
        .find(">value")
        .toArray()
        .map((v: HTMLElement) => $(v).text()),
      options: xml.find("option").toArray().map(FieldOption.fromXML),
    });
  }

  static _htmlElementToFieldType(html: HTMLElement): FieldType {
    let type: FieldType;
    const el = $(html);

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
            const r = el.attr("readonly") === "readonly";
            if (r) {
              type = "fixed";
            } else {
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
  }

  static fromHTML(htmlIn: HTMLElement) {
    let el: JQuery<HTMLElement>;
    const html = $(htmlIn);
    const type = Field._htmlElementToFieldType(htmlIn);

    const f = new Field({
      type,
      var: html.attr("name"),
      required: html.attr("required") === "required",
    });

    switch (type) {
      case "list-multi":
      case "list-single":
        f.values = html
          .find("option:selected")
          .toArray()
          .map((el) => $(el).val()?.toString() ?? "");
        f.options = html
          .find("option")
          .toArray()
          .map((el) => FieldOption.fromHTML(el));
        break;
      case "text-multi":
      case "jid-multi":
        const txt = html.text();
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
        const value = html.val()?.toString() ?? "";
        if (value.trim() !== "") {
          f.values = [value];
        }
        break;
    }

    return f;
  }
}

type FieldOptionOptions = {
  label?: string;
  value?: FieldValue;
};

class FieldOption {
  label = "";
  value = "";

  constructor(opt?: FieldOptionOptions) {
    if (opt?.label) {
      this.label = opt.label;
    }
    if (opt?.value) {
      this.value = opt.value.toString();
    }
  }

  toXML() {
    return $build("option", { label: this.label })
      .c("value")
      .t(this.value.toString())
      .tree();
  }

  toJSON() {
    return { label: this.label, value: this.value };
  }

  toHTML() {
    return $("<option>")
      .attr("value", this.value)
      .text(this.label || this.value)[0];
  }

  static fromXML(xml: Element) {
    return new FieldOption({
      label: $(xml).attr("label"),
      value: $(xml).text(),
    });
  }

  static fromHTML(html: HTMLElement) {
    return new FieldOption({
      value: $(html).attr("value"),
      label: $(html).text(),
    });
  }
}

type ItemOptions = {
  fields?: Field[];
};

class Item {
  fields = [] as Field[];

  constructor(opts?: ItemOptions) {
    if (opts?.fields) {
      this.fields = helper.fill<Field>(opts.fields, this.fields, Field);
    }
  }

  toXML() {
    const xml = $build("item");
    this.fields.forEach((f) => xml.cnode(f.toXML()).up());
    return xml.tree();
  }

  toJSON() {
    const json = {
      fields: this.fields.map((field) => field.toJSON()),
    };
    return json;
  }

  toHTML() {
    const fieldset = $("<fieldset>");
    this.fields.forEach((f) =>
      helper.createHtmlFieldCouple(f).appendTo(fieldset)
    );
    return fieldset[0];
  }

  static fromXML(xmlIn: Element) {
    const xml = $(xmlIn);
    const fields = xml.find("field");
    return new Item({
      fields: fields.toArray().map((f) => Field.fromXML(f)),
    });
  }

  static fromHTML(html: HTMLElement) {
    return new Item({
      fields: helper.getHtmlFields(html).map(Field.fromHTML),
    });
  }
}

type StropheDataforms = {
  Form: typeof Form;
  Field: typeof Field;
  Option: typeof FieldOption;
  Item: typeof Item;
};

type ExtendedStrope = typeof Strophe & {
  x: StropheDataforms;
};

type StropheWithDisco = typeof Strophe & {
  disco?: {
    addFeature: (ns: string) => void;
    addNode: (ns: string, opts: any) => void;
  };
};

type ExtendedNamespace = typeof Strophe.NS & {
  DATA: string;
};

(Strophe as ExtendedStrope).x = {
  Form,
  Field,
  Option: FieldOption,
  Item,
};

Strophe.addConnectionPlugin("x", {
  init(conn: typeof Strophe) {
    Strophe.addNamespace("DATA", "jabber:x:data");
    (conn as StropheWithDisco).disco?.addFeature(
      (Strophe.NS as ExtendedNamespace).DATA
    );
    return (conn as StropheWithDisco).disco?.addNode(
      (Strophe.NS as ExtendedNamespace).DATA,
      {
        items: [],
      }
    );
  },

  parseFromResult(result: Element) {
    if (result.nodeName.toLowerCase() === "x") {
      return Form.fromXML(result);
    } else {
      return Form.fromXML($(result).find("x")?.[0]);
    }
  },
});

const $form = (opt: FormOptions) => new (Strophe as ExtendedStrope).x.Form(opt);
const $field = (opt: FieldOptions) =>
  new (Strophe as ExtendedStrope).x.Field(opt);
const $opt = (opt: FieldOptionOptions) =>
  new (Strophe as ExtendedStrope).x.Option(opt);
const $item = (opt: ItemOptions) => new (Strophe as ExtendedStrope).x.Item(opt);

export { $form, $field, $opt, $item, StropheDataforms };
