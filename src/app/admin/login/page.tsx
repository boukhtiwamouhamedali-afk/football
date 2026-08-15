"use client";

import {
  onAuthStateChanged,
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


  /* =========================================
     CHECK LOGIN
  ========================================= */

  useEffect(() => {
    let active = true;

    async function checkLogin() {
      try {
        /*
          أول شيء ننتظر نتيجة Google Redirect
        */

        const result = await getRedirectResult(auth);

        if (!active) return;

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

          setError(
            "هذا الحساب ليس حساب الإدارة المسموح له بالدخول."
          );

          setLoading(false);

          return;
        }

        /*
          إذا ما في Redirect Result
          نفحص حالة Firebase الحالية
        */

        const unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (!active) return;

            if (user) {
              if (
                user.email?.toLowerCase() ===
                ADMIN_EMAIL.toLowerCase()
              ) {
                router.replace("/admin");
                return;
              }

              await signOut(auth);

              setError(
                "هذا الحساب ليس حساب الإدارة المسموح له بالدخول."
              );
            }
          }
        );

        return unsubscribe;

      } catch (err: any) {
        console.error(
          "FIREBASE REDIRECT ERROR:",
          err
        );

        if (!active) return;

        setError(
          `خطأ Firebase: ${
            err?.code || "unknown"
          }`
        );

        setLoading(false);
      }
    }

    checkLogin();

    return () => {
      active = false;
    };
  }, [router]);


  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError("");

      /*
        نستخدم Redirect بدل Popup
        لأنه أفضل على الهاتف.
      */

      await signInWithRedirect(
        auth,
        googleProvider
      );

    } catch (err: any) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        err
      );

      setLoading(false);

      setError(
        `خطأ Firebase: ${
          err?.code || "unknown"
        }`
      );
    }
  }


  /* =========================================
     PAGE
  ========================================= */

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