export type FollowMode = 'static' | 'prework_watch' | 'prework_follow' | 'user_follow';
export type TranscriptPhase = 'idle' | 'working' | 'responding' | 'settled';
type FollowEvent = { type: 'submit' | 'overflow' | 'response' | 'settled' | 'bottom' | 'hold' }
  | { type: 'user-scroll'; distance: number };

/** Response means visible prose, not a protocol claim that the model's answer is final. */
export function transitionFollow(mode: FollowMode, event: FollowEvent): FollowMode {
  switch (event.type) {
    case 'submit': return 'prework_watch';
    case 'bottom': return 'user_follow';
    case 'hold': return 'static';
    case 'user-scroll': return event.distance > 24 ? 'static' : 'user_follow';
    case 'overflow': return mode === 'prework_watch' ? 'prework_follow' : mode;
    // Our transport does not distinguish commentary from final text. Continue watching
    // fitting prose; only an explicit final-phase protocol could justify stopping here.
    case 'response': return mode === 'prework_follow' ? 'user_follow' : mode;
    case 'settled': return mode === 'prework_watch' ? 'static' : mode;
  }
}
export function responseBudget(available: number): number {
  return Math.max(0, Math.min(available * 2 / 3, available - 240));
}
export function consumeResponseBudget(budget: number, growth: number): number {
  return Math.max(0, budget - Math.max(0, growth));
}
