import { useEffect, useState } from "react";

// Fetches live star count — fails silently, never blocks render.
// GitHub unauthenticated API: 60 req/hour per IP. Fine for a showcase.
export function useGithubStats(owner, repo) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!owner || !repo) return;
    let cancelled = false;

    fetch(`https://api.github.com/repos/${owner}/${repo}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStats({
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
        });
      })
      .catch(() => {
        // silently ignore — stars are decoration, not core
      });

    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return { stats };
}
