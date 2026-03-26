// ════════════════════════════════════════════════════════════════════
// addWilayaToServices.js
// شغّل هذا السكريبت مرة واحدة لإضافة wilaya لكل خدمة في Firebase
// ضعه في src/ واستدعيه من أي مكان أو شغّله في console المتصفح
// ════════════════════════════════════════════════════════════════════
import { db } from "@/firebase-config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// خريطة: category → ولاية افتراضية
// عدّلها حسب موقع كل مزود خدمة حقيقي
const CATEGORY_WILAYA = {
  legal: "الجزائر",
  accounting: "وهران",
  marketing: "قسنطينة",
  hr: "سطيف",
};

export async function addWilayaToAllServices() {
  const snap = await getDocs(collection(db, "shared_services"));

  const updates = snap.docs.map(async (docSnap) => {
    const data = docSnap.data();

    // إذا كان الـ document لا يحتوي على wilaya بعد
    if (!data.wilaya) {
      const wilaya = CATEGORY_WILAYA[data.category] || "الجزائر";
      await updateDoc(doc(db, "shared_services", docSnap.id), { wilaya });
      console.log(`✓ ${data.name || docSnap.id} → ${wilaya}`);
    } else {
      console.log(
        `⏭ ${data.name || docSnap.id} already has wilaya: ${data.wilaya}`,
      );
    }
  });

  await Promise.all(updates);
  console.log("✅ All services updated with wilaya!");
}

// استدعيها هكذا في أي component:
// import { addWilayaToAllServices } from "./addWilayaToServices";
// await addWilayaToAllServices();
