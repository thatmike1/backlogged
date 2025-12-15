import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";

/**
 * main app layout with navbar and content area
 */
export function Layout() {
  return (
    <div className="min-h-screen bg-bg-base dark:bg-bg-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
