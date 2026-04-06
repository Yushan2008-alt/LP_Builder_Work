"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useBrandContext } from "@/contexts/BrandContext";
import {
  FONT_PRESETS, COLOR_PALETTES, BUTTON_STYLES, DESIGN_VIBES,
  COLOR_PALETTE_MAP, DEFAULT_BRAND_VALUES
} from "@/lib/config/brand-presets";
import { cn } from "@/lib/utils";
import type { Brand, UpdateBrandInput } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
}

export function BrandGuidelinesModal({ isOpen, onClose, brand }: Props) {
  const { updateBrand } = useBrandContext();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [fontStyle, setFontStyle] = useState(brand.font_style);
  const [fontCustom, setFontCustom] = useState(brand.font_custom ?? "");
  const [colorPalette, setColorPalette] = useState(brand.color_palette);
  const [colorPrimary, setColorPrimary] = useState(brand.color_primary);
  const [colorAccent, setColorAccent] = useState(brand.color_accent);
  const [colorNeutral, setColorNeutral] = useState(brand.color_neutral);
  const [buttonStyle, setButtonStyle] = useState(brand.button_style);
  const [designVibe, setDesignVibe] = useState(brand.design_vibe);
  const [vibeCustom, setVibeCustom] = useState(brand.vibe_custom ?? "");

  useEffect(() => {
    setFontStyle(brand.font_style);
    setFontCustom(brand.font_custom ?? "");
    setColorPalette(brand.color_palette);
    setColorPrimary(brand.color_primary);
    setColorAccent(brand.color_accent);
    setColorNeutral(brand.color_neutral);
    setButtonStyle(brand.button_style);
    setDesignVibe(brand.design_vibe);
    setVibeCustom(brand.vibe_custom ?? "");
  }, [brand]);

  const handlePaletteSelect = (paletteId: string) => {
    setColorPalette(paletteId);
    if (paletteId !== "custom") {
      const palette = COLOR_PALETTE_MAP[paletteId];
      if (palette) {
        setColorPrimary(palette.primary);
        setColorAccent(palette.accent);
        setColorNeutral(palette.neutral);
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const input: UpdateBrandInput = {
        font_style: fontStyle,
        font_custom: fontStyle === "custom" ? fontCustom : null,
        color_palette: colorPalette,
        color_primary: colorPrimary,
        color_accent: colorAccent,
        color_neutral: colorNeutral,
        button_style: buttonStyle,
        design_vibe: designVibe,
        vibe_custom: designVibe === "custom" ? vibeCustom : null,
      };
      await updateBrand(brand.id, input);
      showToast("Brand guidelines disimpan!", "success");
      onClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaults = async () => {
    setIsLoading(true);
    try {
      await updateBrand(brand.id, DEFAULT_BRAND_VALUES);
      showToast("Default brand guidelines diterapkan!", "success");
      onClose();
    } catch {
      showToast("Gagal menerapkan default", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Brand Guidelines — ${brand.name}`} size="lg">
      <div className="space-y-6">
        {/* Font Style */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Font Style</h3>
          <div className="grid grid-cols-2 gap-2">
            {FONT_PRESETS.map((preset) => (
              <button key={preset.id} onClick={() => setFontStyle(preset.id)}
                className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-all", fontStyle === preset.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700")}>
                <p className="font-medium">{preset.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{preset.bestFor}</p>
              </button>
            ))}
            <button onClick={() => setFontStyle("custom")}
              className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-all", fontStyle === "custom"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-700")}>
              <p className="font-medium">Custom</p>
              <p className="text-xs text-gray-400 mt-0.5">Google Fonts name</p>
            </button>
          </div>
          {fontStyle === "custom" && (
            <input value={fontCustom} onChange={(e) => setFontCustom(e.target.value)}
              placeholder="e.g. Roboto, Outfit, Space Grotesk"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
        </div>

        {/* Color Palette */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Color Palette</h3>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PALETTES.map((palette) => (
              <button key={palette.id} onClick={() => handlePaletteSelect(palette.id)}
                className={cn("flex flex-col items-center gap-1.5 p-2 rounded-lg border text-xs transition-all", colorPalette === palette.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300")}>
                <div className="flex gap-0.5">
                  <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: palette.primary }} />
                  <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: palette.accent }} />
                  <div className="w-5 h-5 rounded-sm border border-gray-200" style={{ backgroundColor: palette.neutral }} />
                </div>
                <span className="text-gray-700 font-medium leading-tight text-center">{palette.label}</span>
              </button>
            ))}
          </div>
          {/* Custom hex */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Primary", value: colorPrimary, setter: setColorPrimary },
              { label: "Accent", value: colorAccent, setter: setColorAccent },
              { label: "Neutral", value: colorNeutral, setter: setColorNeutral },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center gap-2">
                <input type="color" value={value} onChange={(e) => { setter(e.target.value); setColorPalette("custom"); }}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <div>
                  <p className="text-xs font-medium text-gray-600">{label}</p>
                  <p className="text-xs text-gray-400">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Style */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Button Style</h3>
          <div className="flex gap-2 flex-wrap">
            {BUTTON_STYLES.map((bs) => (
              <button key={bs.id} onClick={() => setButtonStyle(bs.id)}
                className={cn("px-4 py-2 text-sm border transition-all", bs.tailwindClass,
                  buttonStyle === bs.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                {bs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Design Vibe */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Design Vibe</h3>
          <div className="grid grid-cols-3 gap-2">
            {DESIGN_VIBES.map((vibe) => (
              <button key={vibe.id} onClick={() => setDesignVibe(vibe.id)}
                className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-all", designVibe === vibe.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700")}>
                <p className="font-medium">{vibe.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{vibe.description}</p>
              </button>
            ))}
            <button onClick={() => setDesignVibe("custom")}
              className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-all", designVibe === "custom"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-700")}>
              <p className="font-medium">Custom</p>
              <p className="text-xs text-gray-400 mt-0.5">Describe your vibe</p>
            </button>
          </div>
          {designVibe === "custom" && (
            <textarea value={vibeCustom} onChange={(e) => setVibeCustom(e.target.value)}
              placeholder="e.g. Futuristic and techy with bold neon accents..."
              rows={2}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleUseDefaults} disabled={isLoading}>
            Gunakan Default
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button onClick={handleSave} isLoading={isLoading}>Simpan Guidelines</Button>
        </div>
      </div>
    </Modal>
  );
}
