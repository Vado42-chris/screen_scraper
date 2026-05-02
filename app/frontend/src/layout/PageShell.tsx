import type { ReactNode } from "react";
import "./layoutPrimitives.css";

export type PageShellProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageShell({ eyebrow, title, description, actions, children, className = "" }: PageShellProps) {
  const headingId = `page-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <main className={`xiPageShell ${className}`.trim()} aria-labelledby={headingId}>
      <header className="xiPageHeader">
        <div className="xiPageHeaderText">
          {eyebrow && <div className="xiPageEyebrow">{eyebrow}</div>}
          <h1 id={headingId}>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="xiPageActions">{actions}</div>}
      </header>
      {children}
    </main>
  );
}
