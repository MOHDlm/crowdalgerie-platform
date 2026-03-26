import { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Voting() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["voting-projects"],
    //  queryFn: () => base44.entities.Project.filter({ status: 'voting' }, '-created_date'),
    initialData: [],
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["my-votes"],
    // queryFn: async () => {
    //   const user = await base44.auth.me();
    //   return base44.entities.Vote.filter({ voter_email: user.email });
    // },
    initialData: [],
  });

  const voteMutation = useMutation({
    // mutationFn: async ({ projectId, voteType }) => {
    //   const user = await base44.auth.me();
    //   await base44.entities.Vote.create({
    //     project_id: projectId,
    //     voter_email: user.email,
    //     vote_type: voteType,
    //     comment: comment,
    //     voting_power: user.voting_power || 1
    //   });
    //
    //   const project = projects.find(p => p.id === projectId);
    //   const newVotesCount = project.votes_count + (user.voting_power || 1);
    //
    //   await base44.entities.Project.update(projectId, {
    //     votes_count: newVotesCount,
    //     status: newVotesCount >= project.votes_needed ? 'active' : 'voting'
    //   });
    // },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voting-projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      setSelectedProject(null);
      setComment("");
    },
  });

  const hasVoted = (projectId) => {
    return myVotes.some((vote) => vote.project_id === projectId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            التصويت على المشاريع
          </h1>
          <p className="text-gray-600 text-lg">
            ساهم في اختيار المشاريع التي تستحق التمويل
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600">
                لا توجد مشاريع تحتاج للتصويت حالياً
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-blue-900 mb-2">
                          {project.name_ar}
                        </CardTitle>
                        <p className="text-gray-600">{project.company_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {project.votes_count} / {project.votes_needed} صوت
                        </Badge>
                        {project.quality_badge && (
                          <Badge className="bg-yellow-400 text-yellow-900">
                            <Award className="w-3 h-3 ml-1" />
                            جودة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {project.description_ar}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 rounded-lg p-4">
                      <div>
                        <p className="text-sm text-gray-600">المبلغ المطلوب</p>
                        <p className="text-lg font-bold text-blue-900">
                          {(project.funding_goal / 1000).toFixed(0)}k دج
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">العائد المتوقع</p>
                        <p className="text-lg font-bold text-green-700">
                          {project.return_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المدة</p>
                        <p className="text-lg font-bold text-blue-900">
                          {project.project_duration} شهر
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">القطاع</p>
                        <p className="text-lg font-bold text-blue-900">
                          {project.sector}
                        </p>
                      </div>
                    </div>

                    {hasVoted(project.id) ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-green-800 font-semibold">
                          لقد صوّت على هذا المشروع
                        </p>
                      </div>
                    ) : selectedProject === project.id ? (
                      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                        <Textarea
                          placeholder="أضف تعليقاً (اختياري)"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-24"
                        />
                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              voteMutation.mutate({
                                projectId: project.id,
                                voteType: "approve",
                              })
                            }
                            disabled={voteMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4 ml-2" />
                            موافق
                          </Button>
                          <Button
                            onClick={() =>
                              voteMutation.mutate({
                                projectId: project.id,
                                voteType: "reject",
                              })
                            }
                            disabled={voteMutation.isPending}
                            variant="destructive"
                            className="flex-1"
                          >
                            <ThumbsDown className="w-4 h-4 ml-2" />
                            رفض
                          </Button>
                          <Button
                            onClick={() => setSelectedProject(null)}
                            variant="outline"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedProject(project.id)}
                        className="w-full bg-gradient-to-r from-blue-900 to-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 ml-2" />
                        صوّت الآن
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
