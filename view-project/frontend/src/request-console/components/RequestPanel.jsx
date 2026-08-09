import { useState } from "react";
import { REQUEST_TABS } from "../constants";
import ParamsEditor from "./ParamsEditor";
import HeadersEditor from "./HeadersEditor";
import AuthEditor from "./AuthEditor";
import BodyEditor from "./BodyEditor";
import ScriptsEditor from "./ScriptsEditor";
import SettingsEditor from "./SettingsEditor";

const EDITORS = {
  params: ParamsEditor,
  auth: AuthEditor,
  headers: HeadersEditor,
  body: BodyEditor,
  scripts: ScriptsEditor,
  settings: SettingsEditor,
};

export default function RequestPanel({ tab, onChange }) {
  const [activeTabId, setActiveTabId] = useState("params");
  const ActiveEditor = EDITORS[activeTabId];

  const enabledCount = (rows) => (rows || []).filter((r) => r.enabled !== false && r.key).length;

  return (
    <div className="rc-request-panel">
      <div className="rc-panel-tab-strip">
        {REQUEST_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rc-panel-tab ${activeTabId === t.id ? "active" : ""}`}
            onClick={() => setActiveTabId(t.id)}
          >
            {t.label}
            {t.id === "params" && enabledCount(tab.params) > 0 && <span className="rc-panel-tab-count">{enabledCount(tab.params)}</span>}
            {t.id === "headers" && enabledCount(tab.headers) > 0 && <span className="rc-panel-tab-count">{enabledCount(tab.headers)}</span>}
          </button>
        ))}
      </div>
      <div className="rc-panel-body">
        <ActiveEditor tab={tab} onChange={onChange} />
      </div>
    </div>
  );
}
