"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  googleProvider,
  db,
} from "@/lib/firebase";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL =
  "boukhtiwamouhamedali@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setChecking(false);
            return;
          }

          if (
            user.email?.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
          ) {
            router.replace("/admin");
            return;
          }

          signOut(auth);
          setChecking(false);
        }
      );

    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user = result.user;

      /* التحقق من حساب الإدارة */

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

      /* إنشاء معرف للجهاز */

      let deviceId =
        localStorage.getItem(
          "football_team_device_id"
        );

      if (!deviceId) {
        deviceId =
          crypto.randomUUID();

        localStorage.setItem(
          "football_team_device_id",
          deviceId
        );
      }

      /* تسجيل الجهاز في Firestore */

      await setDoc(
        doc(
          db,
          "adminDevices",
          deviceId
        ),
        {
          uid: user.uid,
          email: user.email,
          trusted: true,
          lastLoginAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      /* الدخول إلى لوحة الإدارة */

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
          "تم إغلاق نافذة Google."
        );
      }

      else if (
        err?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع."
        );
      }

      else if (
        err?.code ===
        "auth/unauthorized-domain"
      ) {
        setError(
          "دومين Netlify غير مضاف إلى Firebase Authorized domains."
        );
      }

      else if (
        err?.code ===
        "auth/operation-not-allowed"
      ) {
        setError(
          "تسجيل الدخول باستخدام Google غير مفعّل في Firebase."
        );
      }

      else {
        setError(
          `خطأ Firebase: ${
            err?.code ||
            "unknown"
          }`
        );
      }

      setLoading(false);
    }
  }

  if (checking) {
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
            جاري التحقق...
          </p>

        </div>

      </main>
    );
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