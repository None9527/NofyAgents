import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
export function Field({ label, hint, children, className = "" }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return <label className={"ui-field " + className}><span className="ui-field__label">{label}</span>{children}{hint ? <span className="ui-field__hint">{hint}</span> : null}</label>;
}
export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"ui-input " + className} />;
}
export function SelectControl({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={"ui-input " + className}>{children}</select>;
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={"ui-input " + className} />;
}
