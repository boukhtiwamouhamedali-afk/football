"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      if (
        user.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");
      setAuthorized(true);
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/admin/login");
    } catch (error) {
      console.error(error);
    }
  }

  if (checking) {
    return (
      <main className="admin-loading">
        <div className="admin-loading-icon">
          ⚽
        </div>

        <p>جاري التحقق من الحساب...</p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="admin-page">

      {/* Header */}

      <header className="admin-page-header">

        <div className="admin-header-title">

          <div className="admin-header-icon">
            ⚙️
          </div>

          <div>
            <h1>لوحة الإدارة</h1>

            <p>
              إدارة فريق كرة القدم
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          تسجيل الخروج
        </button>

      </header>

      {/* معلومات الحساب */}

      <section className="admin-account-card">

        <div className="account-avatar">
          👤
        </div>

        <div className="account-info">

          <span>
            حساب الإدارة
          </span>

          <strong>
            {email}
          </strong>

        </div>

        <div className="account-status">
          متصل
        </div>

      </section>

      {/* الترحيب */}

      <section className="admin-welcome">

        <div>
          <span className="welcome-icon">
            👋
          </span>

          <div>
            <h2>
              مرحبًا بك في لوحة الإدارة
            </h2>

            <p>
              من هنا يمكنك إدارة بيانات الفريق.
            </p>
          </div>
        </div>

      </section>

      {/* الإدارة */}

      <section className="admin-section">

        <div className="admin-section-title">

          <h2>
            إدارة الفريق
          </h2>

          <span>
            ⚽
          </span>

        </div>

        <div className="admin-actions">

          {/* اللاعبين */}

          <button
            className="admin-action-card"
            onClick={() =>
              router.push("/admin/players")
            }
          >

            <div className="admin-action-icon">
              👥
            </div>

            <div className="admin-action-content">

              <strong>
                إدارة اللاعبين
              </strong>

              <small>
                إضافة وتعديل وحذف اللاعبين
              </small>

            </div>

            <span className="admin-action-arrow">
              ←
            </span>

          </button>

          {/* التشكيلة */}

          <button
            className="admin-action-card"
            onClick={() =>
              router.push("/admin/lineup")
            }
          >

            <div className="admin-action-icon">
              ⚽
            </div>

            <div className="admin-action-content">

              <strong>
                إدارة التشكيلة
              </strong>

              <small>
                الأساسيون والاحتياط
              </small>

            </div>

            <span className="admin-action-arrow">
              ←
            </span>

          </button>

          {/* أوقات التدريب */}

          <button
            className="admin-action-card"
            onClick={() =>
              router.push("/admin/training")
            }
          >

            <div className="admin-action-icon">
              🕐
            </div>

            <div className="admin-action-content">

              <strong>
                أوقات التدريب
              </strong>

              <small>
                إضافة وتعديل مواعيد التدريب
              </small>

            </div>

            <span className="admin-action-arrow">
              ←
            </span>

          </button>

          {/* إعدادات الفريق */}

          <button
            className="admin-action-card"
            onClick={() =>
              router.push("/admin/settings")
            }
          >

            <div className="admin-action-icon">
              ⚙️
            </div>

            <div className="admin-action-content">

              <strong>
                إعدادات الفريق
              </strong>

              <small>
                الاسم والشعار والمعلومات العامة
              </small>

            </div>

            <span className="admin-action-arrow">
              ←
            </span>

          </button>

        </div>

      </section>

      {/* حالة النظام */}

      <section className="admin-section">

        <div className="admin-section-title">

          <h2>
            حالة النظام
          </h2>

          <span>
            📊
          </span>

        </div>

        <div className="admin-status-grid">

          <div className="admin-status-card">

            <div>
              <span className="status-dot" />

              <strong>
                تسجيل الدخول
              </strong>
            </div>

            <small>
              يعمل
            </small>

          </div>

          <div className="admin-status-card">

            <div>
              <span className="status-dot" />

              <strong>
                Firestore
              </strong>
            </div>

            <small>
              متصل
            </small>

          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="admin-footer">
        لوحة إدارة الفريق ⚽
      </footer>

    </main>
  );
}