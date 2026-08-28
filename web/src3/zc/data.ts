/* mock 数据 —— 对拍真机截图 ScreenShot_2026-08-26 */
export type Task = { id: string; title: string; age?: string; unread?: boolean; running?: boolean };
export type Project = { id: string; name: string; running?: boolean; tasks: Task[]; more?: boolean };
export const PROJECTS: Project[] = [
  { id: "media-agent", name: "media-agent", tasks: [
    { id: "m1", title: "查找端云分流报告", age: "49天" },
    { id: "m2", title: "你有网络搜索能力么", age: "55天" },
    { id: "m3", title: "改进 Media Agent index.html", age: "59天" },
    { id: "m4", title: "当前是go的版本么", age: "66天" },
  ]},
  { id: "deepwiki-open", name: "deepwiki-open", running: true, tasks: [] },
  { id: "RTAgent-SDK", name: "RTAgent-SDK", running: true, tasks: [] },
  { id: "zcodebot", name: "zcodebot", tasks: [
    { id: "z1", title: "添加Grok Bot仓库到服务器", age: "1天" },
    { id: "z2", title: "更新panhub Docker容器", age: "2天" },
    { id: "z3", title: "XML Juice Number Calculation", age: "2天" },
    { id: "z4", title: "加启动权限", age: "2天" },
    { id: "z5", title: "虚拟机故障排查", age: "3天" },
  ], more: true },
  { id: "rtagent", name: "rtagent", tasks: [
    { id: "r1", title: "RTAgent-SDK R55 eval and R54 comparison", age: "今天", running: true },
    { id: "r2", title: "审计当前sdk内核", age: "69天" },
    { id: "r3", title: "hi", age: "70天" },
    { id: "r4", title: "讲席", age: "70天" },
  ]},
];
export const UNREAD = new Set(["m1", "m2", "z1", "z3", "r2", "r3"]);
