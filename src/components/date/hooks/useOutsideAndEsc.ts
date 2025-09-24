import { useEffect, RefObject } from "react";

/**
 * React hook that closes a component when the user clicks outside of it
 * or presses the Escape key.
 *
 * @param ref - A React ref pointing to the target element that should stay open.
 * @param onClose - Callback invoked when an outside click or Escape key is detected.
 */
export function useOutsideAndEsc(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onClose]);
}
