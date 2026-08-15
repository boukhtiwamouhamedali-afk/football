"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

const initialForm = {
  name: "",
  number: "",
  position: "مهاجم",
  imageUrl: "",
  rating: "",
  pac: "",
  sho: "",
  pas: "",
  dri: "",
  def: "",
  phy: "",
};

export default function AdminPlayersPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

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

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      await addDoc(collection(db, "players"), {
        name: form.name.trim(),
        number: Number(form.number),
        position: form.position,
        imageUrl: form.imageUrl.trim(),

        rating: Number(form.rating),
        pac: Number(form.pac),
        sho: Number(form.sho),
        pas: Number(form.pas),
        dri: Number(form.dri),
        def: Number(form.def),
        phy: Number(form.phy),

        createdAt: serverTimestamp(),
      });

      setForm(initialForm);
      setMessage("تمت إضافة اللاعب بنجاح ✅");
    } catch (error) {
      console.error(error);
      setMessage(
        "تعذر حفظ اللاعب. تأكد من صلاحيات Firestore."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="admin-loading">
        <p>جاري التحقق من الحساب...</p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="admin-page">

      <header className="admin-page-header">
        <div>
          <span>👥</span>
          <h1>إدارة اللاعبين</h1>
        </div>

        <button
          onClick={() => router.push("/admin")}
          className="logout-button"
        >
          ← العودة
        </button>
      </header>

      <section className="player-form-card">

        <div className="form-title">
          <div>
            <h2>إضافة لاعب جديد</h2>
            <p>
              أضف معلومات اللاعب وإحصائياته.
            </p>
          </div>
        </div>

        <form onSubmit={addPlayer}>

          {/* الصورة */}

          <div className="player-image-section">

            <div className="player-image-preview">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="معاينة اللاعب"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span>👤</span>
              )}
            </div>

            <div className="image-input-area">
              <label>
                صورة اللاعب
              </label>

              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) =>
                  updateField(
                    "imageUrl",
                    e.target.value
                  )
                }
                placeholder="ضع رابط صورة اللاعب هنا"
              />

              <small>
                ستظهر معاينة الصورة تلقائيًا.
              </small>
            </div>

          </div>

          {/* المعلومات الأساسية */}

          <div className="form-section">

            <h3>المعلومات الأساسية</h3>

            <div className="form-grid">

              <label>
                اسم اللاعب

                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="مثال: محمد"
                />
              </label>

              <label>
                رقم القميص

                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.number}
                  onChange={(e) =>
                    updateField(
                      "number",
                      e.target.value
                    )
                  }
                  placeholder="9"
                />
              </label>

            </div>

            <label>
              المركز

              <select
                value={form.position}
                onChange={(e) =>
                  updateField(
                    "position",
                    e.target.value
                  )
                }
              >
                <option>حارس مرمى</option>
                <option>مدافع</option>
                <option>وسط</option>
                <option>وسط هجومي</option>
                <option>جناح</option>
                <option>مهاجم</option>
              </select>
            </label>

          </div>

          {/* الإحصائيات */}

          <div className="form-section">

            <h3>إحصائيات اللاعب</h3>

            <div className="stats-form">

              <label>
                OVR
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.rating}
                  onChange={(e) =>
                    updateField(
                      "rating",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                PAC
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.pac}
                  onChange={(e) =>
                    updateField(
                      "pac",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                SHO
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.sho}
                  onChange={(e) =>
                    updateField(
                      "sho",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                PAS
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.pas}
                  onChange={(e) =>
                    updateField(
                      "pas",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                DRI
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.dri}
                  onChange={(e) =>
                    updateField(
                      "dri",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                DEF
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.def}
                  onChange={(e) =>
                    updateField(
                      "def",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                PHY
                <input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={form.phy}
                  onChange={(e) =>
                    updateField(
                      "phy",
                      e.target.value
                    )
                  }
                />
              </label>

            </div>

          </div>

          <button
            type="submit"
            className="add-player-button"
            disabled={saving}
          >
            {saving
              ? "جاري الحفظ..."
              : "＋ إضافة اللاعب"}
          </button>

          {message && (
            <div
              className={
                message.includes("بنجاح")
                  ? "success-message"
                  : "login-error"
              }
            >
              {message}
            </div>
          )}

        </form>

      </section>

    </main>
  );
}