import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  help?: string;
};

export default function Input({ label, help, id, className, ...rest }: Props) {
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="grid gap-1.5">
      {label ? <label htmlFor={inputId} className="label">{label}</label> : null}
      <input id={inputId} className={`input ${className || ""}`} {...rest} />
      {help ? <p className="text-xs text-gray-500">{help}</p> : null}
    </div>
  );
}


