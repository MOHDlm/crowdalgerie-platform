import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Filter,
  Send,
  CheckCircle,
  X,
  ArrowRight,
  Users,
  Clock,
  Briefcase,
  Star,
  TrendingUp,
} from "lucide-react";

export default function SubcontractingOpportunities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - محاكاة بيانات حقيقية
  const mockOpportunities = [
    {
      id: "1",
      title: "Web Development for E-commerce Platform",
      company: "TechStart Solutions",
      category: "IT & Software",
      budget: "$50,000 - $75,000",
      location: "Algiers, Algeria",
      deadline: "Jan 15, 2025",
      status: "active",
      description:
        "We are looking for an experienced web development team to build a modern e-commerce platform with payment integration, inventory management, and mobile responsiveness. The project requires expertise in React, Node.js, and database management.",
      requirements: [
        "5+ years experience in web development",
        "Proficiency in React and Node.js",
        "Previous e-commerce projects portfolio",
        "Available for 3-month project duration",
        "Team of at least 3 developers",
      ],
      postedDate: "Dec 10, 2024",
      applicants: 12,
      rating: 4.8,
    },
    {
      id: "2",
      title: "Agricultural Equipment Supply Chain Management",
      company: "AgroTech International",
      category: "Agriculture",
      budget: "$30,000 - $45,000",
      location: "Oran, Algeria",
      deadline: "Jan 25, 2025",
      status: "active",
      description:
        "Seeking a logistics partner to manage the supply chain for agricultural equipment distribution across northern Algeria. Must have experience with cold chain logistics and agricultural products.",
      requirements: [
        "Proven track record in logistics",
        "Fleet of at least 10 vehicles",
        "Warehouse facilities in multiple regions",
        "Experience with agricultural products",
        "ISO certification preferred",
      ],
      postedDate: "Dec 12, 2024",
      applicants: 8,
      rating: 4.6,
    },
    {
      id: "3",
      title: "Digital Marketing Campaign for Product Launch",
      company: "BrandBoost Agency",
      category: "Marketing",
      budget: "$25,000 - $40,000",
      location: "Algiers, Algeria",
      deadline: "Feb 1, 2025",
      status: "active",
      description:
        "Looking for a creative marketing team to design and execute a comprehensive digital marketing campaign for a new tech product launch. Includes social media, content creation, and influencer partnerships.",
      requirements: [
        "3+ years in digital marketing",
        "Portfolio of successful campaigns",
        "Social media management expertise",
        "Content creation capabilities",
        "Fluency in Arabic and French",
      ],
      postedDate: "Dec 15, 2024",
      applicants: 15,
      rating: 4.9,
    },
    {
      id: "4",
      title: "Construction Project Management - Commercial Building",
      company: "BuildPro Construction",
      category: "Construction",
      budget: "$120,000 - $180,000",
      location: "Constantine, Algeria",
      deadline: "Jan 30, 2025",
      status: "active",
      description:
        "Major commercial building project requiring experienced construction management team. Project includes structural work, electrical systems, plumbing, and interior finishing for a 5-story office building.",
      requirements: [
        "10+ years in construction management",
        "Professional engineering certifications",
        "Previous commercial building experience",
        "Safety compliance certification",
        "Team of qualified engineers",
      ],
      postedDate: "Dec 8, 2024",
      applicants: 6,
      rating: 4.7,
    },
    {
      id: "5",
      title: "Quality Assurance & Testing Services",
      company: "QualityFirst Labs",
      category: "Quality Assurance",
      budget: "$35,000 - $50,000",
      location: "Algiers, Algeria",
      deadline: "Feb 10, 2025",
      status: "active",
      description:
        "Need a QA team to conduct comprehensive testing for a new software product. Includes functional testing, performance testing, security testing, and automated test development.",
      requirements: [
        "Expertise in software testing methodologies",
        "Experience with automation tools (Selenium, Jest)",
        "Security testing knowledge",
        "Performance testing capabilities",
        "Detailed documentation skills",
      ],
      postedDate: "Dec 18, 2024",
      applicants: 10,
      rating: 4.5,
    },
    {
      id: "6",
      title: "HR Recruitment & Training Program",
      company: "TalentHub Solutions",
      category: "HR",
      budget: "$20,000 - $35,000",
      location: "Algiers, Algeria",
      deadline: "Jan 20, 2025",
      status: "active",
      description:
        "Seeking HR consultancy to develop and implement a comprehensive recruitment and training program for a growing tech company. Includes talent acquisition strategy and employee development programs.",
      requirements: [
        "HR consultancy experience",
        "Recruitment expertise",
        "Training program development",
        "Knowledge of tech industry",
        "Bilingual (Arabic/French/English)",
      ],
      postedDate: "Dec 14, 2024",
      applicants: 9,
      rating: 4.6,
    },
    {
      id: "7",
      title: "Manufacturing Process Optimization",
      company: "IndustryMax Corp",
      category: "Manufacturing",
      budget: "$80,000 - $120,000",
      location: "Annaba, Algeria",
      deadline: "Feb 15, 2025",
      status: "active",
      description:
        "Looking for industrial engineering consultants to optimize our manufacturing processes, reduce waste, and improve efficiency. Project includes process analysis, equipment recommendations, and staff training.",
      requirements: [
        "Industrial engineering background",
        "Lean manufacturing expertise",
        "Process optimization experience",
        "Equipment specification knowledge",
        "Training delivery capabilities",
      ],
      postedDate: "Dec 11, 2024",
      applicants: 7,
      rating: 4.8,
    },
    {
      id: "8",
      title: "Logistics & Distribution Network Setup",
      company: "FastShip Logistics",
      category: "Logistics",
      budget: "$45,000 - $65,000",
      location: "Multiple Cities",
      deadline: "Jan 28, 2025",
      status: "active",
      description:
        "Establish a comprehensive distribution network across Algeria for consumer goods. Requires expertise in warehouse setup, route optimization, and last-mile delivery solutions.",
      requirements: [
        "Logistics network design experience",
        "Warehouse management expertise",
        "Route optimization skills",
        "Technology integration knowledge",
        "Multi-city operational capability",
      ],
      postedDate: "Dec 16, 2024",
      applicants: 11,
      rating: 4.7,
    },
  ];

  const categories = [
    "all",
    "IT & Software",
    "Agriculture",
    "Marketing",
    "Construction",
    "Quality Assurance",
    "HR",
    "Manufacturing",
    "Logistics",
    "Consulting",
  ];

  const filteredOpportunities = mockOpportunities.filter((opp) => {
    const matchesSearch =
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || opp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitInterest = async () => {
    if (!formData.name || !formData.email || !formData.company) {
      alert("Please fill in all required fields (Name, Email, Company)");
      return;
    }

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Interest submitted:", {
        opportunity: selectedOpportunity.id,
        ...formData,
        submittedAt: new Date().toISOString(),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
        setShowForm(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting interest:", error);
      alert("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FileText className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold group-hover:scale-105 transition-transform duration-300 inline-block">
                Subcontracting Opportunities 📋
              </h1>
              <p className="text-pink-50 mt-2 text-lg group-hover:text-white transition-colors duration-300">
                Find collaboration opportunities with other enterprises in the
                consortium
              </p>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {mockOpportunities.length}
                  </div>
                  <div className="text-xs text-pink-100">Active Projects</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {mockOpportunities.reduce(
                      (sum, opp) => sum + opp.applicants,
                      0
                    )}
                  </div>
                  <div className="text-xs text-pink-100">Total Applicants</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <div className="text-2xl font-bold">$2.5M+</div>
                  <div className="text-xs text-pink-100">Total Budget</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5 group-hover:text-pink-500 group-hover:scale-110 transition-all duration-300" />
                <input
                  type="text"
                  placeholder="Search by project name, company, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-pink-500 focus:shadow-lg transition-all duration-300 hover:border-blue-400"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all duration-300 hover:shadow-md transform hover:scale-105">
                <Filter className="w-5 h-5 text-slate-600 animate-pulse" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent focus:outline-none font-semibold text-slate-700 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Found {filteredOpportunities.length} opportunities
              </p>
              {filteredOpportunities.length === 0 && searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                  }}
                  className="text-sm text-pink-600 hover:text-pink-700 font-semibold underline hover:scale-110 transition-all duration-300 transform"
                >
                  Clear filters ✨
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opp) => (
                <Card
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className={`cursor-pointer transition-all duration-500 ease-out border-2 transform ${
                    selectedOpportunity?.id === opp.id
                      ? "border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-2xl scale-105 -translate-y-2"
                      : "border-slate-200 hover:border-pink-400 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 bg-white"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-pink-600 transition-colors duration-300">
                            {opp.title}
                          </h3>
                          <p className="text-slate-600 flex items-center gap-2 mt-1 transition-all duration-300 hover:text-slate-800">
                            <Building2 className="w-4 h-4 transition-transform duration-300 hover:scale-125" />
                            {opp.company}
                          </p>
                        </div>
                        <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110">
                          {opp.category}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2">
                        {opp.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm group hover:bg-green-50 p-2 rounded-lg transition-all duration-300">
                          <DollarSign className="w-4 h-4 text-green-600 group-hover:scale-125 transition-transform duration-300" />
                          <span className="font-semibold text-slate-700 group-hover:text-green-700">
                            {opp.budget}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300">
                          <MapPin className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-slate-700 group-hover:text-blue-700">
                            {opp.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm group hover:bg-orange-50 p-2 rounded-lg transition-all duration-300">
                          <Calendar className="w-4 h-4 text-orange-600 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-slate-700 group-hover:text-orange-700">
                            {opp.deadline}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 hover:bg-green-50 p-2 rounded-lg transition-all duration-300">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-semibold text-green-700">
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Additional Info Row */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {opp.applicants} applicants
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Posted {opp.postedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {opp.rating}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 border-slate-200">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-4">
                    No opportunities found matching your criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                    }}
                    className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-2 mx-auto hover:scale-110 transition-all duration-300"
                  >
                    Reset filters
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedOpportunity ? (
              <Card className="border-2 border-pink-300 sticky top-24 shadow-xl overflow-hidden animate-fade-in transform transition-all duration-500 hover:shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 animate-pulse"></div>
                  <CardTitle className="text-lg relative z-10">
                    Opportunity Details ✨
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">
                      {selectedOpportunity.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedOpportunity.description}
                    </p>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedOpportunity.applicants}
                      </div>
                      <div className="text-xs text-slate-600">Applicants</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {selectedOpportunity.rating}
                      </div>
                      <div className="text-xs text-slate-600">Rating</div>
                    </div>
                  </div>

                  {selectedOpportunity.requirements &&
                    selectedOpportunity.requirements.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Requirements
                        </h4>
                        <div className="space-y-2">
                          {selectedOpportunity.requirements.map((req, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-sm items-start hover:bg-slate-50 p-2 rounded transition-colors duration-200"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-pink-700 hover:via-rose-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-5 h-5 animate-bounce" />
                    Express Interest 🚀
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-slate-200 sticky top-24">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-slate-600 font-medium">
                    Select an opportunity to view details
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Click on any opportunity card to see full details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Interest Form Modal */}
        {showForm && selectedOpportunity && (
          <Card className="border-2 border-pink-300 mt-8 shadow-2xl animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-pink-600" />
                  Express Your Interest
                </CardTitle>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-pink-200 rounded-lg transition-all duration-300 hover:rotate-90"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">
                    Success! 🎉
                  </h4>
                  <p className="text-slate-600 mb-1">
                    Your application has been submitted successfully.
                  </p>
                  <p className="text-sm text-slate-500">
                    We will contact you soon with updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Applying for:</strong> {selectedOpportunity.title}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Company: {selectedOpportunity.company}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-slate-400 focus:shadow-lg focus:scale-[1.01]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-slate-400 focus:shadow-lg focus:scale-[1.01]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+213 XXX XXX XXX"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-slate-400 focus:shadow-lg focus:scale-[1.01]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Your Company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-slate-400 focus:shadow-lg focus:scale-[1.01]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      placeholder="Tell them why you're interested and what you can offer..."
                      rows="4"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-slate-400 focus:shadow-lg resize-none"
                    ></textarea>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmitInterest}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-lg font-bold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Application 🚀
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      disabled={isSubmitting}
                      className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 transform group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-125 transition-transform duration-300">
                {mockOpportunities.length}
              </div>
              <p className="text-slate-600 font-medium group-hover:text-blue-700 transition-colors">
                Active Opportunities 📊
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 transform group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-125 transition-transform duration-300">
                {categories.length - 1}
              </div>
              <p className="text-slate-600 font-medium group-hover:text-green-700 transition-colors">
                Different Categories 🏢
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 transform group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-4xl font-bold text-pink-600 mb-2 group-hover:scale-125 transition-transform duration-300">
                $2.5M+
              </div>
              <p className="text-slate-600 font-medium group-hover:text-pink-700 transition-colors">
                Total Budget 💰
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 transform group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-125 transition-transform duration-300">
                {mockOpportunities.reduce(
                  (sum, opp) => sum + opp.applicants,
                  0
                )}
              </div>
              <p className="text-slate-600 font-medium group-hover:text-purple-700 transition-colors">
                Total Applicants 👥
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <Card className="border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Need Help?</h4>
                  <p className="text-sm text-slate-600">
                    Contact our support team for assistance
                  </p>
                </div>
              </div>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Contact Support
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
