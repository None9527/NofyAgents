import { tr } from "../../ui/i18n.ts";
type Obj = Record<string, unknown>;
const object = (v: unknown): Obj | null => typeof v === "object" && v !== null && !Array.isArray(v) ? v as Obj : null;
export type ElicitField = { name: string; title: string; description: string; required: boolean; schema: Obj; type: string; options: Array<{ value: string; label: string }>; unsupported: string | null };
export type ElicitForm = { fields: ElicitField[]; error: string | null };
export type ElicitDraft = Record<string, string | boolean | string[]>;

function optionsFor(schema: Obj): Array<{ value: string; label: string }> {
  if (Array.isArray(schema.enum)) return schema.enum.filter((v): v is string => typeof v === "string").map((value, i) => ({ value, label: Array.isArray(schema.enumNames) && typeof schema.enumNames[i] === "string" ? schema.enumNames[i] : value }));
  const titled = schema.oneOf ?? schema.anyOf;
  return Array.isArray(titled) ? titled.flatMap((v) => { const o = object(v); return o && typeof o.const === "string" ? [{ value: o.const, label: typeof o.title === "string" ? o.title : o.const }] : []; }) : [];
}

export function readElicitForm(params: Obj): ElicitForm {
  if (params.mode === "url") return { fields: [], error: tr("这是浏览器认证请求，请在服务器提供的认证入口完成后等待内核通知。") };
  const schema = params.requestedSchema === undefined ? { type: "object", properties: {} } : object(params.requestedSchema);
  const properties = object(schema?.properties);
  if (!schema || (schema.type !== undefined && schema.type !== "object") || !properties) return { fields: [], error: tr("表单 schema 必须为 object 并包含 properties。") };
  if (["$ref", "allOf", "oneOf", "anyOf", "not", "if", "dependentRequired", "dependentSchemas"].some((key) => key in schema)) return { fields: [], error: tr("表单包含客户端不支持的组合约束。") };
  if (JSON.stringify(schema).length > 65536 || Object.keys(properties).length > 64) return { fields: [], error: tr("表单超过客户端支持的大小。") };
  const required = Array.isArray(schema.required) ? schema.required : [];
  if (required.some((v) => typeof v !== "string" || !Object.hasOwn(properties, v))) return { fields: [], error: tr("必填字段不在表单属性中。") };
  const fields = Object.entries(properties).map(([name, raw]): ElicitField => {
    const field = object(raw) ?? {};
    const type = typeof field.type === "string" ? field.type : "string";
    const options = optionsFor(type === "array" ? object(field.items) ?? {} : field);
    const unsupportedConstraint = ["$ref", "allOf", "not", "if", "pattern", "multipleOf", "exclusiveMinimum", "exclusiveMaximum"].find((key) => key in field);
    const malformedEnum = Array.isArray(field.enum) && field.enum.some((v) => typeof v !== "string");
    const malformedChoice = ("oneOf" in field || "anyOf" in field || "enum" in field) && !options.length;
    const unsupported = unsupportedConstraint ? tr("不支持约束 {0}",[unsupportedConstraint]) : !object(raw) || (field.type !== undefined && typeof field.type !== "string") ? tr("字段 schema 无效") : malformedEnum ? tr("仅支持字符串枚举") : malformedChoice ? tr("不支持该选项约束") : !["string", "number", "integer", "boolean", "array"].includes(type) ? tr("不支持字段类型 {0}",[type]) : type === "array" && !options.length ? tr("仅支持枚举数组") : null;
    return { name, title: typeof field.title === "string" ? field.title : name, description: typeof field.description === "string" ? field.description : "", required: required.includes(name), schema: field, type, options, unsupported };
  });
  return { fields, error: null };
}

export function elicitDefaults(form: ElicitForm): ElicitDraft {
  return Object.fromEntries(form.fields.map((f) => [f.name, f.type === "boolean" ? f.schema.default === true : f.type === "array" ? Array.isArray(f.schema.default) ? f.schema.default.filter((v): v is string => typeof v === "string") : [] : typeof f.schema.default === "string" || typeof f.schema.default === "number" ? String(f.schema.default) : ""]));
}

export function validateElicit(form: ElicitForm, draft: ElicitDraft): { content: Obj; errors: Record<string, string> } {
  const content: Obj = Object.create(null) as Obj;
  const errors: Record<string, string> = Object.create(null) as Record<string, string>;
  if (form.error) errors._form = form.error;
  for (const f of form.fields) {
    const v = draft[f.name];
    const s = f.schema;
    if (f.unsupported) { errors[f.name] = f.unsupported; continue; }
    if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) {
      if (f.required) errors[f.name] = tr("请填写必填字段");
      continue;
    }
    if (f.type === "boolean") { if (typeof v !== "boolean") errors[f.name] = tr("请选择是或否"); else content[f.name] = v; continue; }
    if (f.type === "array") {
      if (!Array.isArray(v) || v.some((choice) => !f.options.some((o) => o.value === choice))) errors[f.name] = tr("请选择有效选项");
      else if ((typeof s.minItems === "number" && v.length < s.minItems) || (typeof s.maxItems === "number" && v.length > s.maxItems)) errors[f.name] = tr("选择数量不符合要求");
      else content[f.name] = [...new Set(v)];
      continue;
    }
    if (typeof v !== "string") { errors[f.name] = tr("请输入有效文本"); continue; }
    if (f.options.length) { if (!f.options.some((o) => o.value === v)) errors[f.name] = tr("请选择有效选项"); else content[f.name] = v; continue; }
    if (f.type === "number" || f.type === "integer") {
      const n = Number(v);
      if (!v.trim() || !Number.isFinite(n) || (f.type === "integer" && !Number.isSafeInteger(n))) errors[f.name] = tr("请输入有效数字（整数须在安全范围内）");
      else if ((typeof s.minimum === "number" && n < s.minimum) || (typeof s.maximum === "number" && n > s.maximum)) errors[f.name] = tr("数字超出范围");
      else content[f.name] = n;
      continue;
    }
    const len = [...v].length;
    if ((typeof s.minLength === "number" && len < s.minLength) || (typeof s.maxLength === "number" && len > s.maxLength)) errors[f.name] = tr("文本长度不符合要求");
    else if (s.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[f.name] = tr("请输入有效邮箱");
    else if (s.format === "uri" && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) errors[f.name] = tr("请输入完整 URI");
    else if (s.format === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v)) errors[f.name] = tr("请输入有效日期 YYYY-MM-DD");
    else if (s.format === "date-time" && (!/^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$/.test(v) || Number.isNaN(Date.parse(v)))) errors[f.name] = tr("请输入含时区的日期时间");
    else content[f.name] = v;
  }
  return { content, errors };
}

/** McpElicitExtResponse is flat, unlike ACP's session/elicitation action wrapper. */
export function mcpElicitResponse(outcome: "accept" | "decline" | "cancel", content?: Obj): Obj {
  return outcome === "accept" ? { outcome, content: content ?? {} } : { outcome };
}
