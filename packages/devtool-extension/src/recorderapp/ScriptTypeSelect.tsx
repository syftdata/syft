import { ScriptType } from "../types";

export default function ScriptTypeSelect({
  value,
  onChange,
  shortDescription,
}: {
  value: ScriptType;
  onChange: (val: ScriptType) => void;
  shortDescription?: boolean;
}) {
  return (
    <select
      style={{
        border: "none",
        outline: "none",
      }}
      onChange={(e) => onChange(e.target.value as ScriptType)}
      value={value}
    >
      <option value={ScriptType.Playwright}>
        Playwright{!shortDescription ? " Library" : ""}
      </option>
      <option value={ScriptType.Puppeteer}>
        Puppeteer{!shortDescription ? " Library" : ""}
      </option>
      <option value={ScriptType.Cypress}>
        Cypress{!shortDescription ? " Library" : ""}
      </option>
    </select>
  );
}
