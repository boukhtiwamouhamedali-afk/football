"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Training = {
  id: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        console.error("Training Firestore Error:", err);

        setError(
          "حدث خطأ أثناء تحميل أوقات التدريب."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="training-page">

        <div className="training-loading">
          <div className="training-loading-icon">
            ⚽
          </div>

          <p>
            جاري تحميل أوقات التدريب...
          </p>
        </div>

      </main>
    );
  }

  if (error) {
    return (
      <main className="training-page">

        <div className="training-error">
          <span>⚠️</span>

          <p>
            {error}
          </p>
        </div>

      </main>
    );
  }

  return (
    <main className="training-page">

      {/* =========================
          Header
      ========================= */}

      <header className="training-header">

        <div className="training-header-icon">
          🏋️
        </div>

        <div className="training-header-text">

          <h1>
            أوقات التدريب
          </h1>

          <p>
            مواعيد ومكان تدريبات فريق النسور
          </p>

        </div>

      </header>

      {/* =========================
          المحتوى
      ========================= */}

      {trainings.length === 0 ? (

        <section className="training-empty">

          <div className="training-empty-icon">
            🏋️
          </div>

          <h2>
            لا توجد تدريبات
          </h2>

          <p>
            لم يتم إضافة أي مواعيد تدريب حتى الآن.
          </p>

        </section>

      ) : (

        <section className="training-list">

          {trainings.map((training) => (

            <article
              key={training.id}
              className="training-card"
            >

              {/* =========================
                  التاريخ
              ========================= */}

              <div className="training-card-date">

                <strong>
                  {training.day}
                </strong>

                <span>
                  {training.date}
                </span>

              </div>

              {/* =========================
                  معلومات التدريب
              ========================= */}

              <div className="training-card-info">

                {/* الوقت */}

                <div className="training-time">

                  <span className="training-time-icon">
                    🕐
                  </span>

                  <div>

                    <strong>
                      {training.startTime || "--:--"}

                      {training.endTime && (
                        <>
                          {" - "}
                          {training.endTime}
                        </>
                      )}
                    </strong>

                    <small>
                      وقت التدريب
                    </small>

                  </div>

                </div>

                {/* المكان */}

                <div className="training-location">

                  <span>
                    📍
                  </span>

                  <strong>
                    {training.location}
                  </strong>

                </div>

                {/* الملاحظات */}

                {training.notes && (

                  <div className="training-notes">

                    <span>
                      📝
                    </span>

                    <p>
                      {training.notes}
                    </p>

                  </div>

                )}

              </div>

            </article>

          ))}

        </section>

      )}

      {/* =========================
          Footer
      ========================= */}

      <footer className="training-footer">
        فريق النسور ⚽
      </footer>

    </main>
  );
}