"use client";

import { useState } from "react";
import {
  replaceClass, getCurrentInCategory,
  FONT_SIZES, FONT_WEIGHTS, TEXT_ALIGNS,
  BORDER_RADIUS, BORDER_WIDTHS,
  DISPLAYS, FLEX_DIRECTIONS, JUSTIFY_CONTENTS, ALIGN_ITEMS,
  WIDTHS, HEIGHTS, SPACING_VALUES,
} from "@/lib/editor/tailwind-classes";
import ColorPicker from "./ColorPicker";
import { cn } from "@/lib/utils";

interface ClassEditorProps {
  classes: string[];
  onChange: (classes: string[]) => void;
}

function ButtonGroup({
  options, current, onSelect,
}: { options: string[]; current: string; onSelect: (val: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "px-2 py-0.5 text-xs rounded border transition-colors",
            current === opt
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
          )}
        >
          {opt.split("-").slice(-1)[0]}
        </button>
      ))}
    </div>
  );
}

function SpacingDropdown({
  prefix, label, classes, onChange,
}: { prefix: string; label: string; classes: string[]; onChange: (c: string[]) => void }) {
  const categoryByPrefix: Record<string, string> = {
    "p-": "padding-all",
    "px-": "padding-x",
    "py-": "padding-y",
    "pt-": "padding-top",
    "pr-": "padding-right",
    "pb-": "padding-bottom",
    "pl-": "padding-left",
    "m-": "margin-all",
    "mx-": "margin-x",
    "my-": "margin-y",
    "mt-": "margin-top",
    "mr-": "margin-right",
    "mb-": "margin-bottom",
    "ml-": "margin-left",
    "gap-": "gap-all",
    "gap-x-": "gap-x",
    "gap-y-": "gap-y",
  };
  const current = getCurrentInCategory(classes, categoryByPrefix[prefix] ?? "");
  const currentVal = current.replace(prefix, "") || "";

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 w-6 shrink-0">{label}</label>
      <select
        value={currentVal}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            onChange(classes.filter((c) => !c.startsWith(prefix)));
          } else {
            onChange(replaceClass(classes, `${prefix}${val}`));
          }
        }}
        className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
      >
        <option value="">—</option>
        {prefix.includes("m") && <option value="auto">auto</option>}
        {SPACING_VALUES.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}

export default function ClassEditor({ classes, onChange }: ClassEditorProps) {
  const [mode, setMode] = useState<"raw" | "visual">("visual");
  const [rawValue, setRawValue] = useState(classes.join(" "));

  function handleRawBlur() {
    const newClasses = rawValue.split(/\s+/).filter(Boolean);
    onChange(newClasses);
  }

  function apply(cls: string) {
    onChange(replaceClass(classes, cls));
  }

  const display = getCurrentInCategory(classes, "display");
  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid" || display === "inline-grid";

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 rounded p-0.5">
          <button
            onClick={() => { setMode("raw"); setRawValue(classes.join(" ")); }}
            className={cn("px-2 py-0.5 text-xs rounded", mode === "raw" ? "bg-white shadow text-gray-800" : "text-gray-500")}
          >Raw</button>
          <button
            onClick={() => setMode("visual")}
            className={cn("px-2 py-0.5 text-xs rounded", mode === "visual" ? "bg-white shadow text-gray-800" : "text-gray-500")}
          >Visual</button>
        </div>
        <span className="text-xs text-gray-400">{classes.length} classes</span>
      </div>

      {mode === "raw" ? (
        <textarea
          value={rawValue}
          onChange={(e) => setRawValue(e.target.value)}
          onBlur={handleRawBlur}
          placeholder="Enter Tailwind classes separated by spaces"
          rows={3}
          className="w-full font-mono text-xs border border-gray-300 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <div className="space-y-4">

          {/* TYPOGRAPHY */}
          <Section title="Typography">
            <div className="space-y-2">
              <Row label="Size">
                <select
                  value={getCurrentInCategory(classes, "text-size")}
                  onChange={(e) => apply(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="">—</option>
                  {FONT_SIZES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Row>
              <Row label="Weight">
                <select
                  value={getCurrentInCategory(classes, "text-weight")}
                  onChange={(e) => apply(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="">—</option>
                  {FONT_WEIGHTS.map((c) => <option key={c} value={c}>{c.replace("font-", "")}</option>)}
                </select>
              </Row>
              <Row label="Align">
                <ButtonGroup
                  options={TEXT_ALIGNS}
                  current={getCurrentInCategory(classes, "text-align")}
                  onSelect={apply}
                />
              </Row>
            </div>
          </Section>

          {/* COLORS */}
          <Section title="Colors">
            <div className="space-y-3">
              <ColorPicker colorType="text" currentClasses={classes} onColorSelect={apply} />
              <ColorPicker colorType="bg" currentClasses={classes} onColorSelect={apply} />
              <ColorPicker colorType="border" currentClasses={classes} onColorSelect={apply} />
            </div>
          </Section>

          {/* SPACING */}
          <Section title="Spacing">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Padding</p>
              <div className="grid grid-cols-2 gap-1">
                <SpacingDropdown prefix="p-" label="p" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="px-" label="px" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="py-" label="py" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="pt-" label="pt" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="pr-" label="pr" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="pb-" label="pb" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="pl-" label="pl" classes={classes} onChange={onChange} />
              </div>
              <p className="text-xs font-medium text-gray-500 mt-1">Margin</p>
              <div className="grid grid-cols-2 gap-1">
                <SpacingDropdown prefix="m-" label="m" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="mx-" label="mx" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="my-" label="my" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="mt-" label="mt" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="mr-" label="mr" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="mb-" label="mb" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="ml-" label="ml" classes={classes} onChange={onChange} />
              </div>
              <p className="text-xs font-medium text-gray-500 mt-1">Gap</p>
              <div className="grid grid-cols-2 gap-1">
                <SpacingDropdown prefix="gap-" label="gap" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="gap-x-" label="gx" classes={classes} onChange={onChange} />
                <SpacingDropdown prefix="gap-y-" label="gy" classes={classes} onChange={onChange} />
              </div>
            </div>
          </Section>

          {/* BORDER */}
          <Section title="Border">
            <div className="space-y-2">
              <Row label="Width">
                <ButtonGroup
                  options={BORDER_WIDTHS}
                  current={getCurrentInCategory(classes, "border-width")}
                  onSelect={apply}
                />
              </Row>
              <Row label="Radius">
                <ButtonGroup
                  options={BORDER_RADIUS}
                  current={getCurrentInCategory(classes, "border-radius")}
                  onSelect={apply}
                />
              </Row>
            </div>
          </Section>

          {/* LAYOUT */}
          <Section title="Layout">
            <div className="space-y-2">
              <Row label="Display">
                <ButtonGroup
                  options={DISPLAYS}
                  current={getCurrentInCategory(classes, "display")}
                  onSelect={apply}
                />
              </Row>
              {isFlex && (
                <>
                  <Row label="Direction">
                    <ButtonGroup
                      options={FLEX_DIRECTIONS}
                      current={getCurrentInCategory(classes, "flex-direction")}
                      onSelect={apply}
                    />
                  </Row>
                </>
              )}
              {(isFlex || isGrid) && (
                <>
                  <Row label="Justify">
                    <ButtonGroup
                      options={JUSTIFY_CONTENTS}
                      current={getCurrentInCategory(classes, "justify-content")}
                      onSelect={apply}
                    />
                  </Row>
                  <Row label="Align">
                    <ButtonGroup
                      options={ALIGN_ITEMS}
                      current={getCurrentInCategory(classes, "align-items")}
                      onSelect={apply}
                    />
                  </Row>
                </>
              )}
              <Row label="Width">
                <select
                  value={getCurrentInCategory(classes, "width")}
                  onChange={(e) => apply(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="">—</option>
                  {WIDTHS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Row>
              <Row label="Height">
                <select
                  value={getCurrentInCategory(classes, "height")}
                  onChange={(e) => apply(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="">—</option>
                  {HEIGHTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Row>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <label className="text-xs text-gray-500 w-14 shrink-0 pt-0.5">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}
