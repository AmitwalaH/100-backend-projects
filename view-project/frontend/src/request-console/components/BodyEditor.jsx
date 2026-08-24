import { BODY_MODES, METHODS_WITHOUT_BODY } from "../constants";
import KeyValueTable from "./KeyValueTable";

export default function BodyEditor({ tab, onChange }) {
  const disabled = METHODS_WITHOUT_BODY.includes(tab.method);

  if (disabled) {
    return (
      <div className="rc-panel-section">
        <p className="rc-empty-note">{tab.method} requests don't send a body.</p>
      </div>
    );
  }

  return (
    <div className="rc-panel-section">
      <div className="rc-body-mode-row">
        {BODY_MODES.map((mode) => (
          <label key={mode.id} className="rc-body-mode-option">
            <input
              type="radio"
              name={`body-mode-${tab.id}`}
              checked={tab.bodyMode === mode.id}
              onChange={() => onChange({ bodyMode: mode.id })}
            />
            {mode.label}
          </label>
        ))}
      </div>

      {(tab.bodyMode === "raw-json" || tab.bodyMode === "raw-text") && (
        <textarea
          className="rc-body-textarea"
          value={tab.bodyRaw}
          onChange={(e) => onChange({ bodyRaw: e.target.value })}
          spellCheck={false}
          placeholder={tab.bodyMode === "raw-json" ? "{\n  \n}" : "raw text body"}
        />
      )}

      {tab.bodyMode === "form-urlencoded" && (
        <KeyValueTable rows={tab.formBody} onChange={(formBody) => onChange({ formBody })} keyPlaceholder="Field" valuePlaceholder="Value" showDescription={false} />
      )}

      {tab.bodyMode === "none" && <p className="rc-empty-note">No body will be sent with this request.</p>}
    </div>
  );
}
