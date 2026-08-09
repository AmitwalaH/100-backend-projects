import KeyValueTable from "./KeyValueTable";

export default function HeadersEditor({ tab, onChange }) {
  return (
    <div className="rc-panel-section">
      <KeyValueTable rows={tab.headers} onChange={(headers) => onChange({ headers })} keyPlaceholder="Header" valuePlaceholder="Value" />
    </div>
  );
}
