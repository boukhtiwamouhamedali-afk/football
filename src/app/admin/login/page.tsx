"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (
        user &&
        user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ) {
        router.replace("/admin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      if (
        user.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        setError(
          "هذا الحساب ليس حساب الإدارة المسموح له بالدخول."
        );

        return;
      }

      router.replace("/admin");

    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      if (error?.code === "auth/popup-closed-by-user") {
        setError("تم إغلاق نافذة تسجيل الدخول.");
      } else if (
        error?.code === "auth/popup-blocked"
      ) {
        setError(
          "Chrome منع نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع."
        );
      } else {
        setError(
          `حدث خطأ في تسجيل الدخول: ${error?.code || "unknown"}`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">

      <div className="admin-login-card">

        <div className="admin-login-logo">
          🔐
        </div>

        <h1>لوحة الإدارة</h1>

        <p>
          سجّل الدخول بحساب Google الخاص بالإدارة
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-login-button"
        >
          <span className="google-icon">
            G
          </span>

          {loading
            ? "جاري تسجيل الدخول..."
            : "تسجيل الدخول باستخدام Google"}
        </button>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <a
          href="/"
          className="login-back"
        >
          ← العودة إلى الصفحة الرئيسية
        </a>

      </div>

    </main>
  );
}