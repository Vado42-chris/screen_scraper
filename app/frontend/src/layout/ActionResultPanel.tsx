import type { ReactNode } from "react";
import type { UiOutcomeState } from "./statusTypes";

export type ActionResultPanelProps = {
  outcome: UiOutcomeState;
  title: string;
  summary: string;
  nextAction?: ReactNode;
  inspectionAction?: ReactNode;
};

export function ActionResultPanel({ outcome, title, summary, nextAction, inspectionAction }: ActionResultPanelProps) {
  return (
    <section className={`actionResultPanel actionResultPanel-${outcome}`} aria-label={`${title}: ${outcome}`}>
      <strong>{title}</strong>
      <p>{summary}</p>
      {(nextAction || inspectionAction) && (
        <div className="actionResultPanelActions">
          {nextAction}
          {inspectionAction}
        </div>
      )}
    </section>
  );
}
