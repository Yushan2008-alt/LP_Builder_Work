"use client";

interface AttrDef {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox" | "select";
  options?: string[];
}

const TAG_ATTRS: Record<string, AttrDef[]> = {
  a: [
    { name: "href", label: "href", type: "text" },
    { name: "target", label: "target", type: "select", options: ["", "_blank", "_self", "_parent", "_top"] },
    { name: "rel", label: "rel", type: "text" },
  ],
  img: [
    { name: "src", label: "src", type: "text" },
    { name: "alt", label: "alt", type: "text" },
    { name: "width", label: "width", type: "number" },
    { name: "height", label: "height", type: "number" },
    { name: "loading", label: "loading", type: "select", options: ["", "lazy", "eager"] },
  ],
  button: [
    { name: "type", label: "type", type: "select", options: ["button", "submit", "reset"] },
    { name: "disabled", label: "disabled", type: "checkbox" },
  ],
  input: [
    { name: "type", label: "type", type: "select", options: ["text", "email", "password", "number", "checkbox", "radio", "file", "date", "tel", "url"] },
    { name: "placeholder", label: "placeholder", type: "text" },
    { name: "name", label: "name", type: "text" },
    { name: "value", label: "value", type: "text" },
    { name: "required", label: "required", type: "checkbox" },
  ],
  video: [
    { name: "src", label: "src", type: "text" },
    { name: "poster", label: "poster", type: "text" },
    { name: "controls", label: "controls", type: "checkbox" },
    { name: "autoplay", label: "autoplay", type: "checkbox" },
    { name: "loop", label: "loop", type: "checkbox" },
    { name: "muted", label: "muted", type: "checkbox" },
  ],
  iframe: [
    { name: "src", label: "src", type: "text" },
    { name: "width", label: "width", type: "number" },
    { name: "height", label: "height", type: "number" },
    { name: "title", label: "title", type: "text" },
  ],
};

const GLOBAL_ATTRS: AttrDef[] = [
  { name: "id", label: "id", type: "text" },
  { name: "title", label: "title", type: "text" },
  { name: "aria-label", label: "aria-label", type: "text" },
];

interface AttributeEditorProps {
  selectedTag: string;
  selectedAttrs: Record<string, string>;
  onAttrChange: (name: string, value: string) => void;
  onAttrRemove: (name: string) => void;
}

export default function AttributeEditor({
  selectedTag,
  selectedAttrs,
  onAttrChange,
  onAttrRemove,
}: AttributeEditorProps) {
  const tagAttrs = TAG_ATTRS[selectedTag] ?? [];
  const allAttrs = [...GLOBAL_ATTRS, ...tagAttrs];

  function handleCustomAttr() {
    const name = window.prompt("Attribute name:");
    if (name && name.trim()) {
      onAttrChange(name.trim(), "");
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-700">Attributes</h3>
      {allAttrs.map((attr) => (
        <div key={attr.name} className="flex gap-1.5 items-center">
          <label className="text-xs text-gray-500 w-20 shrink-0">{attr.label}</label>
          <div className="flex-1">
            {attr.type === "text" && (
              <input
                type="text"
                value={selectedAttrs[attr.name] ?? ""}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            {attr.type === "number" && (
              <input
                type="number"
                value={selectedAttrs[attr.name] ?? ""}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            {attr.type === "select" && (
              <select
                value={selectedAttrs[attr.name] ?? ""}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {attr.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt || "—"}</option>
                ))}
              </select>
            )}
            {attr.type === "checkbox" && (
              <input
                type="checkbox"
                checked={attr.name in selectedAttrs}
                onChange={(e) => {
                  if (e.target.checked) onAttrChange(attr.name, "");
                  else onAttrRemove(attr.name);
                }}
                className="w-4 h-4"
              />
            )}
          </div>
          {attr.name in selectedAttrs && attr.type !== "checkbox" && (
            <button
              onClick={() => onAttrRemove(attr.name)}
              className="text-red-400 hover:text-red-600 text-xs px-1"
              title="Remove attribute"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Custom attrs from element */}
      {Object.keys(selectedAttrs)
        .filter((k) => !allAttrs.find((a) => a.name === k) && k !== "class" && k !== "style")
        .map((k) => (
          <div key={k} className="flex gap-1.5 items-center">
            <label className="text-xs text-gray-400 w-20 shrink-0 italic">{k}</label>
            <input
              type="text"
              value={selectedAttrs[k]}
              onChange={(e) => onAttrChange(k, e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs"
            />
            <button
              onClick={() => onAttrRemove(k)}
              className="text-red-400 hover:text-red-600 text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}

      <button
        onClick={handleCustomAttr}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Custom Attribute
      </button>
    </div>
  );
}
