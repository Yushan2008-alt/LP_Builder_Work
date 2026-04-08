"use client";

import { TAILWIND_COLOR_FAMILIES, TAILWIND_SHADES, getTailwindHex } from "@/lib/editor/tailwind-classes";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  colorType: "text" | "bg" | "border";
  currentClasses: string[];
  onColorSelect: (cls: string) => void;
}

const SPECIAL_COLORS = ["white", "black", "transparent"];
const SPECIAL_HEX: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

export default function ColorPicker({ colorType, currentClasses, onColorSelect }: ColorPickerProps) {
  const prefix = colorType;

  function isSelected(cls: string) {
    return currentClasses.includes(cls);
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 capitalize">
        {colorType === "text" ? "Text Color" : colorType === "bg" ? "Background Color" : "Border Color"}
      </p>

      {/* Special colors row */}
      <div className="flex gap-1 mb-1">
        {SPECIAL_COLORS.map((color) => {
          const cls = `${prefix}-${color}`;
          const hex = SPECIAL_HEX[color];
          return (
            <button
              key={cls}
              onClick={() => onColorSelect(cls)}
              title={cls}
              className={cn(
                "w-5 h-5 rounded border-2 flex-shrink-0",
                isSelected(cls) ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-500"
              )}
              style={{
                backgroundColor: hex,
                backgroundImage: hex === "transparent"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)"
                  : undefined,
                backgroundSize: hex === "transparent" ? "6px 6px" : undefined,
                backgroundPosition: hex === "transparent" ? "0 0, 3px 3px" : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Color families grid */}
      <div className="space-y-0.5">
        {TAILWIND_COLOR_FAMILIES.map((family) => (
          <div key={family} className="flex gap-0.5 items-center">
            <span className="text-[9px] text-gray-400 w-10 shrink-0">{family}</span>
            <div className="flex gap-0.5">
              {TAILWIND_SHADES.map((shade) => {
                const cls = `${prefix}-${family}-${shade}`;
                const hex = getTailwindHex(family, shade);
                return (
                  <button
                    key={cls}
                    onClick={() => onColorSelect(cls)}
                    title={cls}
                    className={cn(
                      "w-4 h-4 rounded-sm flex-shrink-0 transition-transform",
                      isSelected(cls) ? "ring-2 ring-blue-500 ring-offset-1 scale-110" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
