import { QueryClient } from "@tanstack/react-query";
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath: "/reading-help",
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: typeof window !== "undefined" ? createHashHistory() : undefined,
  });

  return router;
};
