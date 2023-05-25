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

// Updates the height of a <textarea> when the value changes.
const useAutosizeTextArea = (value: string, containerHeight: number = 796) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRef = textAreaRef.current;
  useEffect(() => {
    if (currentRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      currentRef.style.height = "0px";
      const scrollHeight = currentRef.scrollHeight;

      if (containerHeight / 2 < scrollHeight) {
        currentRef.style.height = containerHeight / 2 + "px";
      } else {
        // We then set the height directly, outside of the render loop
        // Trying to set this with state or a ref will product an incorrect value.
        currentRef.style.height = scrollHeight + "px";
      }
    }
  }, [currentRef, value]);
  return textAreaRef;
};

export default useAutosizeTextArea;
