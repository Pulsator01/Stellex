import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  }
>;

export default function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const classes = [
    "btn",
    variant === "primary" ? "btn-primary" : "btn-secondary",
    className || ""
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}


