// hooks/useLockBodyScroll.ts
import { useEffect } from "react";

let lockCount = 0;

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;

    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        document.documentElement.classList.remove("overflow-hidden");
        document.body.classList.remove("overflow-hidden");

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };
  }, [locked]);
}