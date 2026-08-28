// 任务视图切换：脊柱 ↔ 谱系
import { useApp } from "../../core/store";

export function ViewSwitch() {
  const mode = useApp((s) => s.taskViewMode);
  const setMode = useApp((s) => s.setTaskViewMode);
  return (
    <div className="ui-seg" style={{ flex: "none", width: 192 }} data-slot="view-switch">
      <button data-on={mode === "spine"} onClick={() => setMode("spine")}>
        脊柱
      </button>
      <button data-on={mode === "lineage"} onClick={() => setMode("lineage")}>
        谱系
      </button>
      <button data-on={mode === "contract"} onClick={() => setMode("contract")}>
        契约
      </button>
    </div>
  );
}
