// v2 入口：令牌 → bootstrap（传输+事件摄取）→ 渲染。
import React from "react";
import ReactDOM from "react-dom/client";
import "./tokens.css";
import { bootstrap } from "./core/store";
import App from "./App";

bootstrap();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
