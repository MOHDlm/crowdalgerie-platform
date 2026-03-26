import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ دخول تلقائي عند تحميل الصفحة
  useEffect(() => {
    const autoLogin = async () => {
      const testEmail = "test@example.com";
      const testPassword = "123456";

      setEmail(testEmail);
      setPassword(testPassword);
      setLoading(true);

      try {
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        navigate("/");
      } catch (err) {
        console.error("فشل الدخول التلقائي:", err);
        setError("فشل الدخول التلقائي، يرجى تسجيل الدخول يدوياً");
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("تم إنشاء الحساب بنجاح! سيتم تحويلك للصفحة الرئيسية");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("تم تسجيل الدخول بنجاح!");
      }
      navigate("/");
    } catch (err) {
      console.error("خطأ:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مسجل بالفعل");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)");
      } else if (err.code === "auth/user-not-found") {
        setError("البريد الإلكتروني غير موجود");
      } else if (err.code === "auth/wrong-password") {
        setError("كلمة المرور غير صحيحة");
      } else if (err.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صحيح");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-blue-900 mb-2">
            CrowdAlgerie
          </CardTitle>
          <p className="text-center text-gray-600 mb-6">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold py-2"
            >
              {loading
                ? "جاري التحميل..."
                : isSignUp
                  ? "إنشاء حساب"
                  : "تسجيل الدخول"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {isSignUp
                  ? "لديك حساب بالفعل؟ سجل دخول"
                  : "ليس لديك حساب؟ أنشئ واحد"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
