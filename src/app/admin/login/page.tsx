"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  GoogleAuthProvider,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL =
  "boukhtiwamouhamedali@gmail.com";

const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) return;

          const email =
            user.email?.toLowerCase();

          if (
            email ===
            ADMIN_EMAIL.toLowerCase()
          ) {
            router.replace("/admin");
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user = result.user;

      const email =
        user.email?.toLowerCase();

      if (
        email !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        setError(
          "هذا الحساب ليس حساب الإدارة المسموح له بالدخول."
        );

        return;
      }

      router.replace("/admin");

    } catch (err: any) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        err
      );

      const code =
        err?.code || "";

      if (
        code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "تم إغلاق نافذة تسجيل الدخول."
        );

      } else if (
        code ===
        "auth/popup-blocked"
      ) {
        setError(
          "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع."
        );

      } else if (
        code ===
        "auth/unauthorized-domain"
      ) {
        setError(
          "دومين الموقع غير مضاف إلى Firebase Authentication."
        );

      } else if (
        code ===
        "auth/operation-not-supported-in-this-environment"
      ) {
        setError(
          "تسجيل الدخول بهذه الطريقة غير مدعوم في هذا المتصفح."
        );

      } else if (
        code ===
        "auth/network-request-failed"
      ) {
        setError(
          "حدثت مشكلة في الاتصال بالإنترنت."
        );

      } else {
        setError(
          `حدث خطأ في تسجيل الدخول: ${
            code || "unknown"
          }`
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

        <h1>
          لوحة الإدارة
        </h1>

        <p>
          سجّل الدخول بحساب Google
          الخاص بالإدارة
        </p>

        <button
          type="button"
          onClick={
            handleGoogleLogin
          }
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
            ⚠️ {error}
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