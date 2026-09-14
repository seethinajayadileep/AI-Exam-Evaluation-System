import { useEffect } from "react";

export function useEscape(enabled, onEscape) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onEscape?.(event);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [enabled, onEscape]);
}
