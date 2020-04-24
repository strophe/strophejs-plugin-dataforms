declare type FormType = "form" | "submit" | "cancel" | "result";
declare type FormOptions = {
    type?: FormType;
    title?: string;
    instructions?: string;
    fields?: Field[];
    items?: Item[];
};
declare class Form {
    type: FormType;
    title: string | undefined;
    instructions: string | undefined;
    fields: Field[];
    items: Item[];
    reported: string[];
    constructor(opt?: FormOptions);
    updateReported(): void;
    toXML(): Element;
    toJSON(): {
        type: FormType;
        title: string | undefined;
        instructions: string | undefined;
        fields: {
            type: FieldType;
            var: string;
            required: boolean;
            desc: string | undefined;
            label: string | undefined;
            values: string[];
            options: {
                label: string;
                value: string;
            }[];
        }[];
        items: {
            fields: {
                type: FieldType;
                var: string;
                required: boolean;
                desc: string | undefined;
                label: string | undefined;
                values: string[];
                options: {
                    label: string;
                    value: string;
                }[];
            }[];
        }[];
        reported: string[];
    };
    toHTML(): HTMLElement;
    static fromXML(xmlIn: Element): Form;
    static fromHTML(htmlIn: HTMLElement): Form;
}
declare type FieldType = "boolean" | "fixed" | "hidden" | "jid-multi" | "jid-single" | "list-multi" | "list-single" | "text-multi" | "text-private" | "text-single";
declare type FieldValue = string | number;
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
declare class Field {
    type: FieldType;
    desc: string | undefined;
    label: string | undefined;
    var: string;
    required: boolean;
    options: FieldOption[];
    values: string[];
    constructor(opt: FieldOptions);
    addValue(val: FieldValue): this;
    addValues(vals: FieldValue[]): this;
    addOption(opt: FieldOption): this;
    addOptions(opts: FieldOption[]): this;
    toJSON(): {
        type: FieldType;
        var: string;
        required: boolean;
        desc: string | undefined;
        label: string | undefined;
        values: string[];
        options: {
            label: string;
            value: string;
        }[];
    };
    toXML(): Element;
    toHTML(): HTMLElement;
    static fromXML(xmlIn: Element): Field;
    static _htmlElementToFieldType(html: HTMLElement): FieldType;
    static fromHTML(htmlIn: HTMLElement): Field;
}
declare type FieldOptionOptions = {
    label?: string;
    value?: FieldValue;
};
declare class FieldOption {
    label: string;
    value: string;
    constructor(opt?: FieldOptionOptions);
    toXML(): Element;
    toJSON(): {
        label: string;
        value: string;
    };
    toHTML(): HTMLElement;
    static fromXML(xml: Element): FieldOption;
    static fromHTML(html: HTMLElement): FieldOption;
}
declare type ItemOptions = {
    fields?: Field[];
};
declare class Item {
    fields: Field[];
    constructor(opts?: ItemOptions);
    toXML(): Element;
    toJSON(): {
        fields: {
            type: FieldType;
            var: string;
            required: boolean;
            desc: string | undefined;
            label: string | undefined;
            values: string[];
            options: {
                label: string;
                value: string;
            }[];
        }[];
    };
    toHTML(): HTMLElement;
    static fromXML(xmlIn: Element): Item;
    static fromHTML(html: HTMLElement): Item;
}
declare type StropheDataforms = {
    Form: typeof Form;
    Field: typeof Field;
    Option: typeof FieldOption;
    Item: typeof Item;
};
declare const $form: (opt: FormOptions) => Form;
declare const $field: (opt: FieldOptions) => Field;
declare const $opt: (opt: FieldOptionOptions) => FieldOption;
declare const $item: (opt: ItemOptions) => Item;
export { $form, $field, $opt, $item, StropheDataforms };
