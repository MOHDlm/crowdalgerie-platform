import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Firebase imports
import { db } from "@/firebase-config";
import { collection, getDocs } from "firebase/firestore";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectFilters from "../components/projects/ProjectFilters";

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  // Fetch data from Firebase with auto-refresh
  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["all-projects-firebase"],
    queryFn: async () => {
      try {
        const projectsCollectionRef = collection(db, "projects");
        const querySnapshot = await getDocs(projectsCollectionRef);

        const loadedProjects = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure all fields are properly formatted
            title: data.title || data.name_ar || "",
            description: data.description || "",
            company_name: data.company_name || "",
            category: data.category || data.sector || "",
            funding_current: Number(data.funding_current || 0),
            funding_goal: Number(data.funding_goal || 1),
            investors_count: Number(data.investors_count || 0),
          };
        });

        return loadedProjects;
      } catch (error) {
        console.error("Error fetching projects from Firebase:", error);
        return [];
      }
    },
    initialData: [],
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Do not cache
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Refresh projects when returning from project details page
  useEffect(() => {
    // Force refresh when coming back from project details
    console.log("Projects page mounted/updated, refreshing data...");
    refetch();
  }, [location.pathname, refetch]);

  // Debug: Log projects data when it changes
  useEffect(() => {
    if (projects.length > 0) {
      console.log("Projects updated:", projects.length, "projects loaded");
      console.log("Sample project data:", projects[0]);
    }
  }, [projects]);

  // Filter Logic
  const filteredProjects = projects.filter((project) => {
    // Fallback logic for fields to prevent crashes
    const title = String(project.title || project.name_ar || "");
    const company = String(project.company_name || "");
    const description = String(project.description || "");
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(searchLower) ||
      company.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    // Handle sector/category field names
    const projectSector = project.sector || project.category || "other";
    const matchesSector =
      sectorFilter === "all" || projectSector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  // Navigate to project details page
  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              Available Projects
            </h1>
            <p className="text-gray-600 text-lg">
              Explore investment opportunities in emerging startups
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Search & Tabs Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search Bar - Adjusted for LTR (Icon on left) */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for a project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg bg-white shadow-sm"
            />
          </div>

          {/* Status Tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-white shadow-sm h-12">
              <TabsTrigger
                value="all"
                className="h-10 px-6"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="voting"
                className="h-10 px-6"
              >
                Voting
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="h-10 px-6"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="funded"
                className="h-10 px-6"
              >
                Funded
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sector Filters Component */}
        <ProjectFilters
          sectorFilter={sectorFilter}
          setSectorFilter={setSectorFilter}
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600 text-xl font-medium">
              No projects found
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
