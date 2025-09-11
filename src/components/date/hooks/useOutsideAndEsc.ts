import { useEffect, RefObject } from "react";

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
