import type { ReactNode } from "react";
import "./layoutPrimitives.css";

export type StackProps = {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
};

export function Stack({ children, gap = "md", className = "" }: StackProps) {
  return <div className={`xiStack xiGap-${gap} ${className}`.trim()}>{children}</div>;
}
