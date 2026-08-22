import { AUTH_TYPES } from "../constants";

export default function AuthEditor({ tab, onChange }) {
  const auth = tab.auth || { type: "none" };

  function updateAuth(patch) {
    onChange({ auth: { ...auth, ...patch } });
  }

  const typeId = `auth-type-${tab.id}`;
  const tokenId = `auth-token-${tab.id}`;
  const usernameId = `auth-username-${tab.id}`;
  const passwordId = `auth-password-${tab.id}`;

  return (
    <div className="rc-panel-section">
      <label className="rc-field-label" htmlFor={typeId}>
        Type
      </label>
      <select
        id={typeId}
        className="rc-select"
        value={auth.type}
        onChange={(e) => updateAuth({ type: e.target.value })}
      >
        {AUTH_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {auth.type === "bearer" && (
        <div className="rc-field">
          <label className="rc-field-label" htmlFor={tokenId}>
            Token
          </label>
          <input
            id={tokenId}
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
            <label className="rc-field-label" htmlFor={usernameId}>
              Username
            </label>
            <input
              id={usernameId}
              className="rc-text-input"
              value={auth.username || ""}
              onChange={(e) => updateAuth({ username: e.target.value })}
            />
          </div>
          <div className="rc-field">
            <label className="rc-field-label" htmlFor={passwordId}>
              Password
            </label>
            <input
              id={passwordId}
              className="rc-text-input"
              type="password"
              autoComplete="new-password"
              value={auth.password || ""}
              onChange={(e) => updateAuth({ password: e.target.value })}
            />
          </div>
        </>
      )}

      {auth.type === "none" && (
        <p className="rc-empty-note">
          This request does not use authorization. Add one above if the endpoint
          requires it.
        </p>
      )}
    </div>
  );
}
