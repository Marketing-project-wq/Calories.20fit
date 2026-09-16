import { InsightPage } from "./InsightPage";
import { Lang } from "../lib/i18n";

// Phase 0: routes to the existing "today's target / macro / log" view
// (InsightPage reads my20fit_profile + my20fit_daily_log). Phase 4 replaces
// this with the full tracker (meal sections + add-food from the food DB).
export function TrackerPage({ lang }: { lang: Lang }) {
  return <InsightPage lang={lang} />;
}
