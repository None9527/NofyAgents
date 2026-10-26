import { useLayoutEffect, useRef, useState } from "react";
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({width:0,height:0});
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setSize(previous => (element.clientWidth === 0 && element.clientHeight === 0) || (previous.width === element.clientWidth && previous.height === element.clientHeight) ? previous : {width:element.clientWidth,height:element.clientHeight});
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}
