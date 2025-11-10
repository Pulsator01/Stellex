import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  help?: string;
  options?: { label: string; value: string }[];
};

export default function Select({ label, help, id, className, children, options, ...rest }: Props) {
  const selectId = id || rest.name || `select-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="grid gap-1.5">
      {label ? <label htmlFor={selectId} className="label">{label}</label> : null}
      <select id={selectId} className={`select ${className || ""}`} {...rest}>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      {help ? <p className="text-xs text-gray-500">{help}</p> : null}
    </div>
  );
}


