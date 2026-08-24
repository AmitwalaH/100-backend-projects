import { useMemo, useState } from "react";
import { HTTP_METHODS, METHOD_COLORS } from "../constants";
import { buildShareableCommand } from "../utils/shareableCommand";

export default function UrlBar({ tab, onChange, onSend, onSave, isSending }) {
  const [showCommand, setShowCommand] = useState(false);
  // idle | copied | failed — copyCommand() previously swallowed both
  // success and failure silently, so clicking "Copy" gave zero feedback.
  const [copyState, setCopyState] = useState("idle");

  // Was rebuilt on every keystroke in the URL bar even while the command
  // block is collapsed and nothing is shown — only needs to change when
  // the request itself changes.
  const command = useMemo(
    () =>
      buildShareableCommand({
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        bodyMode: tab.bodyMode,
        bodyRaw: tab.bodyRaw,
        formBody: tab.formBody,
      }),
    [tab.method, tab.url, tab.headers, tab.bodyMode, tab.bodyRaw, tab.formBody],
  );

  function copyCommand() {
    if (!navigator.clipboard) {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 1500);
      return;
    }
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 1500);
      })
      .catch(() => {
        setCopyState("failed");
        setTimeout(() => setCopyState("idle"), 1500);
      });
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

        <button
          type="button"
          className="rc-send-btn"
          onClick={onSend}
          disabled={isSending || !tab.url}
        >
          {isSending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          className="rc-save-btn"
          onClick={onSave}
          title="Save request"
        >
          Save
        </button>
      </div>

      <div className="rc-url-bar-footer">
        <button
          type="button"
          className="rc-command-toggle"
          onClick={() => setShowCommand((v) => !v)}
        >
          {showCommand ? "Hide command" : "Show as command"}
        </button>
      </div>

      {showCommand && (
        <div className="rc-command-block">
          <pre>{command}</pre>
          <button
            type="button"
            className={
              "rc-command-copy" +
              (copyState === "copied" ? " copied" : "") +
              (copyState === "failed" ? " failed" : "")
            }
            onClick={copyCommand}
          >
            {copyState === "copied"
              ? "Copied!"
              : copyState === "failed"
                ? "Copy failed"
                : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
