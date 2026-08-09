import { useState } from "react";
import { HTTP_METHODS, METHOD_COLORS } from "../constants";
import { buildShareableCommand } from "../utils/shareableCommand";

export default function UrlBar({ tab, onChange, onSend, onSave, isSending }) {
  const [showCommand, setShowCommand] = useState(false);

  const command = buildShareableCommand({
    method: tab.method,
    url: tab.url,
    headers: tab.headers,
    bodyMode: tab.bodyMode,
    bodyRaw: tab.bodyRaw,
    formBody: tab.formBody,
  });

  function copyCommand() {
    navigator.clipboard?.writeText(command).catch(() => {});
  }

  return (
    <div className="rc-url-bar-wrap">
      <div className="rc-url-bar">
        <select
          className="rc-method-select"
          value={tab.method}
          onChange={(e) => onChange({ method: e.target.value })}
          style={{ color: METHOD_COLORS[tab.method] || "#374151" }}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          className="rc-url-input"
          value={tab.url}
          placeholder="https://api.example.com/resource"
          onChange={(e) => onChange({ url: e.target.value })}
          spellCheck={false}
        />

        <button type="button" className="rc-send-btn" onClick={onSend} disabled={isSending || !tab.url}>
          {isSending ? "Sending…" : "Send"}
        </button>
        <button type="button" className="rc-save-btn" onClick={onSave} title="Save request">
          Save
        </button>
      </div>

      <div className="rc-url-bar-footer">
        <button type="button" className="rc-command-toggle" onClick={() => setShowCommand((v) => !v)}>
          {showCommand ? "Hide command" : "Show as command"}
        </button>
      </div>

      {showCommand && (
        <div className="rc-command-block">
          <pre>{command}</pre>
          <button type="button" className="rc-command-copy" onClick={copyCommand}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
