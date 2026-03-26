import Layout from "./Layout.jsx";
import Home from "./Home";
import Projects from "./Projects";
import Voting from "./Voting";
import Dashboard from "./Dashboard";
import MyProjects from "./MyProjects";
import QualityBadge from "./QualityBadge";
import Assessment from "./Assessment";
import Consortium from "./Consortium";
import SupplyChain from "./SupplyChain";
import SharedServices from "./SharedServices";
import { Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const PAGES = {
  Home: Home,
  Projects: Projects,
  Voting: Voting,
  Dashboard: Dashboard,
  MyProjects: MyProjects,
  QualityBadge: QualityBadge,
  Assessment: Assessment,
  Consortium: Consortium,
  SupplyChain: SupplyChain,
  SharedServices: SharedServices,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }
  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/Home"
          element={<Home />}
        />
        <Route
          path="/Projects"
          element={<Projects />}
        />
        <Route
          path="/Voting"
          element={<Voting />}
        />
        <Route
          path="/Dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/MyProjects"
          element={<MyProjects />}
        />
        <Route
          path="/QualityBadge"
          element={<QualityBadge />}
        />
        <Route
          path="/Assessment"
          element={<Assessment />}
        />

        {/* مسارات التكتل التعاوني ✨ */}
        <Route
          path="/Consortium"
          element={<Consortium />}
        />
        <Route
          path="/consortium"
          element={<Consortium />}
        />

        <Route
          path="/SupplyChain"
          element={<SupplyChain />}
        />
        <Route
          path="/consortium/supply-chain"
          element={<SupplyChain />}
        />

        <Route
          path="/SharedServices"
          element={<SharedServices />}
        />
        <Route
          path="/consortium/services"
          element={<SharedServices />}
        />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <QueryClientProvider client={queryClient}>
      <PagesContent />
    </QueryClientProvider>
  );
}
