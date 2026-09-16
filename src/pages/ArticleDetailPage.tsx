import { ComingSoon } from "../components/ComingSoon";
import { Lang } from "../lib/i18n";

// Replaced with the real article reader (markdown, preview gate, reading
// progress, sources, related) in Phase 5. `slug` is accepted now so the route
// wiring in App.tsx is stable.
export function ArticleDetailPage({ lang, slug: _slug }: { lang: Lang; slug: string }) {
  return <ComingSoon lang={lang} icon="📖" />;
}
