export default function ScriptsEditor({ tab, onChange }) {
  return (
    <div className="rc-panel-section rc-scripts-editor">
      <div className="rc-scripts-column">
        <label className="rc-field-label">
          Pre-request — set variables before this request is sent
        </label>
        <textarea
          className="rc-scripts-textarea"
          value={tab.preRequestScript}
          onChange={(e) => onChange({ preRequestScript: e.target.value })}
          placeholder={"set userId = 42\nset token = abc123"}
          spellCheck={false}
        />
      </div>

      <div className="rc-scripts-column">
        <label className="rc-field-label">
          Tests — assertions checked against the response
        </label>
        <textarea
          className="rc-scripts-textarea"
          value={tab.testScript}
          onChange={(e) => onChange({ testScript: e.target.value })}
          placeholder={"status == 200\nresponseTime < 800\nbody.token exists"}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
