// articles-api — external CRUD API for the calorie tracker's nutrition
// article library (public.nutrition_articles), for handing to a developer
// who is not part of this Supabase project.
//
// Auth: a per-developer API key, passed as `x-api-key`, checked against the
// SHA-256 hash stored in public.articles_api_keys. GET (read) is public and
// needs no key, matching the "readable by all" RLS policy on the table
// itself. Any write (POST/PATCH/DELETE) requires a valid key.
//
// This function runs with the service role internally (via
// SUPABASE_SERVICE_ROLE_KEY, always present in the Edge Function runtime),
// which is what lets it write despite the table having no INSERT/UPDATE/
// DELETE policy for anon/authenticated. The service role key itself is
// never returned to the caller in any response.
//
// Routes (base path /articles-api):
//   GET    /articles              -> list all articles
//   GET    /articles/:slug        -> get one article by slug
//   POST   /articles              -> create an article (requires x-api-key)
//   PATCH  /articles/:slug        -> partially update an article (requires x-api-key)
//   DELETE /articles/:slug        -> delete an article (requires x-api-key)
//
// Article JSON shape (matches the app's Article type in src/data/articles.ts):
// {
//   "slug": "my-new-article",
//   "title": { "id": "...", "en": "..." },
//   "excerpt": { "id": "...", "en": "..." },
//   "content": { "id": "markdown...", "en": "markdown..." },
//   "category": "nutrition-basics",
//   "tags": { "id": ["..."], "en": ["..."] },
//   "readTimeMinutes": 5,
//   "isPremium": false,
//   "sources": { "id": ["..."], "en": ["..."] },
//   "author": "20fit Nutrition Team",
//   "disclaimer": { "id": "...", "en": "..." },
//   "coverIcon": "apple",
//   "coverPhoto": "https://...",
//   "accent": "#22C55E",
//   "publishedAt": "2026-09-01"
// }
//
// title/excerpt/content/tags/sources/disclaimer, author, accent, isPremium,
// readTimeMinutes, publishedAt all have defaults on POST except title,
// excerpt, content, category, coverIcon, coverPhoto, which are required.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CATEGORIES = [
  "nutrition-basics",
  "meal-planning",
  "food-myths",
  "diet-types",
  "micronutrients",
  "sports-nutrition",
  "indonesian-food",
  "weight-management",
];

const DEFAULT_DISCLAIMER = {
  id: "Artikel ini bersifat edukatif dan informasional. Bukan pengganti konsultasi medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.",
  en: "This article is educational and informational. It is not a substitute for medical consultation. For specific dietary needs, consult a registered dietitian or doctor.",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isBilingual(v: unknown): v is { id: string; en: string } {
  return !!v && typeof v === "object" && typeof (v as any).id === "string" && typeof (v as any).en === "string";
}

function isBilingualArray(v: unknown): v is { id: string[]; en: string[] } {
  return (
    !!v &&
    typeof v === "object" &&
    Array.isArray((v as any).id) &&
    Array.isArray((v as any).en)
  );
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function requireApiKey(req: Request): Promise<boolean> {
  const key = req.headers.get("x-api-key");
  if (!key) return false;
  const hash = await sha256Hex(key);
  const { data, error } = await supabase
    .from("articles_api_keys")
    .select("id")
    .eq("key_hash", hash)
    .is("revoked_at", null)
    .maybeSingle();
  return !error && !!data;
}

function toDbRow(body: any, existing?: any) {
  const row: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (!isBilingual(body.title)) throw new Error("title must be { id: string, en: string }");
    row.title = body.title;
  }
  if (body.excerpt !== undefined) {
    if (!isBilingual(body.excerpt)) throw new Error("excerpt must be { id: string, en: string }");
    row.excerpt = body.excerpt;
  }
  if (body.content !== undefined) {
    if (!isBilingual(body.content)) throw new Error("content must be { id: string, en: string }");
    row.content = body.content;
  }
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      throw new Error(`category must be one of: ${CATEGORIES.join(", ")}`);
    }
    row.category = body.category;
  }
  if (body.tags !== undefined) {
    if (!isBilingualArray(body.tags)) throw new Error("tags must be { id: string[], en: string[] }");
    row.tags = body.tags;
  }
  if (body.readTimeMinutes !== undefined) {
    if (typeof body.readTimeMinutes !== "number") throw new Error("readTimeMinutes must be a number");
    row.read_time_minutes = body.readTimeMinutes;
  }
  if (body.isPremium !== undefined) {
    if (typeof body.isPremium !== "boolean") throw new Error("isPremium must be a boolean");
    row.is_premium = body.isPremium;
  }
  if (body.sources !== undefined) {
    if (!isBilingualArray(body.sources)) throw new Error("sources must be { id: string[], en: string[] }");
    row.sources = body.sources;
  }
  if (body.author !== undefined) {
    if (typeof body.author !== "string") throw new Error("author must be a string");
    row.author = body.author;
  }
  if (body.disclaimer !== undefined) {
    if (!isBilingual(body.disclaimer)) throw new Error("disclaimer must be { id: string, en: string }");
    row.disclaimer = body.disclaimer;
  }
  if (body.coverIcon !== undefined) {
    if (typeof body.coverIcon !== "string") throw new Error("coverIcon must be a string");
    row.cover_icon = body.coverIcon;
  }
  if (body.coverPhoto !== undefined) {
    if (typeof body.coverPhoto !== "string") throw new Error("coverPhoto must be a string (URL)");
    row.cover_photo = body.coverPhoto;
  }
  if (body.accent !== undefined) {
    if (typeof body.accent !== "string") throw new Error("accent must be a string (hex color)");
    row.accent = body.accent;
  }
  if (body.publishedAt !== undefined) {
    if (typeof body.publishedAt !== "string") throw new Error("publishedAt must be a date string (YYYY-MM-DD)");
    row.published_at = body.publishedAt;
  }

  if (!existing) {
    // Creating: required fields + defaults for the rest.
    for (const f of ["title", "excerpt", "content", "category", "cover_icon", "cover_photo"]) {
      if (row[f] === undefined) throw new Error(`${f === "cover_icon" ? "coverIcon" : f === "cover_photo" ? "coverPhoto" : f} is required`);
    }
    row.tags ??= { id: [], en: [] };
    row.sources ??= { id: [], en: [] };
    row.read_time_minutes ??= 5;
    row.is_premium ??= false;
    row.author ??= "20fit Nutrition Team";
    row.disclaimer ??= DEFAULT_DISCLAIMER;
    row.accent ??= "#22C55E";
  }

  return row;
}

function fromDbRow(row: any) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    tags: row.tags,
    readTimeMinutes: row.read_time_minutes,
    isPremium: row.is_premium,
    sources: row.sources,
    author: row.author,
    disclaimer: row.disclaimer,
    coverIcon: row.cover_icon,
    coverPhoto: row.cover_photo,
    accent: row.accent,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const url = new URL(req.url);
  // Strip the function's own base path so this works whether it's invoked as
  // /articles-api/articles/... or /functions/v1/articles-api/articles/....
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("articles-api");
  const rest = idx >= 0 ? parts.slice(idx + 1) : parts;

  if (rest[0] !== "articles") {
    return json({ error: "Not found. Use /articles or /articles/:slug." }, 404);
  }
  const slug = rest[1];

  try {
    if (req.method === "GET" && !slug) {
      const { data, error } = await supabase.from("nutrition_articles").select("*").order("published_at", { ascending: true });
      if (error) throw error;
      return json(data.map(fromDbRow));
    }

    if (req.method === "GET" && slug) {
      const { data, error } = await supabase.from("nutrition_articles").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Article not found" }, 404);
      return json(fromDbRow(data));
    }

    // Everything below writes data — require a valid API key.
    if (!(await requireApiKey(req))) {
      return json({ error: "Missing or invalid x-api-key" }, 401);
    }

    if (req.method === "POST" && !slug) {
      const body = await req.json();
      if (!body.slug || typeof body.slug !== "string") return json({ error: "slug is required" }, 400);
      const row = toDbRow(body);
      row.slug = body.slug;
      const { data, error } = await supabase.from("nutrition_articles").insert(row).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: `An article with slug "${body.slug}" already exists` }, 409);
        throw error;
      }
      return json(fromDbRow(data), 201);
    }

    if (req.method === "PATCH" && slug) {
      const body = await req.json();
      const row = toDbRow(body, /* existing */ true);
      if (Object.keys(row).length === 0) return json({ error: "No fields to update" }, 400);
      const { data, error } = await supabase.from("nutrition_articles").update(row).eq("slug", slug).select().maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Article not found" }, 404);
      return json(fromDbRow(data));
    }

    if (req.method === "DELETE" && slug) {
      const { data, error } = await supabase.from("nutrition_articles").delete().eq("slug", slug).select().maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Article not found" }, 404);
      return json({ deleted: slug });
    }

    return json({ error: "Method not allowed for this route" }, 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return json({ error: message }, 400);
  }
});
