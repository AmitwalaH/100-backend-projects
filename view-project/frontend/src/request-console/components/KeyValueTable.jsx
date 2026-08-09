import { createId } from "../utils/id";

/**
 * Shared editable key/value/description table used by Params, Headers,
 * and the x-www-form-urlencoded body editor. Always keeps one trailing
 * blank row so typing a new key doesn't require an explicit "add row" click.
 */
export default function KeyValueTable({ rows, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value", showDescription = true }) {
  const rowsWithTrailingBlank = ensureTrailingBlank(rows);

  function updateRow(id, field, value) {
    const next = rowsWithTrailingBlank.map((row) => (row.id === id ? { ...row, [field]: value } : row));
    onChange(next);
  }

  function toggleRow(id) {
    onChange(rowsWithTrailingBlank.map((row) => (row.id === id ? { ...row, enabled: row.enabled === false } : row)));
  }

  function removeRow(id) {
    onChange(rowsWithTrailingBlank.filter((row) => row.id !== id));
  }

  return (
    <table className="kv-table">
      <thead>
        <tr>
          <th className="kv-col-toggle" />
          <th>{keyPlaceholder}</th>
          <th>{valuePlaceholder}</th>
          {showDescription && <th>Description</th>}
          <th className="kv-col-remove" />
        </tr>
      </thead>
      <tbody>
        {rowsWithTrailingBlank.map((row) => (
          <tr key={row.id} className={row.enabled === false ? "kv-row-disabled" : ""}>
            <td className="kv-col-toggle">
              <input
                type="checkbox"
                checked={row.enabled !== false}
                onChange={() => toggleRow(row.id)}
                aria-label="Enable row"
              />
            </td>
            <td>
              <input
                className="kv-input"
                value={row.key ?? ""}
                placeholder={keyPlaceholder}
                onChange={(e) => updateRow(row.id, "key", e.target.value)}
              />
            </td>
            <td>
              <input
                className="kv-input"
                value={row.value ?? ""}
                placeholder={valuePlaceholder}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
              />
            </td>
            {showDescription && (
              <td>
                <input
                  className="kv-input"
                  value={row.description ?? ""}
                  placeholder="Description"
                  onChange={(e) => updateRow(row.id, "description", e.target.value)}
                />
              </td>
            )}
            <td className="kv-col-remove">
              {!isBlank(row) && (
                <button type="button" className="kv-remove-btn" onClick={() => removeRow(row.id)} aria-label="Remove row">
                  ×
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function isBlank(row) {
  return !row.key && !row.value && !row.description;
}

function ensureTrailingBlank(rows) {
  if (rows.length === 0 || !isBlank(rows[rows.length - 1])) {
    return [...rows, { id: createId("row"), key: "", value: "", description: "", enabled: true }];
  }
  return rows;
}
