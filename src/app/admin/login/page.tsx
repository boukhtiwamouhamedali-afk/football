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
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  /* ========================================
     التحقق من تسجيل الدخول
  ======================================== */

  useEffect(() => {
    let mounted = true;

    async function checkRedirectLogin() {
      try {
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const user = result.user;

          if (
            user.email?.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
          ) {
            router.replace("/admin");
            return;
          }

          await signOut(auth);

          if (mounted) {
            setError(
              "هذا الحساب ليس حساب الإدارة المسموح له بالدخول."
            );
            setLoading(false);
          }

          return;
        }
      } catch (err: any) {
        console.error("REDIRECT LOGIN ERROR:", err);

        if (mounted) {
          setError(
            `حدث خطأ في تسجيل الدخول: ${
              err?.code || "unknown"
            }`
          );

          setLoading(false);
        }
      }

      if (!mounted) return;

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (!mounted) return;

          if (user) {
            if (
              user.email?.toLowerCase() ===
              ADMIN_EMAIL.toLowerCase()
            ) {
              router.replace("/admin");
              return;
            }

            signOut(auth);
          }

          setChecking(false);
        }
      );

      return unsubscribe;
    }

    checkRedirectLogin();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ========================================
     تسجيل الدخول
  ======================================== */

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      /*
        على الهاتف نستخدم Redirect
        لأنه أكثر استقرارًا من Popup.
      */

      const isMobile =
        typeof window !== "undefined" &&
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        await signInWithRedirect(
          auth,
          googleProvider
        );

        return;
      }

      /*
        الكمبيوتر يستخدم Popup
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

        setLoading(false);

        return;
      }

      router.replace("/admin");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (
        err?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "تم إغلاق نافذة تسجيل الدخول."
        );
      } else if (
        err?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "المتصفح منع نافذة Google. حاول السماح بالنوافذ المنبثقة."
        );
      } else if (
        err?.code ===
        "auth/unauthorized-domain"
      ) {
        setError(
          "الدومين غير مضاف إلى Firebase Authentication. أضف دومين موقع Netlify إلى Authorized domains."
        );
      } else if (
        err?.code ===
        "auth/operation-not-allowed"
      ) {
        setError(
          "تسجيل الدخول باستخدام Google غير مفعّل في Firebase."
        );
      } else {
        setError(
          `حدث خطأ في تسجيل الدخول: ${
            err?.code || "unknown"
          }`
        );
      }

      setLoading(false);
    }
  }

  /* ========================================
     شاشة التحقق
  ======================================== */

  if (checking) {
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            🔐
          </div>

          <h1>لوحة الإدارة</h1>

          <p>
            جاري التحقق...
          </p>
        </div>
      </main>
    );
  }

  /* ========================================
     الصفحة
  ======================================== */

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