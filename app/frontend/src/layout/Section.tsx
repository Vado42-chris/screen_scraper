import type { ReactNode } from "react";
import "./layoutPrimitives.css";

export type SectionProps = {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({ title, description, actions, children, className = "" }: SectionProps) {
  const headingId = title ? `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;

  return (
    <section className={`xiSection ${className}`.trim()} aria-labelledby={headingId}>
      {(title || description || actions) && (
        <header className="xiSectionHeader">
          <div>
            {title && <h2 id={headingId}>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="xiSectionActions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
