import type { ReactNode } from "react";
import "./layoutPrimitives.css";

export type GridProps = {
  children: ReactNode;
  columns?: "one" | "two" | "three" | "auto";
  gap?: "sm" | "md" | "lg";
  className?: string;
};

export function Grid({ children, columns = "auto", gap = "md", className = "" }: GridProps) {
  return <div className={`xiGrid xiGrid-${columns} xiGap-${gap} ${className}`.trim()}>{children}</div>;
}
