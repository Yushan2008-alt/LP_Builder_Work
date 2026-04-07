"use client";
import React from "react";
import { TierBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Formula } from "@/lib/config/formulas";

interface Props {
  formula: Formula;
  onClick: () => void;
  isLoading?: boolean;
  isPreselected?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  foundational: "from-blue-50 to-blue-50 border-blue-100 hover:border-blue-300",
  comprehensive: "from-purple-50 to-purple-50 border-purple-100 hover:border-purple-300",
  modern: "from-green-50 to-green-50 border-green-100 hover:border-green-300",
  specialized: "from-orange-50 to-orange-50 border-orange-100 hover:border-orange-300",
  custom: "from-gray-50 to-gray-50 border-gray-200 hover:border-gray-400",
};

const TIER_ACCENT: Record<string, string> = {
  foundational: "text-blue-600",
  comprehensive: "text-purple-600",
  modern: "text-green-600",
  specialized: "text-orange-600",
  custom: "text-gray-600",
};

export function FormulaCard({ formula, onClick, isLoading, isPreselected }: Props) {
  const isCustom = formula.id === "custom";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full text-left p-5 rounded-2xl border bg-gradient-to-br transition-all duration-150",
        "hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        isPreselected && "ring-2 ring-blue-500 ring-offset-2",
        TIER_COLORS[formula.tier] ?? "from-gray-50 to-gray-50 border-gray-200 hover:border-gray-300"
      )}
    >
      {isCustom ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Start from Scratch</p>
          <p className="text-xs text-gray-500 mt-1">Blank canvas untuk copywriter berpengalaman</p>
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {["Bebas struktur", "No limit sections", "Full control"].map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn("font-bold text-base", TIER_ACCENT[formula.tier] ?? "text-gray-800")}>
                  {formula.name}
                </h3>
                <span className="text-xs bg-white/70 text-gray-500 px-2 py-0.5 rounded-full border border-white/50 shrink-0">
                  {formula.sectionCount} section
                </span>
              </div>
              <TierBadge tier={formula.tier} />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{formula.description}</p>
          <div className="flex flex-wrap gap-1">
            {formula.sections.slice(0, 4).map((s) => (
              <span key={s.frameworkPosition}
                className="text-xs bg-white/60 text-gray-500 px-2 py-0.5 rounded-full border border-white/50">
                {s.frameworkPosition}
              </span>
            ))}
            {formula.sections.length > 4 && (
              <span className="text-xs text-gray-400 px-1">+{formula.sections.length - 4} lagi</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 italic line-clamp-1">
            💡 {formula.bestCase}
          </p>
        </>
      )}
    </button>
  );
}
