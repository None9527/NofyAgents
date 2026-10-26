import { Component } from "react";
import type { ReactNode } from "react";
import { PaneEmpty } from "./workbench.tsx";
import { Btn } from "./primitives.tsx";
import { tr } from "./i18n.ts";

/** A future panel's render failure must not take down conversation or window controls. */
export class ViewBoundary extends Component<{label:string;children:ReactNode;close?:{label:string;run:()=>void}},{failed:boolean}> {
  override state={failed:false};
  static getDerivedStateFromError(){ return {failed:true}; }
  override render(){ return this.state.failed ? <PaneEmpty title={this.props.label} description={tr("此视图暂时无法显示。")}><Btn onClick={()=>this.setState({failed:false})}>{tr("重试")}</Btn>{this.props.close?<Btn onClick={this.props.close.run}>{this.props.close.label}</Btn>:null}</PaneEmpty> : this.props.children; }
}
