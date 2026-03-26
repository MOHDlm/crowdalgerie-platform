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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoImage from "./img/ChatGPT Image Nov 9, 2025, 10_15_53 AM.png";

// Navigation Items
const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Projects",
    url: createPageUrl("Projects"),
    icon: Briefcase,
  },
  {
    title: " Badge",
    url: createPageUrl("QualityBadge"),
    icon: Award,
  },
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

  // صفحة الـ Home فقط تأخذ navbar شفاف
  const isHomePage =
    location.pathname === "/" ||
    location.pathname === createPageUrl("Home") ||
    location.pathname === createPageUrl("QualityBadge");

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
      className="min-h-screen"
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
          direction: ltr;
          text-align: left;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* 
        - صفحة Home  → fixed + شفاف 100% (المحتوى يبدأ من top:0 خلف الـ navbar)
        - باقي الصفحات → sticky + أبيض واضح
      */}
      <header
        className={`z-50 transition-all duration-300 ${
          isHomePage
            ? "fixed top-0 left-0 w-full bg-transparent border-b border-white/10"
            : "sticky top-0 w-full bg-white border-b border-gray-200 shadow-sm"
        }`}
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
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  <div
                    className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-lg ${
                      isHomePage
                        ? "bg-white/10 text-white"
                        : "bg-blue-50 text-blue-900"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-white/20">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-semibold ${isHomePage ? "text-white" : "text-blue-900"}`}
                      >
                        {user.full_name || "User"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-100 border-yellow-300 text-yellow-800"
                        >
                          {user.membership_tier || "Basic"}
                        </Badge>
                        <span
                          className={`text-xs ${isHomePage ? "text-gray-300" : "text-gray-600"}`}
                        >
                          Power: {user.voting_power || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className={`hidden md:flex items-center gap-2 ${
                      isHomePage
                        ? "text-red-300 hover:text-red-400 hover:bg-white/10"
                        : "text-red-600 hover:bg-red-50"
                    }`}
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                  isHomePage
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
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
            <div
              className={`lg:hidden border-t py-4 shadow-xl rounded-b-2xl absolute left-0 right-0 top-20 px-4 ${
                isHomePage
                  ? "border-white/10 bg-black/60 backdrop-blur-md"
                  : "border-gray-200 bg-white"
              }`}
            >
              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${
                      location.pathname === item.url
                        ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md"
                        : isHomePage
                          ? "text-gray-100 hover:bg-white/10"
                          : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-semibold text-sm ${isHomePage ? "text-white" : "text-gray-900"}`}
                      >
                        {user.full_name || "User"}
                      </p>
                      <p
                        className={`text-xs ${isHomePage ? "text-gray-300" : "text-gray-500"}`}
                      >
                        {user.email}
                      </p>
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

      {/* 
        - Home: بدون padding لأن الـ navbar فوق المحتوى
        - باقي الصفحات: الـ navbar sticky لا يحتاج padding
      */}
      <main className={`min-h-screen ${isHomePage ? "" : "bg-slate-50"}`}>
        {children}
      </main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
