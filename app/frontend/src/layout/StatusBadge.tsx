import type { UiStatusState } from "./statusTypes";

export type StatusBadgeProps = {
  state: UiStatusState;
  label: string;
  description?: string;
  source?: string;
  timestamp?: string;
};

export function StatusBadge({ state, label, description, source, timestamp }: StatusBadgeProps) {
  const detail = [description, source ? `Source: ${source}` : null, timestamp ? `Checked: ${timestamp}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <span className={`statusBadge statusBadge-${state}`} title={detail || label} aria-label={`${label}: ${state}`}>
      <span aria-hidden="true" className="statusBadgeDot" />
      <span>{label}</span>
    </span>
  );
}
