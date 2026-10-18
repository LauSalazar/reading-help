import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")?.[1] ?? "reading-help";
const base = isGithubPages ? `/${repoName}/` : "/";

export default defineConfig({
  vite: {
    base,
  },
  tanstackStart: {
    spa: { enabled: true },
    router: {
      basepath: isGithubPages ? `/${repoName}` : undefined,
    },
    server: { entry: "server" },
  },
});