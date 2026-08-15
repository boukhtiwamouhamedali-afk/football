"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "boukhtiwamouhamedali@gmail.com";

type Player = {
  id: string;
  name: string;
  number: number;
  position: string;
  imageUrl: string;
};

type Starter = {
  playerId: string;
  position: string;
  x: number;
  y: number;
};

const positions = [
  { position: "GK", label: "حارس المرمى", x: 50, y: 88 },
  { position: "RB", label: "مدافع أيمن", x: 82, y: 68 },
  { position: "CB", label: "قلب دفاع", x: 62, y: 70 },
  { position: "CB", label: "قلب دفاع", x: 38, y: 70 },
  { position: "LB", label: "مدافع أيسر", x: 18, y: 68 },
  { position: "CM", label: "وسط", x: 68, y: 48 },
  { position: "CM", label: "وسط", x: 32, y: 48 },
  { position: "CAM", label: "صانع ألعاب", x: 50, y: 37 },
  { position: "RW", label: "جناح أيمن", x: 80, y: 23 },
  { position: "ST", label: "مهاجم", x: 50, y: 18 },
  { position: "LW", label: "جناح أيسر", x: 20, y: 23 },
];

export default function AdminLineupPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

  const [starters, setStarters] = useState<Starter[]>(
    positions.map((item) => ({
      playerId: "",
      position: item.position,
      x: item.x,
      y: item.y,
    }))
  );

  const [substitutes, setSubstitutes] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    if (!authorized) return;

    const unsubscribe = onSnapshot(
      collection(db, "players"),
      (snapshot) => {
        const data: Player[] = snapshot.docs.map((item) => {
          const player = item.data();

          return {
            id: item.id,
            name: player.name || "",
            number: player.number || 0,
            position: player.position || "",
            imageUrl: player.imageUrl || "",
          };
        });

        setPlayers(data);
      }
    );

    return () => unsubscribe();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;

    const unsubscribe = onSnapshot(
      doc(db, "lineup", "current"),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();

        if (Array.isArray(data.starters)) {
          setStarters(data.starters);
        }

        if (Array.isArray(data.substitutes)) {
          setSubstitutes(data.substitutes);
        }
      }
    );

    return () => unsubscribe();
  }, [authorized]);

  function selectStarter(
    index: number,
    playerId: string
  ) {
    setStarters((old) => {
      const updated = [...old];

      updated[index] = {
        ...updated[index],
        playerId,
      };

      return updated;
    });
  }

  function toggleSubstitute(playerId: string) {
    setSubstitutes((old) => {
      if (old.includes(playerId)) {
        return old.filter((id) => id !== playerId);
      }

      return [...old, playerId];
    });
  }

  function isStarter(playerId: string) {
    return starters.some(
      (player) => player.playerId === playerId
    );
  }

  async function saveLineup() {
    const selectedStarters = starters.filter(
      (player) => player.playerId !== ""
    );

    if (selectedStarters.length !== 11) {
      setMessage(
        `يجب اختيار 11 لاعبًا أساسيًا. اخترت حاليًا ${selectedStarters.length}.`
      );
      return;
    }

    const uniquePlayers = new Set(
      selectedStarters.map(
        (player) => player.playerId
      )
    );

    if (uniquePlayers.size !== 11) {
      setMessage(
        "لا يمكن اختيار نفس اللاعب أكثر من مرة في التشكيلة الأساسية."
      );
      return;
    }

    const duplicateSubstitute = substitutes.some(
      (id) => uniquePlayers.has(id)
    );

    if (duplicateSubstitute) {
      setMessage(
        "لا يمكن أن يكون اللاعب أساسيًا واحتياطًا في نفس الوقت."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await setDoc(doc(db, "lineup", "current"), {
        starters: selectedStarters,
        substitutes,
        updatedAt: new Date(),
      });

      setMessage("تم حفظ التشكيلة بنجاح ✅");
    } catch (error) {
      console.error(error);
      setMessage(
        "تعذر حفظ التشكيلة. تأكد من صلاحيات Firestore."
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
          <span>⚽</span>

          <div>
            <h1>إدارة التشكيلة</h1>
            <p>اختيار الأساسيين والاحتياط</p>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => router.push("/admin")}
        >
          ← العودة
        </button>

      </header>

      {/* الأساسيون */}

      <section className="player-form-card">

        <div className="form-title">
          <h2>التشكيلة الأساسية</h2>

          <p>
            اختر لاعبًا لكل مركز.
          </p>
        </div>

        <div className="lineup-admin-list">

          {positions.map((position, index) => {

            const selected =
              starters[index]?.playerId || "";

            return (
              <div
                className="lineup-admin-row"
                key={`${position.position}-${index}`}
              >

                <div className="lineup-position-label">
                  <strong>
                    {index + 1}
                  </strong>

                  <span>
                    {position.label}
                  </span>

                  <small>
                    {position.position}
                  </small>
                </div>

                <select
                  value={selected}
                  onChange={(e) =>
                    selectStarter(
                      index,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    اختر اللاعب
                  </option>

                  {players.map((player) => {

                    const alreadyUsed =
                      isStarter(player.id) &&
                      player.id !== selected;

                    return (
                      <option
                        key={player.id}
                        value={player.id}
                        disabled={alreadyUsed}
                      >
                        #{player.number} —{" "}
                        {player.name}
                      </option>
                    );
                  })}

                </select>

              </div>
            );
          })}

        </div>

      </section>

      {/* الاحتياط */}

      <section className="player-form-card">

        <div className="form-title">
          <h2>الاحتياط</h2>

          <p>
            اختر اللاعبين الذين تريد وضعهم على دكة
            البدلاء.
          </p>
        </div>

        {players.length === 0 ? (
          <div className="empty-players">
            <span>👤</span>
            <p>
              أضف لاعبين أولًا من إدارة اللاعبين.
            </p>
          </div>
        ) : (
          <div className="substitute-admin-grid">

            {players.map((player) => {

              const selected =
                substitutes.includes(player.id);

              const starter =
                isStarter(player.id);

              return (
                <button
                  type="button"
                  key={player.id}
                  disabled={starter}
                  className={`substitute-admin-player ${
                    selected
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    toggleSubstitute(
                      player.id
                    )
                  }
                >

                  <div className="admin-player-photo">

                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                      />
                    ) : (
                      <span>👤</span>
                    )}

                  </div>

                  <div>
                    <strong>
                      {player.name}
                    </strong>

                    <small>
                      #{player.number}
                    </small>
                  </div>

                  <span>
                    {starter
                      ? "أساسي"
                      : selected
                      ? "✓"
                      : "+"}
                  </span>

                </button>
              );
            })}

          </div>
        )}

      </section>

      {/* الحفظ */}

      <section className="player-form-card">

        <div className="lineup-save-info">

          <div>
            <strong>
              الأساسيون
            </strong>

            <span>
              {
                starters.filter(
                  (p) => p.playerId
                ).length
              } / 11
            </span>
          </div>

          <div>
            <strong>
              الاحتياط
            </strong>

            <span>
              {substitutes.length}
            </span>
          </div>

        </div>

        <button
          className="add-player-button"
          onClick={saveLineup}
          disabled={saving}
        >
          {saving
            ? "جاري الحفظ..."
            : "💾 حفظ التشكيلة"}
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

      </section>

    </main>
  );
}