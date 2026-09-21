// Photo tile for a recipe card. Resolves a real photo via
// src/lib/recipePhoto.ts (my.20fit.id's public, cached /api/menu/photo) and
// shows it once ready; shows the emoji while loading or if no photo could be
// resolved, so the UI never looks broken — just briefly plainer.
import { useEffect, useState } from "react";
import { getRecipePhoto } from "../lib/recipePhoto";

export function RecipeThumb({
  id,
  name,
  emoji,
  width = 52,
  height = 52,
  radius = 12,
  fontSize,
}: {
  id: string;
  name: string;
  emoji?: string | null;
  width?: number | string;
  height?: number | string;
  radius?: number;
  fontSize?: number;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    getRecipePhoto(id, name).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [id, name]);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
        background: "var(--surface-inset)",
        display: "grid",
        placeItems: "center",
        fontSize: fontSize ?? (typeof height === "number" ? Math.round(height * 0.46) : 32),
      }}
    >
      {!url && (emoji || "🍲")}
      {url && (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setUrl(null)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}
