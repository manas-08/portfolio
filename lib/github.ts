/**
 * @fileoverview Server-side GitHub fetchers. All calls are cached by Next.js
 * for a day and degrade gracefully so the page still renders offline or when
 * rate limited.
 */

import {GITHUB_USER} from './content';

const REVALIDATE_SECONDS = 60 * 60 * 24;

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  fork: boolean;
  updatedAt: string;
  url: string;
  topics: string[];
}

export interface GithubSnapshot {
  repos: Repo[];
  byName: Record<string, Repo>;
  publicRepos: number;
  originalRepos: number;
  languages: Array<{name: string; count: number}>;
  fetched: boolean;
}

export interface WordOfTheDay {
  word: string;
  meaning: string | null;
  date: string | null;
}

interface RawRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
  html_url: string;
  topics?: string[];
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/** Fetches public repositories and derives summary statistics. */
export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  try {
    const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
        {headers: githubHeaders(), next: {revalidate: REVALIDATE_SECONDS}});
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const raw = (await res.json()) as RawRepo[];
    const repos: Repo[] = raw.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      fork: r.fork,
      updatedAt: r.pushed_at,
      url: r.html_url,
      topics: r.topics ?? [],
    }));
    const originals = repos.filter((r) => !r.fork);
    const counts = new Map<string, number>();
    for (const repo of originals) {
      if (!repo.language) continue;
      counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    }
    return {
      repos,
      byName: Object.fromEntries(repos.map((r) => [r.name, r])),
      publicRepos: repos.length,
      originalRepos: originals.length,
      languages: [...counts.entries()]
          .map(([name, count]) => ({name, count}))
          .sort((a, b) => b.count - a.count),
      fetched: true,
    };
  } catch {
    return {
      repos: [],
      byName: {},
      publicRepos: 0,
      originalRepos: 0,
      languages: [],
      fetched: false,
    };
  }
}

/** Parses today's word from the word_of_the_day repository README. */
export async function getWordOfTheDay(): Promise<WordOfTheDay | null> {
  try {
    const res = await fetch(
        `https://raw.githubusercontent.com/${GITHUB_USER}/word_of_the_day/main/README.md`,
        {next: {revalidate: 60 * 60 * 6}});
    if (!res.ok) return null;
    const text = await res.text();
    const word = text.match(/###\s*\*\*(.+?)\*\*/)?.[1]?.trim();
    if (!word) return null;
    const meaning = text.match(/\*\*Meaning\*\*:\s*(.+)/)?.[1]?.trim() ?? null;
    const date = text.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
    const hasMeaning = meaning && !/not found/i.test(meaning);
    return {word, meaning: hasMeaning ? meaning : null, date};
  } catch {
    return null;
  }
}
