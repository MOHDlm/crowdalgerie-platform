import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db, auth } from "@/firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Vote,
  CheckCircle,
  Users,
  Calendar,
  Eye,
  ThumbsUp,
  AlertCircle,
  X,
  Loader2,
  MessageSquare,
  Send,
  Clock,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DecisionMaking() {
  const navigate = useNavigate();
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [alreadyVotedError, setAlreadyVotedError] = useState(false);
  const [votingError, setVotingError] = useState(null);

  // Fetch discussions
  const { data: discussions = [] } = useQuery({
    queryKey: ["decision-discussions"],
    queryFn: async () => {
      try {
        const discussionsRef = collection(db, "decision_discussions");
        const snapshot = await getDocs(discussionsRef);
        return snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            message: data.message || "",
            userName: data.userName || "User",
            userId: data.userId || "",
            timestamp: data.timestamp
              ? new Date(data.timestamp.seconds * 1000)
              : new Date(),
            decisionId: data.decisionId || "general",
          };
        });
      } catch (error) {
        console.error("Error fetching discussions:", error);
        return [];
      }
    },
    refetchInterval: 3000,
  });

  // Fetch active decisions
  const {
    data: decisions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["consortium-decisions"],
    queryFn: async () => {
      try {
        const decisionsRef = collection(db, "consortium_decisions");
        const q = query(decisionsRef, where("status", "==", "active"));
        const snapshot = await getDocs(q);
        const decisionsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let deadlineString = "";
          if (data.deadline) {
            if (typeof data.deadline === "string") {
              deadlineString = data.deadline;
            } else if (data.deadline.seconds) {
              deadlineString = new Date(
                data.deadline.seconds * 1000,
              ).toLocaleDateString();
            } else if (data.deadline instanceof Date) {
              deadlineString = data.deadline.toLocaleDateString();
            }
          }
          return {
            id: docSnap.id,
            title: data.title || "",
            description: data.description || "",
            priority: data.priority || "medium",
            category: data.category || "General",
            deadline: deadlineString || "",
            status: data.status || "active",
            impact: data.impact || "",
            proposedBy: data.proposedBy || "",
            votesFor: data.votesFor || 0,
            votesAgainst: data.votesAgainst || 0,
            abstain: data.abstain || 0,
            totalVotes: data.totalVotes || 0,
            votes: data.votes || [],
            votedUsers: data.votedUsers || [],
          };
        });
        const currentUser = auth.currentUser;
        if (currentUser) {
          const votesObj = {};
          for (const decision of decisionsData) {
            const userVoteRecord = decision.votes.find(
              (v) => v.userId === currentUser.uid,
            );
            if (userVoteRecord) votesObj[decision.id] = userVoteRecord.vote;
          }
          setUserVotes(votesObj);
        }
        return decisionsData;
      } catch (error) {
        console.error("Error fetching decisions:", error);
        return [];
      }
    },
    refetchInterval: 5000,
  });

  const handleVote = async (voteType) => {
    if (!selectedDecision || !auth.currentUser) {
      setVotingError("User not authenticated");
      return;
    }
    const currentUser = auth.currentUser;
    const decisionId = selectedDecision.id;
    const hasUserVoted = selectedDecision.votedUsers?.includes(currentUser.uid);
    if (hasUserVoted) {
      setAlreadyVotedError(true);
      setTimeout(() => setAlreadyVotedError(false), 3000);
      return;
    }
    setIsVoting(true);
    setVotingError(null);
    try {
      const decisionRef = doc(db, "consortium_decisions", decisionId);
      const voteObject = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        vote: voteType,
        timestamp: Timestamp.now(),
      };
      const batch = writeBatch(db);
      const newVotesFor =
        voteType === "for"
          ? (selectedDecision.votesFor || 0) + 1
          : selectedDecision.votesFor || 0;
      const newVotesAgainst =
        voteType === "against"
          ? (selectedDecision.votesAgainst || 0) + 1
          : selectedDecision.votesAgainst || 0;
      const newAbstain =
        voteType === "abstain"
          ? (selectedDecision.abstain || 0) + 1
          : selectedDecision.abstain || 0;
      const newTotalVotes = newVotesFor + newVotesAgainst + newAbstain;
      batch.update(decisionRef, {
        votes: [...(selectedDecision.votes || []), voteObject],
        votedUsers: [...(selectedDecision.votedUsers || []), currentUser.uid],
        votesFor: newVotesFor,
        votesAgainst: newVotesAgainst,
        abstain: newAbstain,
        totalVotes: newTotalVotes,
        lastUpdated: Timestamp.now(),
      });
      await batch.commit();
      setUserVotes((prev) => ({ ...prev, [decisionId]: voteType }));
      setSelectedDecision((prev) => ({
        ...prev,
        votesFor: newVotesFor,
        votesAgainst: newVotesAgainst,
        abstain: newAbstain,
        totalVotes: newTotalVotes,
        votedUsers: [...(prev.votedUsers || []), currentUser.uid],
        votes: [...(prev.votes || []), voteObject],
      }));
      setVoteSubmitted(true);
      setTimeout(() => {
        setVoteSubmitted(false);
        setShowVoteModal(false);
      }, 2000);
      setTimeout(() => refetch(), 500);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setVotingError(
        error.message || "Failed to submit vote. Please try again.",
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !auth.currentUser) return;
    setIsSendingMessage(true);
    try {
      await addDoc(collection(db, "decision_discussions"), {
        message: chatMessage,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        decisionId: selectedDecision?.id || "general",
      });
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getPercentage = (votes, total) =>
    total > 0 ? Math.round((votes / total) * 100) : 0;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "from-red-500 to-orange-500";
      case "medium":
        return "from-yellow-500 to-amber-500";
      case "low":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-slate-500 to-gray-500";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 flex items-center justify-center pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">
            Loading decisions...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Vote className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Decision Making 🗳️</h1>
                <p className="text-orange-50 mt-2 text-lg">
                  Participate in strategic decisions that shape the consortium
                </p>
              </div>
            </div>

            {/* ── زر إنشاء مقترح جديد ── */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-proposal")}
              className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-50 transition-all border-2 border-white/50 text-base"
            >
              <Plus className="w-5 h-5" />
              إنشاء مقترح جديد
            </motion.button>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Vote className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">
                      Active Decisions
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {decisions.length}
                    </p>
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
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">
                      Your Votes Cast
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {Object.keys(userVotes).length}
                    </p>
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
            <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">
                      Your Rights
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">
                      One vote per decision only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Decisions Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Active Decisions
            </h2>
            <div className="flex items-center gap-3">
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold">
                {decisions.length} Items
              </span>
              {/* Second create button - smaller, near list */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-proposal")}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                مقترح جديد
              </motion.button>
            </div>
          </div>

          {decisions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {decisions.map((decision, index) => {
                  const hasUserVoted = decision.votedUsers?.includes(
                    auth.currentUser?.uid,
                  );
                  return (
                    <motion.div
                      key={decision.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedDecision(decision)}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`border-2 transition-all hover:shadow-2xl overflow-hidden ${
                          selectedDecision?.id === decision.id
                            ? "border-orange-500 shadow-2xl scale-[1.02]"
                            : "border-slate-200 hover:border-orange-300"
                        }`}
                      >
                        <div
                          className={`h-2 bg-gradient-to-r ${getPriorityColor(decision.priority)}`}
                        />
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-xl font-bold text-slate-800 flex-1">
                                {decision.title}
                              </h3>
                              <div className="flex flex-col gap-2 items-end">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(decision.priority)}`}
                                >
                                  {decision.priority?.toUpperCase() || "NORMAL"}
                                </span>
                                {hasUserVoted && (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-300">
                                    <CheckCircle className="w-3 h-3" /> Voted
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {decision.description}
                            </p>
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-3 border border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">
                                  Voting Progress
                                </span>
                                <span className="text-lg font-bold text-slate-800">
                                  {decision.totalVotes || 0} votes
                                </span>
                              </div>
                              <div className="flex gap-1 h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${getPercentage(decision.votesFor || 0, decision.totalVotes || 1)}%`,
                                  }}
                                  transition={{ duration: 0.5 }}
                                  className="bg-gradient-to-r from-green-400 to-green-600"
                                />
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${getPercentage(decision.votesAgainst || 0, decision.totalVotes || 1)}%`,
                                  }}
                                  transition={{ duration: 0.5 }}
                                  className="bg-gradient-to-r from-red-400 to-red-600"
                                />
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${getPercentage(decision.abstain || 0, decision.totalVotes || 1)}%`,
                                  }}
                                  transition={{ duration: 0.5 }}
                                  className="bg-gradient-to-r from-slate-300 to-slate-500"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <ThumbsUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">
                                      For
                                    </span>
                                  </div>
                                  <p className="text-lg font-bold text-green-600">
                                    {decision.votesFor || 0}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    {getPercentage(
                                      decision.votesFor || 0,
                                      decision.totalVotes || 1,
                                    )}
                                    %
                                  </p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                    <span className="text-xs font-medium text-red-700">
                                      Against
                                    </span>
                                  </div>
                                  <p className="text-lg font-bold text-red-600">
                                    {decision.votesAgainst || 0}
                                  </p>
                                  <p className="text-xs text-red-600">
                                    {getPercentage(
                                      decision.votesAgainst || 0,
                                      decision.totalVotes || 1,
                                    )}
                                    %
                                  </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Eye className="w-3 h-3 text-slate-600" />
                                    <span className="text-xs font-medium text-slate-700">
                                      Abstain
                                    </span>
                                  </div>
                                  <p className="text-lg font-bold text-slate-600">
                                    {decision.abstain || 0}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {getPercentage(
                                      decision.abstain || 0,
                                      decision.totalVotes || 1,
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span>
                                  {decision.deadline || "No deadline"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span>{decision.category || "General"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span>Active</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDecision(decision);
                                setShowVoteModal(true);
                              }}
                              disabled={hasUserVoted}
                              className={`w-full py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                                hasUserVoted
                                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                                  : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                              }`}
                            >
                              <Vote className="w-5 h-5" />
                              {hasUserVoted
                                ? "Already Voted"
                                : "Cast Your Vote"}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-2 border-slate-200">
              <CardContent className="p-12 text-center">
                <Vote className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-xl text-slate-600 font-medium mb-6">
                  No active decisions at the moment
                </p>
                {/* Empty state CTA */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/create-proposal")}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  كن أول من يُنشئ مقترحاً
                </motion.button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Voting Modal */}
        <AnimatePresence>
          {showVoteModal && selectedDecision && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isVoting && setShowVoteModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <Card className="border-2 border-orange-300 shadow-2xl max-w-2xl w-full">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Vote className="w-6 h-6 text-orange-600" /> Cast Your
                        Vote - One Time Only
                      </CardTitle>
                      <button
                        type="button"
                        onClick={() => setShowVoteModal(false)}
                        disabled={isVoting}
                        className="text-slate-600 hover:text-slate-800 disabled:opacity-50 p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {alreadyVotedError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span>You have already voted on this decision!</span>
                      </motion.div>
                    )}
                    {votingError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span>{votingError}</span>
                      </motion.div>
                    )}
                    {voteSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                          }}
                        >
                          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        </motion.div>
                        <h4 className="text-2xl font-bold text-slate-800 mb-2">
                          Vote Recorded! ✓
                        </h4>
                        <p className="text-slate-600">
                          Your vote has been successfully stored in the
                          database. You cannot change it.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-slate-700 font-semibold">
                            {selectedDecision.title}
                          </p>
                          <p className="text-xs text-orange-600 mt-2 font-semibold">
                            ⚠️ Warning: You can only vote once. Choose
                            carefully!
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              type: "for",
                              label: "Vote For",
                              sub: "Support this decision",
                              icon: ThumbsUp,
                              cls: "border-green-500 hover:bg-green-50",
                              iconCls: "text-green-600",
                            },
                            {
                              type: "abstain",
                              label: "Abstain",
                              sub: "Neutral position",
                              icon: Eye,
                              cls: "border-slate-400 hover:bg-slate-50",
                              iconCls: "text-slate-600",
                            },
                            {
                              type: "against",
                              label: "Vote Against",
                              sub: "Oppose decision",
                              icon: AlertCircle,
                              cls: "border-red-500 hover:bg-red-50",
                              iconCls: "text-red-600",
                            },
                          ].map((btn) => {
                            const Icon = btn.icon;
                            return (
                              <motion.button
                                key={btn.type}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleVote(btn.type)}
                                disabled={isVoting}
                                className={`p-6 border-2 ${btn.cls} rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                              >
                                {isVoting ? (
                                  <Loader2
                                    className={`w-10 h-10 ${btn.iconCls} mx-auto mb-3 animate-spin`}
                                  />
                                ) : (
                                  <Icon
                                    className={`w-10 h-10 ${btn.iconCls} mx-auto mb-3 group-hover:scale-110 transition-transform`}
                                  />
                                )}
                                <p className="font-bold text-slate-800 text-lg">
                                  {btn.label}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {btn.sub}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowVoteModal(false)}
                          disabled={isVoting}
                          className="w-full bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Group Chat */}
      <motion.div
        initial={{ y: 280 }}
        animate={{ y: isChatExpanded ? 0 : 280 }}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.5 }}
        onMouseEnter={() => setIsChatExpanded(true)}
        onMouseLeave={() => setIsChatExpanded(false)}
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-2xl z-40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isChatExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  Group Discussion
                  <motion.span
                    animate={{ y: isChatExpanded ? -2 : 2 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs bg-white/20 px-2 py-0.5 rounded"
                  >
                    {isChatExpanded ? "Expanded" : "Hover to expand"}
                  </motion.span>
                </h3>
                <p className="text-blue-100 text-xs">
                  {discussions.length} messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-white text-sm font-medium ml-2">
                12 online
              </span>
            </div>
          </div>
          <div className="h-48 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-3 space-y-2">
            {discussions.length > 0 ? (
              discussions.slice(-5).map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-800">
                        {msg.userName || "User"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {msg.timestamp instanceof Date
                          ? msg.timestamp.toLocaleTimeString()
                          : "Now"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{msg.message}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">
                  No messages yet. Start the discussion!
                </p>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isSendingMessage)
                    handleSendMessage();
                }}
                placeholder={
                  isChatExpanded
                    ? "Type your message here..."
                    : "Type your message..."
                }
                disabled={isSendingMessage}
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-all"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isSendingMessage}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                {isSendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
