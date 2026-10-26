import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Btn } from './primitives.tsx';
import { TextInput } from './forms.tsx';
import { MenuButton } from './menu.tsx';
import type { MenuButtonProps } from './menu.tsx';
import { IconSearch, IconX } from './icons.tsx';
import { tr } from './i18n.ts';

/** Shared workbench surfaces compose existing controls; dimensions live in components.css. */
export function PaneToolbar({children,className='',label}: {children:ReactNode;className?:string;label?:string}) {
  return <header className={'ui-pane-toolbar '+className} aria-label={label}>{children}</header>;
}
export function PaneIconButton({className='',children,...props}:ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Btn {...props} variant="ghost" size="icon" className={'ui-pane-icon '+className}>{children}</Btn>;
}
export function PaneButton({label,icon,responsive=false,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{label:string;icon?:ReactNode;responsive?:boolean}) {
  return <Btn {...props} aria-label={label} variant="ghost" size="sm" className={'ui-pane-button'+(responsive?' ui-pane-button--responsive':'')+' '+className}>{icon}<span className="ui-pane-button__label">{label}</span></Btn>;
}
export function PaneMenuButton({compact=false,...props}:MenuButtonProps & {compact?:boolean}) {
  return <span className={'ui-pane-menu'+(compact?' ui-pane-menu--compact':'')}><MenuButton variant="plain" {...props}/></span>;
}
export function PaneActionGroup({children}: {children:ReactNode}) {
  return <span className="ui-pane-action-group">{children}</span>;
}
export function PaneTab({icon,label,active,preview=false,title,onActivate,onPin,onClose,role='tab'}: {
  icon:ReactNode;label:string;active:boolean;preview?:boolean;title?:string;onActivate:()=>void;onPin?:()=>void;onClose:()=>void;role?:'tab'|'button';
}) {
  return <div className={'ui-pane-tab'+(active?' is-active':'')+(preview?' is-preview':'')}>
    <button type="button" className="ui-pane-tab__trigger" role={role} aria-selected={role==='tab'?active:undefined} aria-pressed={role==='button'?active:undefined} title={title} onClick={onActivate} onDoubleClick={onPin}>{icon}<span>{label}</span></button>
    <button type="button" className="ui-pane-tab__close" aria-label={tr('关闭 ')+label} title={tr('关闭 ')+label} onClick={onClose}><IconX size={12}/></button>
  </div>;
}
export function PaneSearch({label,...props}:InputHTMLAttributes<HTMLInputElement>&{label:string}) {
  return <div className="ui-pane-search" role="search"><IconSearch size={16}/><TextInput {...props} aria-label={label}/></div>;
}
export function PaneEmpty({icon,title,description,children}: {icon?:ReactNode;title?:string;description:ReactNode;children?:ReactNode}) {
  return <div className="ui-pane-empty"><div className="ui-pane-empty__content">{icon?<span className="ui-pane-empty__icon">{icon}</span>:null}{title?<h2>{title}</h2>:null}<p>{description}</p>{children}</div></div>;
}
export function PaneChoice({icon,label,description,onClick}: {icon:ReactNode;label:string;description:string;onClick:()=>void}) {
  return <Btn variant="ghost" size="md" className="ui-pane-choice" aria-label={label} onClick={onClick}>{icon}<span><strong>{label}</strong><small>{description}</small></span></Btn>;
}
