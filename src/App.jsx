import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import Pages from "@/pages/index.jsx";
import Login from "@/pages/Login";
import { Toaster } from "@/components/ui/toaster";

// Import all quality badge pages
import QualityBadge from "@/pages/QualityBadge";
import SubcontractingOpportunities from "@/pages/SubcontractingOpportunities";
import DecisionMaking from "@/pages/DecisionMaking";
import FundingPriority from "@/pages/FundingPriority";
import EnhancedCredibility from "@/pages/EnhancedCredibility";

// Import Shared Services Admin page
import SharedServicesAdmin from "@/pages/SharedServicesAdmin";

// Import Create Proposal page
import CreateProposal from "@/pages/CreateProposal";

// Import Project Details Page
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";

// Create QueryClient instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ============================================
              PUBLIC ROUTES
              ============================================ */}

          {/* Login Page - Accessible without authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* ============================================
              PROTECTED ROUTES - Requires Authentication
              ============================================ */}

          {user ? (
            <>
              {/* Quality Badge & Privileges Pages */}
              <Route
                path="/quality-badge"
                element={<QualityBadge />}
              />

              {/* Privilege 2: Funding Priority */}
              <Route
                path="/funding-priority"
                element={<FundingPriority />}
              />

              {/* Privilege 3: Enhanced Credibility */}
              <Route
                path="/enhanced-credibility"
                element={<EnhancedCredibility />}
              />

              {/* Privilege 5: Subcontracting Opportunities */}
              <Route
                path="/subcontracting"
                element={<SubcontractingOpportunities />}
              />

              {/* Privilege 6: Decision Making */}
              <Route
                path="/decision-making"
                element={<DecisionMaking />}
              />

              {/* Create Proposal Route */}
              <Route
                path="/create-proposal"
                element={<CreateProposal />}
              />

              {/* Admin Route: Shared Services Management */}
              <Route
                path="/admin/shared-services"
                element={<SharedServicesAdmin />}
              />

              {/* Project Details Page - NEW */}
              <Route
                path="/projects/:projectId"
                element={<ProjectDetailsPage />}
              />

              {/* All other pages from index.jsx */}
              <Route
                path="/*"
                element={<Pages />}
              />
            </>
          ) : (
            // Redirect all unauthenticated users to login
            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />
          )}
        </Routes>

        {/* Toast notifications */}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
