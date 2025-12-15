import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import LibraryPage from "@/pages/library-page";
import GamePage from "@/pages/game-page";
import DiscoverPage from "@/pages/discover-page";
import StatsPage from "@/pages/stats-page";
import CategoriesPage from "@/pages/categories-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

/**
 * main app component with routing and providers
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/game/:igdbId" element={<GamePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
