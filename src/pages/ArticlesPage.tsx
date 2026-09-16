import { ComingSoon } from "../components/ComingSoon";
import { Lang } from "../lib/i18n";

// Replaced with the real, filterable article list in Phase 5.
export function ArticlesPage({ lang }: { lang: Lang }) {
  return <ComingSoon lang={lang} icon="📚" />;
}
