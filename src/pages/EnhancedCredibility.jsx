import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Star,
  Briefcase,
  BarChart3,
  Filter,
  Search,
} from "lucide-react";

export default function EnhancedCredibility() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch certified companies with quality badge from Firebase
  const { data: certifiedCompanies = [], isLoading } = useQuery({
    queryKey: ["enhanced-credibility-companies"],
    queryFn: async () => {
      try {
        const companiesRef = collection(db, "companies");
        const q = query(companiesRef, where("quality_badge", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching companies:", error);
        return [];
      }
    },
  });

  // Sample data for demo
  const sampleCompanies = [
    {
      id: 1,
      name: "Pure Info",
      industry: "IT & Software",
      credibilityScore: 98,
      certifications: ["ISO 9001", "ISO 27001", "SOC 2"],
      yearsInBusiness: 12,
      partnerCount: 45,
      trustRating: 4.9,
      description:
        "Leading software solutions provider with exceptional track record in enterprise systems.",
      reputationStatus: "Excellent",
      investorConfidence: "Very High",
      awards: ["Best Tech Innovation 2024", "Industry Leader Award"],
      clientRetentionRate: 95,
      employeeCount: 120,
      revenue: "45M DZD",
      internationalPresence: true,
    },
    {
      id: 2,
      name: "AgriTech Solutions",
      industry: "Agriculture",
      credibilityScore: 96,
      certifications: ["ISO 9001", "Organic Certified"],
      yearsInBusiness: 8,
      partnerCount: 32,
      trustRating: 4.8,
      description:
        "Sustainable agriculture technology provider with proven environmental impact.",
      reputationStatus: "Excellent",
      investorConfidence: "High",
      awards: ["Green Innovation Award", "Sustainability Leader"],
      clientRetentionRate: 92,
      employeeCount: 85,
      revenue: "28M DZD",
      internationalPresence: true,
    },
    {
      id: 3,
      name: "Tech Startup Inc",
      industry: "Technology",
      credibilityScore: 92,
      certifications: ["ISO 9001", "AI Safety Certified"],
      yearsInBusiness: 5,
      partnerCount: 28,
      trustRating: 4.7,
      description:
        "Innovative technology startup with rapid growth and strong market presence.",
      reputationStatus: "Very Good",
      investorConfidence: "High",
      awards: ["Rising Star Award", "Innovation Excellence"],
      clientRetentionRate: 88,
      employeeCount: 67,
      revenue: "15M DZD",
      internationalPresence: false,
    },
    {
      id: 4,
      name: "Manufacturing Excellence",
      industry: "Manufacturing",
      credibilityScore: 94,
      certifications: ["ISO 9001", "ISO 45001", "ISO 14001"],
      yearsInBusiness: 15,
      partnerCount: 56,
      trustRating: 4.85,
      description:
        "Premium manufacturing company with decades of excellence and innovation.",
      reputationStatus: "Excellent",
      investorConfidence: "Very High",
      awards: ["Manufacturing Excellence Award", "Quality Leader 2024"],
      clientRetentionRate: 96,
      employeeCount: 245,
      revenue: "72M DZD",
      internationalPresence: true,
    },
    {
      id: 5,
      name: "Consulting Group",
      industry: "Consulting",
      credibilityScore: 95,
      certifications: ["ISO 9001", "PMI-PgMP"],
      yearsInBusiness: 10,
      partnerCount: 38,
      trustRating: 4.82,
      description:
        "Strategic consulting firm with expertise across multiple industries.",
      reputationStatus: "Excellent",
      investorConfidence: "Very High",
      awards: ["Best Consulting Firm", "Strategy Award"],
      clientRetentionRate: 94,
      employeeCount: 95,
      revenue: "35M DZD",
      internationalPresence: true,
    },
    {
      id: 6,
      name: "Real Estate Developments",
      industry: "Real Estate",
      credibilityScore: 91,
      certifications: ["ISO 9001", "Green Building Certified"],
      yearsInBusiness: 11,
      partnerCount: 42,
      trustRating: 4.75,
      description:
        "Real estate development company specializing in sustainable projects.",
      reputationStatus: "Very Good",
      investorConfidence: "High",
      awards: ["Best Development Award", "Sustainability Excellence"],
      clientRetentionRate: 90,
      employeeCount: 110,
      revenue: "58M DZD",
      internationalPresence: false,
    },
  ];

  const displayCompanies =
    certifiedCompanies.length > 0 ? certifiedCompanies : sampleCompanies;

  const industries = [
    "all",
    ...new Set(displayCompanies.map((c) => c.industry)),
  ];

  const filteredCompanies = displayCompanies.filter((company) => {
    const matchesIndustry =
      filterIndustry === "all" || company.industry === filterIndustry;
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const getCredibilityColor = (score) => {
    if (score >= 95)
      return { bg: "bg-green-100", text: "text-green-700", label: "Excellent" };
    if (score >= 90)
      return { bg: "bg-blue-100", text: "text-blue-700", label: "Very Good" };
    if (score >= 85)
      return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Good" };
    return { bg: "bg-orange-100", text: "text-orange-700", label: "Fair" };
  };

  const averageCredibility = Math.round(
    displayCompanies.reduce((sum, c) => sum + (c.credibilityScore || 0), 0) /
      displayCompanies.length
  );

  const certifiedCount = displayCompanies.length;
  const totalPartnerships = displayCompanies.reduce(
    (sum, c) => sum + (c.partnerCount || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">
            Loading credibility data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Enhanced Credibility 🛡️</h1>
              <p className="text-blue-50 mt-2 text-lg">
                Official recognition that increases investor and partner
                confidence
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Certified</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {certifiedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">
                    Avg Credibility
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {averageCredibility}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">
                    Total Partners
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalPartnerships}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Avg Trust</h3>
                  <p className="text-2xl font-bold text-orange-600">4.8/5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                <Filter className="w-5 h-5 text-slate-600" />
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="bg-transparent focus:outline-none font-semibold text-slate-700 cursor-pointer"
                >
                  {industries.map((industry) => (
                    <option
                      key={industry}
                      value={industry}
                    >
                      {industry === "all" ? "All Industries" : industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Showing {filteredCompanies.length} certified companies
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Companies List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Certified Companies
            </h2>

            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => {
                const credColor = getCredibilityColor(company.credibilityScore);
                return (
                  <Card
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className={`border-2 cursor-pointer transition-all ${
                      selectedCompany?.id === company.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                              {company.name}
                            </h3>
                            <p className="text-slate-600 text-sm mb-2">
                              {company.industry}
                            </p>
                            <p className="text-slate-600 text-sm">
                              {company.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${credColor.bg} ${credColor.text}`}
                          >
                            {company.credibilityScore}/100
                          </span>
                        </div>

                        {/* Credibility Score Bar */}
                        <div className="space-y-2 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              Credibility Score
                            </span>
                            <span className="font-bold text-slate-800">
                              {credColor.label}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
                              style={{ width: `${company.credibilityScore}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 pt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {company.trustRating}/5.0
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            {company.partnerCount} Partners
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            {company.yearsInBusiness} years
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
                  <p className="text-slate-600">No certified companies found</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedCompany ? (
              <Card className="border-2 border-blue-300 sticky top-24 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-lg">Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">
                      {selectedCompany.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedCompany.description}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-800 mb-3">
                      Credentials
                    </h4>
                    <div className="space-y-2">
                      {selectedCompany.certifications?.map((cert, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-slate-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-800 mb-3">
                      Performance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trust Rating</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCompany.trustRating}/5.0 ⭐
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Client Retention</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCompany.clientRetentionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Employees</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCompany.employeeCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Annual Revenue</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCompany.revenue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCompany.awards &&
                    selectedCompany.awards.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-slate-800 mb-2">
                          Awards
                        </h4>
                        <div className="space-y-1">
                          {selectedCompany.awards.map((award, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2"
                            >
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-slate-700">
                                {award}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs text-blue-700 font-semibold">
                        ✓ Investor Confidence:{" "}
                        {selectedCompany.investorConfidence}
                      </p>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 mt-4">
                    <CheckCircle className="w-5 h-5" />
                    Request Partnership
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-slate-200 sticky top-24">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Select a company to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            🏆 Credibility Advantages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="font-bold text-slate-800 mb-2">Investor Trust</h3>
              <p className="text-sm text-slate-600">
                Certified companies attract more investors and funding
                opportunities
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="font-bold text-slate-800 mb-2">
                Partner Confidence
              </h3>
              <p className="text-sm text-slate-600">
                Establish stronger relationships with strategic business
                partners
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-slate-800 mb-2">
                Market Recognition
              </h3>
              <p className="text-sm text-slate-600">
                Gain competitive advantage and stronger market positioning
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-l-4 border-orange-500">
              <h3 className="font-bold text-slate-800 mb-2">
                Value Enhancement
              </h3>
              <p className="text-sm text-slate-600">
                Increase company valuation and attract better business
                opportunities
              </p>
            </div>
          </div>
        </div>

        {/* How Credibility is Assessed */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border-2 border-indigo-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Assessment Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Certifications</h4>
              <p className="text-sm text-slate-600">
                International quality standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Track Record</h4>
              <p className="text-sm text-slate-600">
                Years in business and achievements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Client Feedback</h4>
              <p className="text-sm text-slate-600">
                Customer satisfaction and reviews
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-800 mb-2">
                Financial Health
              </h4>
              <p className="text-sm text-slate-600">
                Revenue and sustainability metrics
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                5
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Partnerships</h4>
              <p className="text-sm text-slate-600">
                Network and industry connections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
