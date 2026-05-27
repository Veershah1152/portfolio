"use client";

import { useEffect } from "react";

export function BlogViewsCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Only run in production/client
    if (typeof window !== "undefined") {
      fetch(`/api/blog/${slug}/views`, { method: "POST" })
        .then((res) => {
          if (!res.ok) console.warn("Failed to increment views");
        })
        .catch((err) => console.error("Error updating views:", err));
    }
  }, [slug]);

  return null;
}
