"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

  /* =========================
     التحقق من تسجيل الدخول
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (
        user &&
        user.email?.toLowerCase() ===
          ADMIN_EMAIL.toLowerCase()
      ) {
        router.replace("/admin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* =========================
     استقبال نتيجة تسجيل الدخول
     للهاتف Redirect
  ========================= */

  useEffect(() => {
    async function checkRedirectLogin() {
      try {
        const result = await getRedirectResult(auth);

        if (!result) return;

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
        console.error(
          "REDIRECT LOGIN ERROR:",
          error
        );

        setError(
          `حدث خطأ في تسجيل الدخول: ${
            error?.code || "unknown"
          }`
        );
      }
    }

    checkRedirectLogin();
  }, [router]);

  /* =========================
     تسجيل الدخول
  ========================= */

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      /*
       * اكتشاف الهاتف
       */
      const isMobile =
        typeof window !== "undefined" &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(
          navigator.userAgent
        );

      /*
       * الهاتف:
       * استخدام Redirect بدل Popup
       */
      if (isMobile) {
        await signInWithRedirect(
          auth,
          googleProvider
        );

        return;
      }

      /*
       * الكمبيوتر:
       * استخدام Popup
       */
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
      console.error(
        "LOGIN ERROR:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "تم إغلاق نافذة تسجيل الدخول."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "تم منع نافذة Google. حاول مرة أخرى."
        );
      } else if (
        error?.code ===
        "auth/unauthorized-domain"
      ) {
        setError(
          "هذا الدومين غير مضاف إلى Firebase Authentication."
        );
      } else {
        setError(
          `حدث خطأ في تسجيل الدخول: ${
            error?.code || "unknown"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     الصفحة
  ========================= */

  return (
    <main className="admin-login">

      <div className="admin-login-card">

        <div className="admin-login-logo">
          🔐
        </div>

        <h1>
          لوحة الإدارة
        </h1>

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