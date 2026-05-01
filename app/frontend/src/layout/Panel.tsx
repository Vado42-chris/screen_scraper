import type { ReactNode } from "react";

export type PanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  labelledBy?: string;
  className?: string;
};

export function Panel({ title, description, children, actions, labelledBy, className = "" }: PanelProps) {
  const headingId = labelledBy ?? (title ? `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined);

  return (
    <section className={`panel ${className}`.trim()} aria-labelledby={headingId}>
      {(title || description || actions) && (
        <div className="panelHeader">
          <div>
            {title && <h2 id={headingId}>{title}</h2>}
            {description && <p className="muted smallText">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
