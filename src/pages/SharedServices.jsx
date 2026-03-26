import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  TrendingDown,
  Users,
  CheckCircle,
  Calendar,
  X,
  Star,
  Clock,
  Award,
  DollarSign,
  Info,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPopup from "@/components/ChatPopup";

export default function SharedServices() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["shared-services"],
    queryFn: async () => {
      const servicesRef = collection(db, "shared_services");
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    initialData: [],
  });

  const handleBookNow = (service) => {
    setSelectedService(service);
    setIsChatOpen(true);
  };
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedService(null);
  };
  const handleLearnMore = (service) => {
    setModalService(service);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalService(null);
  };

  const categories = [
    { id: "all", name: "All", count: services.length },
    {
      id: "legal",
      name: "Legal",
      count: services.filter((s) => s.category === "legal").length,
    },
    {
      id: "accounting",
      name: "Accounting",
      count: services.filter((s) => s.category === "accounting").length,
    },
    {
      id: "marketing",
      name: "Marketing",
      count: services.filter((s) => s.category === "marketing").length,
    },
    {
      id: "hr",
      name: "HR",
      count: services.filter((s) => s.category === "hr").length,
    },
  ];

  const categoryColors = {
    legal: "from-blue-500 to-blue-700",
    accounting: "from-green-500 to-green-700",
    marketing: "from-pink-500 to-pink-700",
    hr: "from-orange-500 to-orange-700",
  };

  const categoryIcons = {
    legal: "⚖️",
    accounting: "💼",
    marketing: "📢",
    hr: "👥",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {/* العنوان */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  Shared Services 🏢
                </h1>
                <p className="text-slate-600 text-lg">
                  Professional services at discounted rates for members
                </p>
              </div>
            </div>

            {/* ── زر إضافة خدمة جديدة ── */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/shared-services")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all border-2 border-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              إضافة خدمة جديدة
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-slate-100">
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-indigo-600 mb-1">
                    {category.count}
                  </h3>
                  <p className="text-slate-600 text-sm font-medium">
                    {category.name}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4 font-semibold">
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <Card className="bg-white shadow-lg border-2 border-slate-100">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-slate-600 mb-6">
                No services available at the moment
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/shared-services")}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg mx-auto"
              >
                <Plus className="w-5 h-5" />
                أضف أول خدمة الآن
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 h-full border-2 border-slate-100">
                  <CardHeader
                    className={`border-b bg-gradient-to-r ${categoryColors[service.category] || "from-slate-500 to-slate-700"}`}
                  >
                    <CardTitle className="flex items-start justify-between text-white">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">
                          {service.name || service.name_en}
                        </h3>
                        <p className="text-sm text-white/90 font-normal">
                          {service.category}
                        </p>
                      </div>
                      {service.available && (
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-600 mb-1">
                        Service Provider
                      </p>
                      <p className="font-bold text-indigo-900">
                        {service.provider}
                      </p>
                    </div>
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">
                            Regular Price
                          </p>
                          <p className="text-lg font-bold text-slate-400 line-through">
                            {service.price_before?.toLocaleString()} DZD
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">
                            Member Price
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {service.price_after?.toLocaleString()} DZD
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-slate-700">
                            Exclusive Discount
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {service.discount_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <Calendar className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 font-medium">
                          {service.duration}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 font-medium">
                          {service.bookings_count} Bookings
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-yellow-500 text-lg">⭐</span>
                        <p className="text-xs text-slate-600 font-medium">
                          {service.rating}/5
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleBookNow(service)}
                        disabled={!service.available}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => handleLearnMore(service)}
                        className="border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all"
                      >
                        Learn More
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {isModalOpen && modalService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${categoryColors[modalService.category] || "from-slate-500 to-slate-700"} p-6 text-white relative`}
                >
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
                      {categoryIcons[modalService.category] || "🔧"}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">
                        {modalService.name || modalService.name_en}
                      </h2>
                      <p className="text-white/90 text-lg">
                        {modalService.provider}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                          {modalService.category}
                        </span>
                        {modalService.available && (
                          <span className="px-3 py-1 bg-green-500/30 rounded-lg text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-indigo-600" /> Service
                      Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {modalService.description}
                    </p>
                  </div>
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" /> Pricing
                      Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">
                          Regular Price
                        </p>
                        <p className="text-2xl font-bold text-slate-400 line-through">
                          {modalService.price_before?.toLocaleString()} DZD
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border-2 border-green-500">
                        <p className="text-sm text-slate-600 mb-2">
                          Member Price
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {modalService.price_after?.toLocaleString()} DZD
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">You Save</p>
                        <p className="text-3xl font-bold text-green-600">
                          {modalService.discount_percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-green-600 text-white rounded-lg text-center">
                      <p className="text-lg font-semibold">
                        Total Savings:{" "}
                        {(
                          modalService.price_before - modalService.price_after
                        ).toLocaleString()}{" "}
                        DZD
                      </p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" /> Service
                      Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: <Clock className="w-5 h-5 text-indigo-600" />,
                          label: "Duration",
                          val: modalService.duration,
                        },
                        {
                          icon: <Star className="w-5 h-5 text-yellow-500" />,
                          label: "Rating",
                          val: `${modalService.rating}/5 ⭐`,
                        },
                        {
                          icon: <Users className="w-5 h-5 text-blue-600" />,
                          label: "Total Bookings",
                          val: `${modalService.bookings_count} bookings`,
                        },
                        {
                          icon: (
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          ),
                          label: "Provider",
                          val: modalService.provider,
                        },
                      ].map(({ icon, label, val }) => (
                        <div
                          key={label}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {icon}
                            <span className="font-semibold text-slate-900">
                              {label}
                            </span>
                          </div>
                          <p className="text-slate-600 text-lg">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        handleCloseModal();
                        handleBookNow(modalService);
                      }}
                      disabled={!modalService.available}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                    >
                      Book This Service Now
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="border-2 border-slate-300 text-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <ChatPopup
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        chatData={{
          id: selectedService?.id,
          type: "service",
          title: selectedService?.name || selectedService?.name_en,
          subtitle: selectedService?.provider,
          icon: <Building2 className="w-6 h-6" />,
          metadata: {
            service_category: selectedService?.category,
            service_price_before: selectedService?.price_before,
            service_price_after: selectedService?.price_after,
            service_discount: selectedService?.discount_percentage,
            service_duration: selectedService?.duration,
            service_rating: selectedService?.rating,
          },
        }}
        collectionName="service_messages"
        welcomeMessage={
          selectedService
            ? `مرحباً! أنت الآن تتواصل معنا بخصوص خدمة "${selectedService.name || selectedService.name_en}" من ${selectedService.provider}. كيف يمكننا مساعدتك؟`
            : undefined
        }
        autoReplyMessage="شكراً لاهتمامك! سيتواصل معك فريقنا خلال 24 ساعة لمناقشة تفاصيل الخدمة وإتمام الحجز."
        autoReplyDelay={1500}
      />
    </div>
  );
}
