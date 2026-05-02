import type { ReactNode } from "react";
import type { UiOutcomeState, UiRiskLevel } from "../layout";
import { StatusBadge } from "../layout";
import "./actionComponents.css";

export type ActionCardProps = {
  operationId: string;
  label: string;
  purpose: string;
  riskLevel: UiRiskLevel;
  outcome: UiOutcomeState;
  target?: string;
  expectedResult?: string;
  rollbackPath?: string;
  actions?: ReactNode;
  className?: string;
};

export function ActionCard({
  operationId,
  label,
  purpose,
  riskLevel,
  outcome,
  target,
  expectedResult,
  rollbackPath,
  actions,
  className = "",
}: ActionCardProps) {
  return (
    <section
      className={`xiActionCard xiRisk-${riskLevel} xiActionCard-${outcome} ${className}`.trim()}
      aria-labelledby={`${operationId}-label`}
      data-operation-id={operationId}
      data-risk-level={riskLevel}
      data-outcome={outcome}
    >
      <header className="xiActionCardHeader">
        <div>
          <h3 id={`${operationId}-label`}>{label}</h3>
          <p>{purpose}</p>
        </div>
        <StatusBadge state={outcome === "needs-confirmation" ? "risky" : outcome === "not-configured" ? "missing" : outcome} label={outcome} />
      </header>
      <dl className="xiActionCardMeta">
        <div><dt>Risk</dt><dd>{riskLevel}</dd></div>
        {target && <div><dt>Target</dt><dd>{target}</dd></div>}
        {expectedResult && <div><dt>Expected</dt><dd>{expectedResult}</dd></div>}
        {rollbackPath && <div><dt>Rollback</dt><dd>{rollbackPath}</dd></div>}
      </dl>
      {actions && <div className="xiActionCardActions">{actions}</div>}
    </section>
  );
}
