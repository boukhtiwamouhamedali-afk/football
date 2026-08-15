"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { db, auth } from "@/lib/firebase";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

type Training = {
  id: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

const emptyForm = {
  day: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  notes: "",
};

export default function AdminTrainingPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [trainings, setTrainings] = useState<Training[]>([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================
     التحقق من الإدارة
  ========================= */

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

      setAuthorized(true);
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  /* =========================
     جلب التدريبات
  ========================= */

  useEffect(() => {
    if (!authorized) return;

    const trainingRef = collection(db, "training");

    const trainingQuery = query(
      trainingRef,
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      trainingQuery,
      (snapshot) => {
        const data: Training[] = snapshot.docs.map((item) => {
          const value = item.data();

          return {
            id: item.id,
            day: value.day || "",
            date: value.date || "",
            startTime: value.startTime || "",
            endTime: value.endTime || "",
            location: value.location || "",
            notes: value.notes || "",
          };
        });

        setTrainings(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("حدث خطأ أثناء تحميل التدريبات.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authorized]);

  /* =========================
     تغيير الحقول
  ========================= */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =========================
     إضافة / تعديل
  ========================= */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.day ||
      !form.date ||
      !form.startTime ||
      !form.location
    ) {
      setError("يرجى تعبئة الحقول المطلوبة.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const trainingRef = doc(
          db,
          "training",
          editingId
        );

        await updateDoc(trainingRef, {
          day: form.day,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location,
          notes: form.notes,
          updatedAt: serverTimestamp(),
        });

        setMessage("تم تعديل التدريب بنجاح.");
      } else {
        await addDoc(collection(db, "training"), {
          day: form.day,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location,
          notes: form.notes,
          createdAt: serverTimestamp(),
        });

        setMessage("تمت إضافة التدريب بنجاح.");
      }

      setForm(emptyForm);
      setEditingId(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ التدريب.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     تعديل
  ========================= */

  function handleEdit(training: Training) {
    setEditingId(training.id);

    setForm({
      day: training.day,
      date: training.date,
      startTime: training.startTime,
      endTime: training.endTime,
      location: training.location,
      notes: training.notes,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================
     إلغاء التعديل
  ========================= */

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);

    setMessage("");
    setError("");
  }

  /* =========================
     حذف
  ========================= */

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا التدريب؟"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "training", id));

      setMessage("تم حذف التدريب.");

      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حذف التدريب.");
    }
  }

  /* =========================
     تسجيل الخروج
  ========================= */

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/admin/login");
    } catch (err) {
      console.error(err);
    }
  }

  /* =========================
     التحقق
  ========================= */

  if (checking) {
    return (
      <main className="admin-loading">
        <div>
          ⚽
          <p>جاري التحقق من الحساب...</p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  /* =========================
     الصفحة
  ========================= */

  return (
    <main className="training-admin-page">

      {/* Header */}

      <header className="training-admin-header">

        <button
          className="training-back-button"
          onClick={() => router.push("/admin")}
        >
          →
        </button>

        <div>
          <h1>أوقات التدريب</h1>
          <p>إدارة مواعيد تدريبات الفريق</p>
        </div>

        <button
          className="training-logout"
          onClick={handleLogout}
        >
          خروج
        </button>

      </header>

      {/* الرسائل */}

      {message && (
        <div className="training-success">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="training-error">
          ⚠️ {error}
        </div>
      )}

      {/* نموذج التدريب */}

      <section className="training-form-card">

        <div className="training-section-title">
          <div>
            <h2>
              {editingId
                ? "✏️ تعديل التدريب"
                : "➕ إضافة تدريب"}
            </h2>

            <p>
              أدخل معلومات التدريب ثم احفظها
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* اليوم */}

          <label>
            اليوم

            <select
              name="day"
              value={form.day}
              onChange={handleChange}
            >
              <option value="">
                اختر اليوم
              </option>

              <option value="السبت">
                السبت
              </option>

              <option value="الأحد">
                الأحد
              </option>

              <option value="الإثنين">
                الإثنين
              </option>

              <option value="الثلاثاء">
                الثلاثاء
              </option>

              <option value="الأربعاء">
                الأربعاء
              </option>

              <option value="الخميس">
                الخميس
              </option>

              <option value="الجمعة">
                الجمعة
              </option>
            </select>
          </label>

          {/* التاريخ */}

          <label>
            التاريخ

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          {/* الوقت */}

          <div className="training-form-grid">

            <label>
              وقت البداية

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </label>

            <label>
              وقت النهاية

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </label>

          </div>

          {/* المكان */}

          <label>
            مكان التدريب

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="مثال: الملعب البلدي"
            />
          </label>

          {/* الملاحظات */}

          <label>
            ملاحظات

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="ملاحظات إضافية..."
              rows={4}
            />
          </label>

          {/* الأزرار */}

          <div className="training-form-actions">

            <button
              type="submit"
              className="training-save-button"
              disabled={saving}
            >
              {saving
                ? "جاري الحفظ..."
                : editingId
                ? "حفظ التعديلات"
                : "إضافة التدريب"}
            </button>

            {editingId && (
              <button
                type="button"
                className="training-cancel-button"
                onClick={cancelEdit}
              >
                إلغاء التعديل
              </button>
            )}

          </div>

        </form>

      </section>

      {/* قائمة التدريبات */}

      <section className="training-list-section">

        <div className="training-list-header">

          <h2>
            التدريبات القادمة
          </h2>

          <span>
            {trainings.length}
          </span>

        </div>

        {loading ? (
          <div className="training-loading">
            جاري تحميل التدريبات...
          </div>
        ) : trainings.length === 0 ? (
          <div className="training-empty">
            <div>🏋️</div>

            <h3>
              لا توجد تدريبات
            </h3>

            <p>
              أضف أول تدريب للفريق من النموذج أعلاه.
            </p>
          </div>
        ) : (
          <div className="training-list">

            {trainings.map((training) => (
              <article
                key={training.id}
                className="training-card"
              >

                <div className="training-card-date">

                  <strong>
                    {training.day}
                  </strong>

                  <span>
                    {training.date}
                  </span>

                </div>

                <div className="training-card-info">

                  <h3>
                    🕐 {training.startTime}

                    {training.endTime && (
                      <> - {training.endTime}</>
                    )}
                  </h3>

                  <p>
                    📍 {training.location}
                  </p>

                  {training.notes && (
                    <small>
                      📝 {training.notes}
                    </small>
                  )}

                </div>

                <div className="training-card-actions">

                  <button
                    onClick={() =>
                      handleEdit(training)
                    }
                    title="تعديل"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(training.id)
                    }
                    title="حذف"
                  >
                    🗑️
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      <footer className="training-admin-footer">
        لوحة إدارة التدريبات ⚽
      </footer>

    </main>
  );
}