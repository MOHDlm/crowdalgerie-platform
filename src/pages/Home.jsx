import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, getDocs } from "firebase/firestore";

// استيراد الفيديو
import videoBg from "./hero-bg.mp4";

import {
  TrendingUp,
  Users,
  Award,
  Briefcase,
  ArrowRight,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  // --- Fetch Real Data from Firebase ---
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["home-projects"],
    queryFn: async () => {
      try {
        const projectsRef = collection(db, "projects");
        const snapshot = await getDocs(projectsRef);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    },
  });

  // Calculate Real Stats
  const totalFunding = projects.reduce((sum, project) => {
    return sum + Number(project.funding_current || 0);
  }, 0);

  const activeProjects = projects.filter((p) => {
    const status = (p.status || "").toLowerCase();
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

  const qualityProjects = projects.filter(
    (p) =>
      p.quality_badge === true ||
      p.hasQualityBadge === true ||
      p.badge === true ||
      p.is_quality === true
  ).length;

  const features = [
    {
      icon: Shield,
      title: "Full Transparency",
      description:
        "A robust management system ensuring full transparency of all financial operations.",
    },
    {
      icon: Users,
      title: "Integrated Community",
      description:
        "Join a network of entrepreneurs and professional investors.",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description:
        "Collective funding decisions and automated execution mechanisms.",
    },
    {
      icon: Target,
      title: " Badge",
      description:
        "Professional evaluation system granting extra value to distinguished projects.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50"
      dir="ltr"
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden h-screen flex items-center justify-center">
        <video
          src={videoBg}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10" />

        <div className="container mx-auto px-6 relative z-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-4 py-2 rounded-full mb-6 font-semibold backdrop-blur-sm">
              <Award className="w-4 h-4" />
              <span>Algeria&apos;s Leading Crowdfunding Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Turn Your Idea Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                {" "}
                Reality
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
              An advanced digital platform connecting emerging startups with
              investors in a transparent and secure environment.
              <br />
              We help you achieve success through crowdfunding and collective
              governance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Projects")}>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-bold shadow-xl border-0"
                >
                  Explore Projects
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to={createPageUrl("MyProjects")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-900 px-8 py-6 text-lg font-bold transition-colors"
                >
                  Start Your Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS SECTION - REAL DATA ================= */}
      <section className="relative z-30 -mt-24 px-6">
        <div className="container mx-auto">
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-white shadow-2xl border-0"
                >
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white shadow-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-bold mb-2">
                          Total Funding
                        </p>
                        <h3 className="text-3xl font-extrabold text-blue-900">
                          {totalFunding > 0
                            ? `${(totalFunding / 1000000).toFixed(2)}M`
                            : "0"}{" "}
                          DZD
                        </h3>
                      </div>
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-bold mb-2">
                          Active Projects
                        </p>
                        <h3 className="text-3xl font-extrabold text-blue-900">
                          {activeProjects > 0
                            ? activeProjects
                            : projects.length}
                        </h3>
                      </div>
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white shadow-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-bold mb-2">
                          Badge
                        </p>
                        <h3 className="text-3xl font-extrabold text-blue-900">
                          {qualityProjects}
                        </h3>
                      </div>
                      <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Award className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Why CrowdAlgerie?
            </h2>
            <p className="text-xl text-gray-600">
              We provide everything you need for your project&apos;s success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-blue-700" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-700 shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
            <CardContent className="p-12 md:p-16 text-center relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Launch?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join our community today and secure the funding needed to turn
                your idea into a successful project.
              </p>
              <Link to={createPageUrl("MyProjects")}>
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-6 text-lg font-bold shadow-xl"
                >
                  Start Now
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
