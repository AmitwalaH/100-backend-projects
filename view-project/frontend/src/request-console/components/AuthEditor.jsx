import { AUTH_TYPES } from "../constants";

export default function AuthEditor({ tab, onChange }) {
  const auth = tab.auth || { type: "none" };

  function updateAuth(patch) {
    onChange({ auth: { ...auth, ...patch } });
  }

  return (
    <div className="rc-panel-section rc-auth-editor">
      <label className="rc-field-label">Type</label>
      <select className="rc-select" value={auth.type} onChange={(e) => updateAuth({ type: e.target.value })}>
        {AUTH_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {auth.type === "bearer" && (
        <div className="rc-field">
          <label className="rc-field-label">Token</label>
          <input
            className="rc-text-input"
            value={auth.token || ""}
            onChange={(e) => updateAuth({ token: e.target.value })}
            placeholder="{{token}} or a literal value"
          />
        </div>
      )}

      {auth.type === "basic" && (
        <>
          <div className="rc-field">
            <label className="rc-field-label">Username</label>
            <input className="rc-text-input" value={auth.username || ""} onChange={(e) => updateAuth({ username: e.target.value })} />
          </div>
          <div className="rc-field">
            <label className="rc-field-label">Password</label>
            <input
              className="rc-text-input"
              type="password"
              value={auth.password || ""}
              onChange={(e) => updateAuth({ password: e.target.value })}
            />
          </div>
        </>
      )}

      {auth.type === "none" && (
        <p className="rc-empty-note">This request does not use authorization. Add one above if the endpoint requires it.</p>
      )}
    </div>
  );
}
