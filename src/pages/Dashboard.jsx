import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { db } from "@/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import {
  TrendingUp,
  Briefcase,
  Award,
  Users,
  DollarSign,
  Target,
  Building2,
  Plus,
  FolderOpen,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard";
import FundingChart from "../components/dashboard/FundingChart";
import TopProjects from "../components/dashboard/TopProjects";

import badgeImage from "./img/Gemini_Generated_Image_4wgm3v4wgm3v4wgm.png";
import projectsImage from "./img/Gemini_Generated_Image_589nwb589nwb589n (1).png";
import servicesImage from "./img/Gemini_Generated_Image_6yju2u6yju2u6yju.png";
import proposalImage from "./img/Gemini_Generated_Image_nh7b0cnh7b0cnh7b (1).png";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function Dashboard() {
  const navigate = useNavigate();

  // --- 1. Fetch Projects (Live Data) ---
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: async () => {
      try {
        const projectsRef = collection(db, "projects");
        const snapshot = await getDocs(projectsRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("📊 Projects Data:", data);
        return data;
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
        return [];
      }
    },
    refetchInterval: 5000,
  });

  // --- 2. Fetch Investments (Live Data) - Search in multiple possible locations ---
  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ["dashboard-investments"],
    queryFn: async () => {
      try {
        let allInvestments = [];

        // Attempt 1: Fetch from "investments" collection
        try {
          const investmentsRef = collection(db, "investments");
          const snapshot = await getDocs(investmentsRef);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allInvestments = [...allInvestments, ...data];
          console.log("💰 Investments from 'investments':", data);
        } catch {
          console.log("No 'investments' collection");
        }

        // Attempt 2: Fetch from "funding" collection
        try {
          const fundingsRef = collection(db, "funding");
          const snapshot = await getDocs(fundingsRef);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allInvestments = [...allInvestments, ...data];
          console.log("💰 Investments from 'funding':", data);
        } catch {
          console.log("No 'funding' collection");
        }

        // Attempt 3: Fetch from "transactions" collection
        try {
          const transactionsRef = collection(db, "transactions");
          const snapshot = await getDocs(transactionsRef);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allInvestments = [...allInvestments, ...data];
          console.log("💰 Investments from 'transactions':", data);
        } catch {
          console.log("No 'transactions' collection");
        }

        console.log("💰 Total Investments Data:", allInvestments);
        return allInvestments;
      } catch (error) {
        console.error("❌ Error fetching investments:", error);
        return [];
      }
    },
    refetchInterval: 5000,
  });

  // --- 3. Fetch Shared Services ---
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["dashboard-services"],
    queryFn: async () => {
      const servicesRef = collection(db, "shared_services");
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    refetchInterval: 10000,
  });

  // --- Calculations & Statistics ---

  // Calculate total funding from projects (funding_current)
  const totalFundingFromProjects = projects.reduce((sum, project) => {
    const funding = Number(project.funding_current || 0);
    console.log(`Project ${project.id}: funding_current = ${funding}`);
    return sum + funding;
  }, 0);

  console.log("💵 Total Funding from Projects:", totalFundingFromProjects);

  // Calculate total funding from investments (if exists)
  const totalFundingFromInvestments = investments.reduce((sum, inv) => {
    const amount = Number(
      inv.amount || inv.investment_amount || inv.fundingAmount || 0
    );
    return sum + amount;
  }, 0);

  // Use the maximum value
  const totalFunding = Math.max(
    totalFundingFromProjects,
    totalFundingFromInvestments
  );

  // Calculate number of investors (sum of investors_count from all projects)
  const totalInvestorsFromProjects = projects.reduce((sum, project) => {
    const count = Number(project.investors_count || 0);
    console.log(`Project ${project.id}: investors_count = ${count}`);
    return sum + count;
  }, 0);

  console.log("👥 Total Investors from Projects:", totalInvestorsFromProjects);

  // Number of investments from separate collection (if exists)
  const totalInvestorsFromInvestments = investments.length;

  // Use the maximum value
  const totalInvestors = Math.max(
    totalInvestorsFromProjects,
    totalInvestorsFromInvestments
  );

  // Calculate active projects
  const activeProjects = projects.filter((p) => {
    const status = (p.status || "").toLowerCase();
    // If no status, consider project active if funding_current < funding_goal
    if (!p.status && p.funding_current !== undefined && p.funding_goal) {
      return Number(p.funding_current || 0) < Number(p.funding_goal);
    }
    return (
      status === "active" ||
      status === "funding" ||
      status === "approved" ||
      p.is_active === true
    );
  }).length;

  // If no active projects based on status, consider all projects active
  const displayActiveProjects =
    activeProjects > 0 ? activeProjects : projects.length;

  // Calculate projects with quality badge
  const qualityProjects = projects.filter(
    (p) =>
      p.quality_badge === true ||
      p.hasQualityBadge === true ||
      p.badge === true ||
      p.is_quality === true
  ).length;

  // Calculate average ROI from projects
  const projectsWithROI = projects.filter((p) => {
    const roi =
      p.return_percentage || p.roi || p.expectedReturn || p.expected_return;
    return roi && Number(roi) > 0;
  });

  const avgReturn =
    projectsWithROI.length > 0
      ? projectsWithROI.reduce((sum, p) => {
          const roi = Number(
            p.return_percentage ||
              p.roi ||
              p.expectedReturn ||
              p.expected_return ||
              0
          );
          return sum + roi;
        }, 0) / projectsWithROI.length
      : 0;

  // Calculate total expected returns
  const totalReturns = investments.reduce((sum, inv) => {
    const expectedReturn = Number(
      inv.expected_return ||
        inv.expectedReturn ||
        inv.return_amount ||
        inv.profit ||
        0
    );
    return sum + expectedReturn;
  }, 0);

  // Number of available services
  const availableServices = services.filter(
    (s) => s.available !== false && s.status !== "unavailable"
  ).length;

  // Loading state
  if (projectsLoading || investmentsLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-slate-50/50 p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/80 to-transparent -z-10" />

      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard<span className="text-blue-600">.</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              A comprehensive overview of CrowdAlgerie platform performance and
              your investments.
            </p>
          </div>
        </motion.div>

        {/* Section 1: Key Metrics - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Investors */}
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Investors"
              value={totalInvestors}
              icon={Users}
              gradient="from-violet-500 to-purple-600"
              trend={
                totalInvestors === 1
                  ? "1 investor"
                  : totalInvestors > 1
                  ? `${totalInvestors} investors`
                  : "No investors"
              }
            />
          </motion.div>

          {/* Active Projects */}
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Active Projects"
              value={displayActiveProjects}
              icon={Briefcase}
              gradient="from-blue-500 to-indigo-600"
              trend={`Out of ${projects.length} projects`}
            />
          </motion.div>

          {/* Total Funding */}
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Funding"
              value={
                totalFunding > 0
                  ? `${(totalFunding / 1000000).toFixed(2)}M DZD`
                  : "0.00M DZD"
              }
              icon={DollarSign}
              gradient="from-emerald-500 to-teal-600"
              trend={totalFunding > 0 ? "+12.5% this month" : "No investments"}
            />
          </motion.div>

          {/* Average ROI */}
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Average ROI"
              value={avgReturn > 0 ? `${avgReturn.toFixed(1)}%` : "0.0%"}
              icon={Target}
              gradient="from-amber-500 to-orange-600"
              trend={avgReturn > 0 ? "Annual rate" : "No data"}
            />
          </motion.div>
        </div>

        {/* Section 2: Quick Actions & Navigation (Bento Grid Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: New Proposal */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/create-proposal")}
            className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-400"
          >
            {/* Background Image for New Proposal */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
              <img
                src={proposalImage}
                alt="Proposal Background"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>

            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/25 backdrop-blur-md rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg border border-white/30">
                  <Plus
                    size={28}
                    strokeWidth={2.5}
                  />
                </div>
                <ArrowUpRight className="text-white/70 group-hover:text-white transition-colors drop-shadow-md" />
              </div>

              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  New Proposal
                </h3>
                <p className="text-sm text-white/90 mt-2 drop-shadow-md">
                  Submit your project and start funding
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/40 shadow-md">
                  Quick Start
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: My Projects */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/myprojects")}
            className="group cursor-pointer relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
          >
            {/* Background Image */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
              <img
                src={projectsImage}
                alt="Projects Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/40 to-transparent"></div>
            </div>

            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 group-hover:h-full transition-all duration-300" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50/95 backdrop-blur-md rounded-xl text-blue-600 group-hover:scale-110 transition-transform shadow-md border border-blue-100">
                  <FolderOpen size={24} />
                </div>
                <ArrowUpRight className="text-slate-400 group-hover:text-blue-500 transition-colors drop-shadow-sm" />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors drop-shadow-sm">
                  My Projects
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-1">
                  Manage {projects.length} projects and track progress
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="bg-slate-50/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">
                  {displayActiveProjects} active
                </div>
                <div className="bg-green-50/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-green-600 border border-green-100 shadow-sm">
                  {projects.length > 0 ? "Good status" : "No projects"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Quality Badge */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/Assessment")}
            className="group cursor-pointer relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
          >
            {/* Background Image with high visibility */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
              <img
                src={badgeImage}
                alt="Badge Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/40 to-transparent"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-50/95 backdrop-blur-md rounded-xl text-yellow-600 group-hover:rotate-12 transition-transform shadow-md border border-yellow-100">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg drop-shadow-sm">
                    Badge
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Project evaluation
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 drop-shadow-sm">
                  {qualityProjects}
                </span>
                <span className="text-sm text-slate-600 font-medium">
                  certified projects
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                <div
                  className="bg-yellow-500 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width:
                      projects.length > 0
                        ? `${(qualityProjects / projects.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Shared Services */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/admin/shared-services")}
            className="group cursor-pointer relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
          >
            {/* Background Image */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
              <img
                src={servicesImage}
                alt="Services Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/40 to-transparent"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-50/95 backdrop-blur-md rounded-xl text-indigo-600 group-hover:rotate-12 transition-transform shadow-md border border-indigo-100">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg drop-shadow-sm">
                    Shared Services
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Logistics support
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 drop-shadow-sm">
                  {availableServices}
                </span>
                <span className="text-sm text-slate-600 font-medium">
                  available services
                </span>
              </div>
              <div className="mt-3 flex -space-x-2 overflow-hidden">
                {services.slice(0, 3).map((service, i) => (
                  <div
                    key={service.id || i}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold shadow-sm"
                    title={service.name || service.service_name}
                  >
                    S{i + 1}
                  </div>
                ))}
                {services.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold ring-2 ring-white shadow-sm">
                    +{services.length - 3}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 3: Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area - Takes 2 cols */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-blue-500"
                />
                Funding Analysis
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Monthly
              </span>
            </div>
            <FundingChart
              projects={projects}
              investments={investments}
            />
          </motion.div>

          {/* Top Projects List - Takes 1 col */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <TopProjects projects={projects} />
          </motion.div>
        </div>

        {/* Section 4: Secondary Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm text-pink-500">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Expected Returns
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {totalReturns > 0
                    ? `${(totalReturns / 1000).toFixed(0)}k DZD`
                    : "0 DZD"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Total Investments
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {investments.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
