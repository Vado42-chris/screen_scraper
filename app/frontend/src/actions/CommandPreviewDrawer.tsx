import "./actionComponents.css";

export type CommandPreviewDrawerProps = {
  operationId: string;
  command: string | null;
  workingDirectory?: string | null;
  targetEnvironment?: string | null;
  writesTo?: string[];
  readsFrom?: string[];
  requiresSecrets?: boolean;
  confirmationRequired?: boolean;
};

export function CommandPreviewDrawer({
  operationId,
  command,
  workingDirectory,
  targetEnvironment,
  writesTo = [],
  readsFrom = [],
  requiresSecrets = false,
  confirmationRequired = false,
}: CommandPreviewDrawerProps) {
  const unavailable = !command;

  return (
    <section className="xiCommandPreview" aria-label={`Command preview for ${operationId}`} data-operation-id={operationId}>
      <header>
        <strong>Command preview</strong>
        <span>{unavailable ? "not-configured" : confirmationRequired ? "needs-confirmation" : "ready"}</span>
      </header>
      {unavailable ? (
        <p>Command text is unavailable. This operation must be treated as not configured.</p>
      ) : (
        <pre><code>{command}</code></pre>
      )}
      <dl>
        {workingDirectory && <div><dt>Working directory</dt><dd>{workingDirectory}</dd></div>}
        {targetEnvironment && <div><dt>Target</dt><dd>{targetEnvironment}</dd></div>}
        <div><dt>Requires secrets</dt><dd>{requiresSecrets ? "yes" : "no"}</dd></div>
        <div><dt>Confirmation</dt><dd>{confirmationRequired ? "required" : "not required"}</dd></div>
        {readsFrom.length > 0 && <div><dt>Reads from</dt><dd>{readsFrom.join(", ")}</dd></div>}
        {writesTo.length > 0 && <div><dt>Writes to</dt><dd>{writesTo.join(", ")}</dd></div>}
      </dl>
    </section>
  );
}
