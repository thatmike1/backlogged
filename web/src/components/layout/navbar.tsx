import { Link, NavLink } from "react-router-dom";
import { Library, Compass, BarChart3, Tags, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";
import { useDarkMode } from "../../hooks/use-dark-mode";

const NAV_ITEMS = [
  { to: "/", label: "Library", icon: Library },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/categories", label: "Categories", icon: Tags },
];

/**
 * main navigation bar
 */
export function Navbar() {
  const { isDark, toggle } = useDarkMode();

  return (
    <nav
      className={cn(
        "sticky top-0 z-50",
        "bg-white dark:bg-stone-900",
        "border-b-3 border-black dark:border-stone-600",
        "shadow-brutal-sm",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <Link
            to="/"
            className="font-display font-bold text-2xl text-primary hover:text-primary-dark transition-colors"
          >
            Backlogged
          </Link>

          {/* nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2",
                    "font-body font-semibold text-sm",
                    "rounded-md",
                    "transition-all duration-150",
                    isActive
                      ? "bg-primary text-white shadow-brutal-sm border-2 border-black dark:border-stone-600"
                      : "text-text-secondary dark:text-stone-400 hover:text-text-primary dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800",
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* dark mode toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
              "p-2",
              "rounded-md",
              "border-2 border-black dark:border-stone-600",
              "bg-white dark:bg-stone-800",
              "shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fafaf9]",
              "hover:translate-x-[-1px] hover:translate-y-[-1px]",
              "hover:shadow-[3px_3px_0_#000] dark:hover:shadow-[3px_3px_0_#fafaf9]",
              "active:translate-x-[1px] active:translate-y-[1px]",
              "active:shadow-[1px_1px_0_#000] dark:active:shadow-[1px_1px_0_#fafaf9]",
              "transition-all duration-150",
            )}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-accent-yellow" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <div className="sm:hidden border-t border-stone-200 dark:border-stone-700">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2",
                  "font-body text-xs",
                  "rounded-md",
                  "transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-text-secondary dark:text-stone-400",
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
