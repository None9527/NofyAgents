import {useSyncExternalStore} from 'react';
import {getLocale,subscribeLocale} from './i18n.ts';
/** Locale changes rerender the mounted view without rebuilding Runtime or losing session state. */
export function useLocale(){return useSyncExternalStore(subscribeLocale,getLocale,getLocale);}
