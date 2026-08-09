import KeyValueTable from "./KeyValueTable";

export default function ParamsEditor({ tab, onChange }) {
  return (
    <div className="rc-panel-section">
      <KeyValueTable rows={tab.params} onChange={(params) => onChange({ params })} keyPlaceholder="Key" valuePlaceholder="Value" />
    </div>
  );
}
