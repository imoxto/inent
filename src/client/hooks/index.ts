import { MouseEvent, useEffect, useRef } from "react";

export const useOutsideClick = (callback: () => void) => {
  const ref = useRef<any>();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current?.contains?.(event.target)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick as any);

    return () => {
      document.removeEventListener("click", handleClick as any);
    };
  }, [ref]);

  return ref;
};
