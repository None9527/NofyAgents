import { useEffect } from "react";
import { ShellGrid } from "./shell/ShellGrid";
import { useApp } from "./core/store";

export default function App() {
  // 历史栈快捷键：Alt+← / Alt+→
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        useApp.getState().goBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        useApp.getState().goForward();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <ShellGrid />;
}
