export default function SettingsEditor({ tab, onChange }) {
  const settings = tab.settings || { timeoutMs: 15000, followRedirects: true };
  const timeoutId = `request-timeout-${tab.id}`;

  function updateSettings(patch) {
    onChange({ settings: { ...settings, ...patch } });
  }

  return (
    <div className="rc-panel-section rc-settings-editor">
      <div className="rc-field">
        <label className="rc-field-label" htmlFor={timeoutId}>
          Request timeout (ms)
        </label>
        <input
          id={timeoutId}
          type="number"
          className="rc-text-input rc-timeout-input"
          min={1000}
          max={60000}
          step={500}
          value={settings.timeoutMs}
          onChange={(e) =>
            updateSettings({ timeoutMs: Number(e.target.value) })
          }
        />
        <p className="rc-field-hint">
          The request is aborted if the target server hasn't responded within
          this window.
        </p>
      </div>

      <label className="rc-checkbox-row">
        <input
          type="checkbox"
          checked={settings.followRedirects}
          onChange={(e) =>
            updateSettings({ followRedirects: e.target.checked })
          }
        />
        Follow redirects
      </label>
    </div>
  );
}
