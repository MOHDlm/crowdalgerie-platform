import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Briefcase,
  LayoutDashboard,
  Award,
  LogOut,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoImage from "./img/ChatGPT Image Nov 9, 2025, 10_15_53 AM.png";

// Navigation Items
const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Projects", url: createPageUrl("Projects"), icon: Briefcase },
  { title: " Badge", url: createPageUrl("QualityBadge"), icon: Award },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // صفحة Home فقط تأخذ navbar شفاف
  const isHomePage =
    location.pathname === "/" || location.pathname === createPageUrl("Home");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // const userData = await base44.auth.me();
        // setUser(userData);
      } catch {
        console.log("User not logged in");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      className="min-h-screen bg-[#0a0e17]"
      dir="ltr"
    >
      <style>{`
        :root {
          --primary: 210 100% 20%;
          --primary-foreground: 0 0% 100%;
          --secondary: 43 74% 52%;
          --secondary-foreground: 0 0% 0%;
          --accent: 210 100% 15%;
          --accent-foreground: 0 0% 100%;
        }
        * {
          font-family: 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
        }
        body {
          background-color: #0a0e17;
          direction: ltr;
          text-align: left;
          margin: 0;
          padding: 0;
        }

        /* ===== LIGHT MODE ===== */
        html.light body { background-color: #f1f5f9 !important; }
        html.light [class*="#0a0e17"] { background-color: #f1f5f9 !important; }
        html.light [class*="#161b27"] { background-color: #ffffff !important; }
        html.light [class*="#0d1117"] { background-color: #ffffff !important; }
        html.light [class*="#0f1117"] { background-color: #f8fafc !important; }

        html.light .text-slate-100,
        html.light .text-slate-200 { color: #0f172a !important; }
        html.light .text-slate-300 { color: #334155 !important; }
        html.light .text-slate-400 { color: #64748b !important; }
        html.light .text-slate-500 { color: #94a3b8 !important; }

        html.light .border-slate-800,
        html.light .border-slate-700 { border-color: #e2e8f0 !important; }
        html.light .bg-slate-700 { background-color: #e2e8f0 !important; }
        html.light .bg-slate-800\\/50 { background-color: #f1f5f9 !important; }

        html.light header { background-color: #ffffff !important; border-bottom-color: #e2e8f0 !important; }
        html.light header a { color: #374151 !important; }

        html.light input,
        html.light textarea,
        html.light select {
          background-color: #ffffff !important;
          color: #1e293b !important;
          border-color: #cbd5e1 !important;
        }

        html.light .bg-\\[\\#0a0e17\\]\\/80,
        html.light [class*="#0a0e17/"] { background-color: rgba(241,245,249,0.8) !important; }
      `}</style>

      <header
        className={`z-50 transition-all duration-300 ${
          isHomePage
            ? "fixed top-0 left-0 w-full bg-transparent border-b border-white/10"
            : "sticky top-0 w-full border-b border-slate-800"
        }`}
        style={isHomePage ? {} : { background: "#0d1117" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center"
            >
              <img
                src={logoImage}
                alt="CrowdAlgerie"
                className="h-40 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                      isActive
                        ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md"
                        : isHomePage
                          ? "text-gray-100 hover:bg-white/10 hover:text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    className={`relative p-2 rounded-lg transition-colors duration-200 hidden md:block ${
                      isHomePage
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-white/10 text-slate-300"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>

                  <div
                    className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-lg ${
                      isHomePage
                        ? "bg-white/10 text-white"
                        : "bg-white/10 text-slate-200"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-white/20">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-200">
                        {user.full_name || "User"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-100 border-yellow-300 text-yellow-800"
                        >
                          {user.membership_tier || "Basic"}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Power: {user.voting_power || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isHomePage
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-white/10 text-slate-300"
                }`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors duration-200 text-slate-300 hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-800 py-4 shadow-xl rounded-b-2xl absolute left-0 right-0 top-20 px-4 bg-[#0d1117]">
              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${
                      location.pathname === item.url
                        ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-slate-200">
                        {user.full_name || "User"}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className={`min-h-screen ${isHomePage ? "" : "bg-[#0a0e17]"}`}>
        {children}
      </main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
