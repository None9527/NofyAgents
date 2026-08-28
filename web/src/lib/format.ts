// Time-based presentation helpers (locale-aware).
import { translate, type Locale } from "./i18n";

const GREETING_KEYS: Array<[number, number, string]> = [
  [5, 9, "greetingMorningEarly"],
  [9, 12, "greetingMorning"],
  [12, 14, "greetingNoon"],
  [14, 18, "greetingAfternoon"],
  [18, 23, "greetingEvening"],
];

export function greeting(locale: Locale, now = new Date()): string {
  const hour = now.getHours();
  const hit = GREETING_KEYS.find(([from, to]) => hour >= from && hour < to);
  return translate(locale, hit ? hit[2] : "greetingLateNight");
}

export function relativeDays(locale: Locale, timestamp: number, now = Date.now()): string {
  const days = Math.max(0, Math.floor((now - timestamp) / 86400000));
  if (days === 0) return translate(locale, "today");
  return translate(locale, "daysAgo", { n: days });
}
