interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "primary" | "dark";
  external?: boolean;
}

export default function Button({
  href,
  variant = "primary",
  external = false,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <a
      href={href}
      className={`${variant === "primary" ? "btn" : "btn-dark"} ${className}`.trim()}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
