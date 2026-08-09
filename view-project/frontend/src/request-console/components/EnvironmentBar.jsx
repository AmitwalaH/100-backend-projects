import { useState } from "react";
import { createId } from "../utils/id";

export default function EnvironmentBar({ environments }) {
  const {
    environments: list,
    activeEnvironmentId,
    activeVariables,
    setActiveEnvironmentId,
    createEnvironment,
    renameEnvironment,
    deleteEnvironment,
    setVariables,
  } = environments;

  const [isEditorOpen, setEditorOpen] = useState(false);
  const activeEnv = list.find((e) => e.id === activeEnvironmentId) ?? list[0];

  function updateVariable(id, field, value) {
    const next = activeVariables.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    setVariables(activeEnv.id, ensureTrailingRow(next));
  }

  function toggleVariable(id) {
    const next = activeVariables.map((v) => (v.id === id ? { ...v, enabled: v.enabled === false } : v));
    setVariables(activeEnv.id, next);
  }

  function removeVariable(id) {
    setVariables(activeEnv.id, activeVariables.filter((v) => v.id !== id));
  }

  const rows = ensureTrailingRow(activeVariables);

  return (
    <div className="rc-environment-bar">
      <select
        className="rc-environment-select"
        value={activeEnvironmentId}
        onChange={(e) => setActiveEnvironmentId(e.target.value)}
      >
        {list.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rc-environment-gear"
        onClick={() => setEditorOpen((v) => !v)}
        aria-expanded={isEditorOpen}
        aria-label="Edit environment variables"
      >
        ⚙
      </button>

      <button
        type="button"
        className="rc-environment-add"
        onClick={() => createEnvironment("New Environment")}
      >
        + Environment
      </button>

      {isEditorOpen && activeEnv.id !== "no-environment" && (
        <div className="rc-environment-popover">
          <div className="rc-environment-popover-header">
            <input
              className="rc-environment-name-input"
              value={activeEnv.name}
              onChange={(e) => renameEnvironment(activeEnv.id, e.target.value)}
            />
            <button
              type="button"
              className="rc-environment-delete"
              onClick={() => {
                deleteEnvironment(activeEnv.id);
                setEditorOpen(false);
              }}
            >
              Delete
            </button>
          </div>

          <table className="kv-table">
            <thead>
              <tr>
                <th className="kv-col-toggle" />
                <th>Variable</th>
                <th>Value</th>
                <th className="kv-col-remove" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="kv-col-toggle">
                    <input type="checkbox" checked={row.enabled !== false} onChange={() => toggleVariable(row.id)} />
                  </td>
                  <td>
                    <input className="kv-input" value={row.key} onChange={(e) => updateVariable(row.id, "key", e.target.value)} placeholder="variableName" />
                  </td>
                  <td>
                    <input className="kv-input" value={row.value} onChange={(e) => updateVariable(row.id, "value", e.target.value)} placeholder="value" />
                  </td>
                  <td className="kv-col-remove">
                    {(row.key || row.value) && (
                      <button type="button" className="kv-remove-btn" onClick={() => removeVariable(row.id)}>
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditorOpen && activeEnv.id === "no-environment" && (
        <div className="rc-environment-popover">
          <p className="rc-environment-empty-note">
            "No Environment" has no variables. Create an environment to define reusable values like a base URL or auth token.
          </p>
        </div>
      )}
    </div>
  );
}

function ensureTrailingRow(rows) {
  const last = rows[rows.length - 1];
  if (!last || last.key || last.value) {
    return [...rows, { id: createId("var"), key: "", value: "", enabled: true }];
  }
  return rows;
}
