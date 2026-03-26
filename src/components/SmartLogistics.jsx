import { useState, useEffect, useRef } from "react";
import { MapPin, Truck } from "lucide-react";

const SmartLogistics = () => {
  const [activeTab, setActiveTab] = useState("map");
  const [shipments, setShipments] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layersGroupRef = useRef(null);

  // مواقع المستودعات في الجزائر
  const warehouseLocations = [
    { id: "w1", name: "الجزائر العاصمة", lat: 36.7372, lng: 3.0869 },
    { id: "w2", name: "وهران", lat: 35.7325, lng: -0.6338 },
    { id: "w3", name: "قسنطينة", lat: 36.3765, lng: 6.6146 },
  ];

  // نقاط التسليم في الجزائر
  const deliveryPoints = [
    { id: "d1", name: "البليدة", lat: 36.5081, lng: 2.827 },
    { id: "d2", name: "تيبازة", lat: 36.5623, lng: 2.4347 },
    { id: "d3", name: "الشلف", lat: 36.1889, lng: 1.325 },
    { id: "d4", name: "سوق أهراس", lat: 35.1886, lng: 7.5614 },
  ];

  // تحميل Leaflet
  useEffect(() => {
    const loadLeaflet = () => {
      // تحميل CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(link);
      }

      // تحميل JS
      if (!window.L) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.onload = () => {
          setTimeout(() => initMap(), 100);
        };
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    if (mapRef.current && !leafletMapRef.current) {
      loadLeaflet();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // تهيئة الخريطة
  const initMap = () => {
    if (!window.L || !mapRef.current || leafletMapRef.current) return;

    try {
      leafletMapRef.current = window.L.map(mapRef.current, {
        center: [36.7372, 3.0869],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(leafletMapRef.current);

      // إنشاء مجموعة طبقات
      layersGroupRef.current = window.L.layerGroup().addTo(
        leafletMapRef.current
      );

      updateMapMarkers();
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // تحديث العلامات على الخريطة
  const updateMapMarkers = () => {
    if (!leafletMapRef.current || !window.L || !layersGroupRef.current) return;

    try {
      // مسح الطبقات القديمة
      layersGroupRef.current.clearLayers();

      // أيقونة المستودع
      const warehouseIcon = window.L.divIcon({
        html: '<div style="background:#10b981;width:30px;height:30px;border-radius:50%;border:3px solid #065f46;display:flex;align-items:center;justify-content:center;font-size:16px;">🏭</div>',
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // أيقونة نقطة التسليم
      const deliveryIcon = window.L.divIcon({
        html: '<div style="background:#f59e0b;width:25px;height:25px;border-radius:50%;border:2px solid #b45309;display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>',
        className: "",
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5],
      });

      // إضافة علامات المستودعات
      warehouseLocations.forEach((warehouse) => {
        const marker = window.L.marker([warehouse.lat, warehouse.lng], {
          icon: warehouseIcon,
          title: warehouse.name,
        });

        marker.bindPopup(`
          <div style="padding:10px;font-family:Arial;text-align:center;">
            <strong style="color:#10b981;font-size:16px;">مستودع</strong><br/>
            <span style="color:#374151;font-size:14px;">${warehouse.name}</span>
          </div>
        `);

        layersGroupRef.current.addLayer(marker);
      });

      // إضافة علامات نقاط التسليم
      deliveryPoints.forEach((point) => {
        const marker = window.L.marker([point.lat, point.lng], {
          icon: deliveryIcon,
          title: point.name,
        });

        marker.bindPopup(`
          <div style="padding:10px;font-family:Arial;text-align:center;">
            <strong style="color:#f59e0b;font-size:16px;">نقطة تسليم</strong><br/>
            <span style="color:#374151;font-size:14px;">${point.name}</span>
          </div>
        `);

        layersGroupRef.current.addLayer(marker);
      });

      // إضافة مسارات وشاحنات
      if (shipments.length > 0) {
        shipments.forEach((ship) => {
          // التحقق من صحة البيانات
          if (
            !ship.from ||
            !ship.to ||
            typeof ship.from.lat !== "number" ||
            typeof ship.from.lng !== "number" ||
            typeof ship.to.lat !== "number" ||
            typeof ship.to.lng !== "number"
          ) {
            return;
          }

          // رسم المسار
          const latlngs = [
            [ship.from.lat, ship.from.lng],
            [ship.to.lat, ship.to.lng],
          ];

          const polyline = window.L.polyline(latlngs, {
            color: ship.status === "delivered" ? "#10b981" : "#3b82f6",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
            smoothFactor: 1,
          });

          layersGroupRef.current.addLayer(polyline);

          // موقع الشاحنة
          const progress = ship.progress / 100;
          const truckLat =
            ship.from.lat + (ship.to.lat - ship.from.lat) * progress;
          const truckLng =
            ship.from.lng + (ship.to.lng - ship.from.lng) * progress;

          const truckIcon = window.L.divIcon({
            html: `<div style="background:${
              ship.status === "delivered" ? "#22c55e" : "#3b82f6"
            };width:25px;height:25px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🚚</div>`,
            className: "",
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5],
          });

          const truckMarker = window.L.marker([truckLat, truckLng], {
            icon: truckIcon,
            title: ship.truck,
          });

          truckMarker.bindPopup(`
            <div style="padding:12px;font-family:Arial;min-width:200px;">
              <strong style="color:#3b82f6;font-size:16px;">${ship.truck}</strong><br/>
              <span style="color:#6b7280;font-size:13px;">من: ${ship.from.name}</span><br/>
              <span style="color:#6b7280;font-size:13px;">إلى: ${ship.to.name}</span><br/>
              <div style="margin-top:10px;">
                <div style="background:#e5e7eb;border-radius:10px;height:10px;width:100%;overflow:hidden;">
                  <div style="background:#10b981;border-radius:10px;height:10px;width:${ship.progress}%;transition:width 0.3s;"></div>
                </div>
                <span style="color:#059669;font-weight:bold;font-size:14px;margin-top:5px;display:block;">${ship.progress}% مكتمل</span>
              </div>
            </div>
          `);

          layersGroupRef.current.addLayer(truckMarker);
        });
      }
    } catch (error) {
      console.error("Error updating markers:", error);
    }
  };

  // توليد الشحنات العشوائية
  const generateShipments = () => {
    const newShipments = [];
    for (let i = 0; i < 6; i++) {
      const source =
        warehouseLocations[
          Math.floor(Math.random() * warehouseLocations.length)
        ];
      const dest =
        deliveryPoints[Math.floor(Math.random() * deliveryPoints.length)];

      newShipments.push({
        id: `ship_${i}`,
        from: source,
        to: dest,
        status: "in_transit",
        progress: 0,
        truck: `شاحنة-${i + 1}`,
        items: Math.floor(Math.random() * 50) + 10,
        weight: Math.floor(Math.random() * 8) + 2,
      });
    }
    return newShipments;
  };

  const startSimulation = () => {
    setIsRunning(true);
    setShipments(generateShipments());
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setShipments([]);
  };

  // تحديث تقدم الشحنات
  useEffect(() => {
    if (!isRunning || shipments.length === 0) return;

    const interval = setInterval(() => {
      setShipments((prev) =>
        prev.map((ship) => ({
          ...ship,
          progress: Math.min(ship.progress + 0.5, 100),
          status: ship.progress >= 100 ? "delivered" : "in_transit",
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, shipments]);

  // تحديث الخريطة عند تغيير الشحنات
  useEffect(() => {
    if (
      leafletMapRef.current &&
      layersGroupRef.current &&
      shipments.length > 0
    ) {
      updateMapMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments]);

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl min-h-screen">
      {/* الهيدر */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚚 نظام اللوجستيات الذكية
        </h1>
        <p className="text-gray-600">
          تتبع الشحنات في الوقت الفعلي عبر الجزائر
        </p>
      </div>

      {/* زر التحكم */}
      {!isRunning ? (
        <button
          onClick={startSimulation}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <span className="text-2xl">▶️</span>
          RUN
        </button>
      ) : (
        <button
          onClick={stopSimulation}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <span className="text-2xl">⏹️</span>
          STOP
        </button>
      )}

      {/* التابات */}
      {shipments.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === "map"
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 shadow"
            }`}
          >
            🗺️ MAP
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === "stats"
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 shadow"
            }`}
          >
            📊 الإحصائيات التفصيلية
          </button>
        </div>
      )}

      {/* عرض الخريطة */}
      {activeTab === "map" && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-emerald-200 overflow-hidden relative">
          <div
            ref={mapRef}
            style={{ width: "100%", height: "500px" }}
            className="rounded-xl z-10"
          />
          {shipments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-20 rounded-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-500 text-lg">
                  ابدأ المحاكاة لعرض الخريطة التفاعلية
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* عرض الإحصائيات */}
      {activeTab === "stats" && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {shipments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">
                ابدأ المحاكاة لعرض إحصائيات الشحنات
              </p>
            </div>
          ) : (
            shipments.map((ship) => (
              <div
                key={ship.id}
                className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Truck
                        className="text-emerald-600"
                        size={24}
                      />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-gray-900">
                        {ship.truck}
                      </h5>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} /> {ship.from.name} → {ship.to.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-bold shadow ${
                      ship.status === "delivered"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    }`}
                  >
                    {ship.status === "delivered"
                      ? "✓ تم التسليم"
                      : "🚚 في الطريق"}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-semibold">التقدم</span>
                    <span className="font-bold text-emerald-600">
                      {ship.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-green-500 to-blue-500 h-4 rounded-full transition-all duration-500 shadow"
                      style={{ width: `${ship.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 text-center shadow">
                    <p className="text-gray-600 mb-1 font-semibold">البنود</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {ship.items}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 text-center shadow">
                    <p className="text-gray-600 mb-1 font-semibold">الوزن</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {ship.weight}T
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 text-center shadow">
                    <p className="text-gray-600 mb-1 font-semibold">
                      الوقت المتبقي
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {Math.round((100 - ship.progress) * 2)}د
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center shadow">
                    <p className="text-gray-600 mb-1 font-semibold">الحالة</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {ship.progress.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ملخص الإحصائيات */}
      {shipments.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-gray-600 mb-2 font-semibold">
              إجمالي الشحنات
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {shipments.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-gray-600 mb-2 font-semibold">
              تم التسليم
            </p>
            <p className="text-3xl font-bold text-green-600">
              {shipments.filter((s) => s.status === "delivered").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-gray-600 mb-2 font-semibold">
              في الطريق
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {shipments.filter((s) => s.status === "in_transit").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-gray-600 mb-2 font-semibold">الكفاءة</p>
            <p className="text-3xl font-bold text-emerald-600">94%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartLogistics;
