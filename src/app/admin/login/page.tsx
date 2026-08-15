"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
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
      onAuthStateChanged(auth, (user) => {

        if (!user) {
          return;
        }

        const email =
          user.email?.toLowerCase();

        if (
          email ===
          ADMIN_EMAIL.toLowerCase()
        ) {
          router.replace("/admin");
        }
      });

    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin() {

    if (loading) {
      return;
    }

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

      console.log(
        "GOOGLE USER:",
        user.email
      );

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

      console.error(
        "ERROR CODE:",
        err?.code
      );

      console.error(
        "ERROR MESSAGE:",
        err?.message
      );

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
          "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة."
        );

      } else if (
        err?.code ===
        "auth/unauthorized-domain"
      ) {

        setError(
          "دومين الموقع غير مضاف إلى Firebase."
        );

      } else if (
        err?.code ===
        "auth/argument-error"
      ) {

        setError(
          "هناك خطأ في إعداد Firebase Authentication. تأكد من إعداد Google كمزوّد تسجيل دخول."
        );

      } else if (
        err?.code ===
        "auth/network-request-failed"
      ) {

        setError(
          "حدث خطأ في الاتصال بالإنترنت."
        );

      } else {

        setError(
          `حدث خطأ في تسجيل الدخول: ${
            err?.code || "unknown"
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