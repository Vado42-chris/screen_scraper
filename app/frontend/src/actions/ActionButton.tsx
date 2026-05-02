import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { UiOutcomeState, UiRiskLevel } from "../layout";
import "./actionComponents.css";

export type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: ReactNode;
  outcome?: UiOutcomeState;
  riskLevel?: UiRiskLevel;
};

export function ActionButton({ label, icon, outcome = "unknown", riskLevel = "low", className = "", type = "button", ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`xiActionButton xiActionButton-${outcome} xiRisk-${riskLevel} ${className}`.trim()}
      aria-label={props["aria-label"] ?? label}
      data-outcome={outcome}
      data-risk-level={riskLevel}
    >
      {icon && <span className="xiActionButtonIcon" aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
