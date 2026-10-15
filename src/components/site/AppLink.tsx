import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<"a">, "href"> & {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
};

/** Link wrapper that accepts plain string paths built from data files. */
export function AppLink({ to, children, ...rest }: Props) {
  const L = Link as unknown as React.ComponentType<Record<string, unknown>>;
  return (
    <L to={to} {...rest}>
      {children}
    </L>
  );
}
