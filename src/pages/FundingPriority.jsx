import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  CheckCircle,
  Target,
  Zap,
  ArrowUp,
  Filter,
  Search,
} from "lucide-react";

export default function FundingPriority() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch funded projects with quality badge from Firebase
  const { data: fundingProjects = [], isLoading } = useQuery({
    queryKey: ["funding-priority-projects"],
    queryFn: async () => {
      try {
        const projectsRef = collection(db, "projects");
        const q = query(
          projectsRef,
          where("quality_badge", "==", true),
          orderBy("funding_priority", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching funding projects:", error);
        return [];
      }
    },
  });

  // Sample data for demo
  const sampleProjects = [
    {
      id: 1,
      name: "Pure Info - ERP System Upgrade",
      company: "Pure Info",
      category: "IT & Software",
      fundingAmount: "2,500,000 DZD",
      requestedAmount: "2,000,000 DZD",
      approvedPercentage: 100,
      status: "approved",
      deadline: "2025-03-15",
      description:
        "Modernization of ERP system to enhance operational efficiency and market competitiveness.",
      impactScore: 95,
      employeeCount: 45,
      fundingRound: "Q1 2025",
      fundingStatus: "Active",
      timeline: "6 months",
      expectedROI: "35%",
    },
    {
      id: 2,
      name: "AgriTech Solutions - Sustainable Farming Initiative",
      company: "AgriTech Solutions",
      category: "Agriculture",
      fundingAmount: "1,800,000 DZD",
      requestedAmount: "1,500,000 DZD",
      approvedPercentage: 100,
      status: "approved",
      deadline: "2025-03-20",
      description:
        "Implementation of sustainable farming technologies across regional operations.",
      impactScore: 92,
      employeeCount: 32,
      fundingRound: "Q1 2025",
      fundingStatus: "Active",
      timeline: "8 months",
      expectedROI: "28%",
    },
    {
      id: 3,
      name: "Tech Startup Inc - Market Expansion",
      company: "Tech Startup Inc",
      category: "Technology",
      fundingAmount: "1,200,000 DZD",
      requestedAmount: "1,000,000 DZD",
      approvedPercentage: 100,
      status: "approved",
      deadline: "2025-03-25",
      description:
        "Expansion into new markets with enhanced product development capabilities.",
      impactScore: 88,
      employeeCount: 28,
      fundingRound: "Q1 2025",
      fundingStatus: "Active",
      timeline: "5 months",
      expectedROI: "42%",
    },
    {
      id: 4,
      name: "Manufacturing Excellence - Automation",
      company: "Manufacturing Excellence",
      category: "Manufacturing",
      fundingAmount: "3,500,000 DZD",
      requestedAmount: "2,800,000 DZD",
      approvedPercentage: 100,
      status: "under_review",
      deadline: "2025-04-10",
      description:
        "Introduction of advanced automation systems to increase production capacity.",
      impactScore: 94,
      employeeCount: 67,
      fundingRound: "Q2 2025",
      fundingStatus: "Under Review",
      timeline: "9 months",
      expectedROI: "38%",
    },
    {
      id: 5,
      name: "Consulting Group - Digital Transformation",
      company: "Consulting Group",
      category: "Consulting",
      fundingAmount: "950,000 DZD",
      requestedAmount: "800,000 DZD",
      approvedPercentage: 95,
      status: "under_review",
      deadline: "2025-04-15",
      description:
        "Digital transformation services and platform development for consortium members.",
      impactScore: 86,
      employeeCount: 22,
      fundingRound: "Q2 2025",
      fundingStatus: "Under Review",
      timeline: "4 months",
      expectedROI: "31%",
    },
    {
      id: 6,
      name: "Real Estate Dev - Commercial Complex",
      company: "Real Estate Developments",
      category: "Real Estate",
      fundingAmount: "5,000,000 DZD",
      requestedAmount: "4,200,000 DZD",
      approvedPercentage: 85,
      status: "pending",
      deadline: "2025-05-01",
      description:
        "Development of premium commercial complex with modern facilities.",
      impactScore: 91,
      employeeCount: 89,
      fundingRound: "Q2 2025",
      fundingStatus: "Pending",
      timeline: "12 months",
      expectedROI: "25%",
    },
  ];

  const displayProjects =
    fundingProjects.length > 0 ? fundingProjects : sampleProjects;

  const filteredProjects = displayProjects.filter((project) => {
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "✓ Approved",
        };
      case "under_review":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "⏳ Under Review",
        };
      case "pending":
        return { bg: "bg-blue-100", text: "text-blue-700", label: "⏱ Pending" };
      default:
        return { bg: "bg-slate-100", text: "text-slate-700", label: "Status" };
    }
  };

  const totalFunding = displayProjects.reduce(
    (sum, p) => sum + parseInt(p.fundingAmount?.replace(/[^\d]/g, "") || 0),
    0
  );

  const approvedProjects = displayProjects.filter(
    (p) => p.status === "approved"
  ).length;
  const totalProjects = displayProjects.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">
            Loading funding opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Funding Priority 💰</h1>
              <p className="text-green-50 mt-2 text-lg">
                Access preferential funding and support opportunities for
                quality badge holders
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Total Pool</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {(totalFunding / 1000000).toFixed(1)}M DZD
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Approved</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {approvedProjects}/{totalProjects}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Average ROI</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {(
                      displayProjects.reduce(
                        (sum, p) => sum + parseInt(p.expectedROI || 0),
                        0
                      ) / displayProjects.length
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">
                    Active Round
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">Q1 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-2 border-green-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                <Filter className="w-5 h-5 text-slate-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent focus:outline-none font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="under_review">Under Review</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Showing {filteredProjects.length} projects
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Funding Opportunities
            </h2>

            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const statusColor = getStatusColor(project.status);
                return (
                  <Card
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`border-2 cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? "border-green-500 bg-green-50 shadow-lg"
                        : "border-slate-200 hover:border-green-300 hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                              {project.name}
                            </h3>
                            <p className="text-slate-600 text-sm mb-2">
                              {project.company}
                            </p>
                            <p className="text-slate-600 text-sm">
                              {project.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}
                          >
                            {statusColor.label}
                          </span>
                        </div>

                        {/* Funding Progress */}
                        <div className="space-y-2 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              Funding Approval
                            </span>
                            <span className="font-bold text-slate-800">
                              {project.approvedPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500"
                              style={{
                                width: `${project.approvedPercentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 pt-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            {project.fundingAmount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {project.timeline}
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4 text-purple-600" />
                            {project.expectedROI} ROI
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">
                    No funding opportunities found
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedProject ? (
              <Card className="border-2 border-green-300 sticky top-24 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">
                      {selectedProject.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-800 mb-3">
                      Funding Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          Approved Amount
                        </span>
                        <span className="font-bold text-green-600">
                          {selectedProject.fundingAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          Requested
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedProject.requestedAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">
                          Expected ROI
                        </span>
                        <span className="font-bold text-purple-600">
                          {selectedProject.expectedROI}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-800 mb-3">
                      Project Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Category</span>
                        <span className="font-semibold text-slate-800">
                          {selectedProject.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Timeline</span>
                        <span className="font-semibold text-slate-800">
                          {selectedProject.timeline}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Impact Score</span>
                        <span className="font-semibold text-slate-800">
                          {selectedProject.impactScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Employees</span>
                        <span className="font-semibold text-slate-800">
                          {selectedProject.employeeCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                      <p className="text-xs text-green-700 font-semibold">
                        💡 Priority Status: Active funding round
                      </p>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 mt-4">
                    <CheckCircle className="w-5 h-5" />
                    View Application
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-slate-200 sticky top-24">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Select a project to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            🏆 Funding Priority Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="font-bold text-slate-800 mb-2">
                Preferential Rates
              </h3>
              <p className="text-sm text-slate-600">
                Access funding with competitive interest rates and flexible
                terms
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="font-bold text-slate-800 mb-2">Fast Processing</h3>
              <p className="text-sm text-slate-600">
                Expedited application and approval process for qualified
                projects
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-slate-800 mb-2">Higher Limits</h3>
              <p className="text-sm text-slate-600">
                Access to higher funding amounts for ambitious growth projects
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-orange-500">
              <h3 className="font-bold text-slate-800 mb-2">
                Support Services
              </h3>
              <p className="text-sm text-slate-600">
                Dedicated mentoring and advisory services for project success
              </p>
            </div>
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            How to Apply
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-800 mb-2">
                Get Quality Badge
              </h4>
              <p className="text-sm text-slate-600">
                Achieve 85+ points in quality assessment
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Submit Proposal</h4>
              <p className="text-sm text-slate-600">
                Prepare detailed project proposal and financials
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Review Process</h4>
              <p className="text-sm text-slate-600">
                Committee review and evaluation of proposal
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Receive Funding</h4>
              <p className="text-sm text-slate-600">
                Get approved funding with agreed terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
