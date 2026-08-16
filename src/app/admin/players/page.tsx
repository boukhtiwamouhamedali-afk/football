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
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

type Player = {
  id: string;
  name: string;
  number: number;
  position: string;
  imageUrl: string;
  rating: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
};

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

  const [players, setPlayers] = useState<Player[]>([]);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================
     التحقق من حساب الإدارة
  ========================================= */

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

  /* =========================================
     جلب اللاعبين
  ========================================= */

  useEffect(() => {
    if (!authorized) return;

    const playersRef = collection(db, "players");

    const playersQuery = query(
      playersRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      (snapshot) => {
        const data: Player[] = snapshot.docs.map((item) => {
          const value = item.data();

          return {
            id: item.id,
            name: value.name || "",
            number: Number(value.number || 0),
            position: value.position || "",
            imageUrl: value.imageUrl || "",
            rating: Number(value.rating || 0),
            pac: Number(value.pac || 0),
            sho: Number(value.sho || 0),
            pas: Number(value.pas || 0),
            dri: Number(value.dri || 0),
            def: Number(value.def || 0),
            phy: Number(value.phy || 0),
          };
        });

        setPlayers(data);
        setLoadingPlayers(false);
      },
      (err) => {
        console.error(err);
        setError("حدث خطأ أثناء تحميل اللاعبين.");
        setLoadingPlayers(false);
      }
    );

    return () => unsubscribe();
  }, [authorized]);

  /* =========================================
     تغيير الحقول
  ========================================= */

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  /* =========================================
     حفظ اللاعب
  ========================================= */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.number ||
      !form.imageUrl.trim() ||
      !form.rating ||
      !form.pac ||
      !form.sho ||
      !form.pas ||
      !form.dri ||
      !form.def ||
      !form.phy
    ) {
      setError("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    try {
      setSaving(true);

      const playerData = {
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
      };

      /* تعديل */

      if (editingId) {
        const playerRef = doc(
          db,
          "players",
          editingId
        );

        await updateDoc(playerRef, {
          ...playerData,
          updatedAt: serverTimestamp(),
        });

        setMessage("تم تعديل اللاعب بنجاح ✅");
      }

      /* إضافة */

      else {
        await addDoc(
          collection(db, "players"),
          {
            ...playerData,
            createdAt: serverTimestamp(),
          }
        );

        setMessage("تمت إضافة اللاعب بنجاح ✅");
      }

      setForm(initialForm);
      setEditingId(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(err);

      setError(
        "حدث خطأ أثناء حفظ اللاعب. تأكد من صلاحيات Firestore."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     تعديل لاعب
  ========================================= */

  function handleEdit(player: Player) {
    setEditingId(player.id);

    setForm({
      name: player.name,
      number: String(player.number),
      position: player.position,
      imageUrl: player.imageUrl,
      rating: String(player.rating),
      pac: String(player.pac),
      sho: String(player.sho),
      pas: String(player.pas),
      dri: String(player.dri),
      def: String(player.def),
      phy: String(player.phy),
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================
     إلغاء التعديل
  ========================================= */

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);

    setMessage("");
    setError("");
  }

  /* =========================================
     حذف لاعب
  ========================================= */

  async function handleDelete(
    player: Player
  ) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف اللاعب "${player.name}"؟`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteDoc(
        doc(db, "players", player.id)
      );

      if (editingId === player.id) {
        cancelEdit();
      }

      setMessage(
        `تم حذف اللاعب "${player.name}" بنجاح 🗑️`
      );

    } catch (err) {
      console.error(err);

      setError(
        "حدث خطأ أثناء حذف اللاعب. تأكد من صلاحيات Firestore."
      );
    }
  }

  /* =========================================
     تحميل
  ========================================= */

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

  /* =========================================
     الصفحة
  ========================================= */

  return (
    <main className="admin-page">

      {/* Header */}

      <header className="admin-page-header">

        <div>
          <span>👥</span>

          <h1>
            إدارة اللاعبين
          </h1>
        </div>

        <button
          onClick={() =>
            router.push("/admin")
          }
          className="logout-button"
        >
          ← العودة
        </button>

      </header>

      {/* الرسائل */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="login-error">
          {error}
        </div>
      )}

      {/* =====================================
          FORM
      ===================================== */}

      <section className="player-form-card">

        <div className="form-title">

          <div>

            <h2>
              {editingId
                ? "✏️ تعديل اللاعب"
                : "إضافة لاعب جديد"}
            </h2>

            <p>
              {editingId
                ? "عدّل معلومات اللاعب ثم احفظ التغييرات."
                : "أضف معلومات اللاعب وإحصائياته."}
            </p>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* الصورة */}

          <div className="player-image-section">

            <div className="player-image-preview">

              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="معاينة اللاعب"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
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

            <h3>
              المعلومات الأساسية
            </h3>

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
                <option>
                  حارس مرمى
                </option>

                <option>
                  مدافع
                </option>

                <option>
                  وسط
                </option>

                <option>
                  وسط هجومي
                </option>

                <option>
                  جناح
                </option>

                <option>
                  مهاجم
                </option>

              </select>

            </label>

          </div>

          {/* الإحصائيات */}

          <div className="form-section">

            <h3>
              إحصائيات اللاعب
            </h3>

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

          {/* أزرار الحفظ */}

          <div className="player-form-actions">

            <button
              type="submit"
              className="add-player-button"
              disabled={saving}
            >
              {saving
                ? "جاري الحفظ..."
                : editingId
                ? "💾 حفظ التعديلات"
                : "＋ إضافة اللاعب"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-player-button"
                onClick={cancelEdit}
              >
                إلغاء التعديل
              </button>
            )}

          </div>

        </form>

      </section>

      {/* =====================================
          PLAYERS LIST
      ===================================== */}

      <section className="players-admin-list">

        <div className="players-admin-list-header">

          <h2>
            اللاعبين
          </h2>

          <span>
            {players.length}
          </span>

        </div>

        {loadingPlayers ? (

          <div className="admin-loading">
            جاري تحميل اللاعبين...
          </div>

        ) : players.length === 0 ? (

          <div className="players-admin-empty">
            👥
            <h3>
              لا يوجد لاعبين
            </h3>
            <p>
              أضف أول لاعب من النموذج أعلاه.
            </p>
          </div>

        ) : (

          <div className="players-admin-grid">

            {players.map((player) => (

              <article
                key={player.id}
                className="player-admin-card"
              >

                {/* الصورة */}

                <div className="player-admin-image">

                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                    />
                  ) : (
                    <span>👤</span>
                  )}

                </div>

                {/* المعلومات */}

                <div className="player-admin-info">

                  <h3>
                    {player.name}
                  </h3>

                  <p>
                    #{player.number} •{" "}
                    {player.position}
                  </p>

                  <div className="player-admin-stats">

                    <span>
                      OVR{" "}
                      <strong>
                        {player.rating}
                      </strong>
                    </span>

                    <span>
                      PAC{" "}
                      <strong>
                        {player.pac}
                      </strong>
                    </span>

                    <span>
                      SHO{" "}
                      <strong>
                        {player.sho}
                      </strong>
                    </span>

                    <span>
                      PAS{" "}
                      <strong>
                        {player.pas}
                      </strong>
                    </span>

                    <span>
                      DRI{" "}
                      <strong>
                        {player.dri}
                      </strong>
                    </span>

                    <span>
                      DEF{" "}
                      <strong>
                        {player.def}
                      </strong>
                    </span>

                    <span>
                      PHY{" "}
                      <strong>
                        {player.phy}
                      </strong>
                    </span>

                  </div>

                </div>

                {/* الأزرار */}

                <div className="player-admin-actions">

                  <button
                    type="button"
                    className="player-edit-button"
                    onClick={() =>
                      handleEdit(player)
                    }
                    title="تعديل اللاعب"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    className="player-delete-button"
                    onClick={() =>
                      handleDelete(player)
                    }
                    title="حذف اللاعب"
                  >
                    🗑️
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}