/**
 * 模型选择器数据源门禁。内核 session_config.rs：sessionConfig.options 是
 * 模型项（category=model）与推理档项（category=mode）**混装一张表**；
 * 选择器与推理档菜单各吃各的，表外 category 不收（内核只产这两族）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readModelOptions, splitModelOptions } from "../renderer/ui/readers.ts";

test("readModelOptions：description 入型；缺 id 跳过", () => {
  const rows = readModelOptions([
    { id: "grok-4.5", label: "Nofy 4.5", category: "model", selected: false },
    { id: "high", label: "最高", category: "mode", description: "深度推理", selected: true },
    { label: "no-id", category: "model" },
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[1]?.description, "深度推理");
  assert.equal(rows[0]?.description, null);
});

test("splitModelOptions：model/mode 两族拆开；表外 category 両方都不收", () => {
  const rows = readModelOptions([
    { id: "a", label: "A", category: "model", selected: true },
    { id: "b", label: "B", category: "model", selected: false },
    { id: "low", label: "低", category: "mode", selected: false },
    { id: "x", label: "X", category: "mystery", selected: false },
    { id: "y", label: "Y", category: null, selected: false },
  ]);
  const split = splitModelOptions(rows);
  assert.deepEqual(split.models.map((m) => m.id), ["a", "b"]);
  assert.deepEqual(split.modes.map((m) => m.id), ["low"]);
});
