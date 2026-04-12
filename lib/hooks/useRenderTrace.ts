"use client";

import { useEffect, useRef } from "react";

export function useRenderTrace(componentName: string, trackedValues: Record<string, unknown>) {
  const previousValuesRef = useRef(trackedValues);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      previousValuesRef.current = trackedValues;
      return;
    }

    const previousValues = previousValuesRef.current;
    const changedValues = Object.entries(trackedValues).filter(([key, value]) => !Object.is(previousValues[key], value));

    if (changedValues.length > 0) {
      const payload = Object.fromEntries(
        changedValues.map(([key, value]) => [key, { previous: previousValues[key], next: value }])
      );
      console.debug(`[render-trace] ${componentName}`, payload);
    }

    previousValuesRef.current = trackedValues;
  });
}
