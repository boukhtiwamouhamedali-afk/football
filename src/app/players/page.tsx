"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      (snapshot) => {
        const data: Player[] = snapshot.docs.map((item) => {
          const player = item.data();

          return {
            id: item.id,
            name: player.name || "",
            number: player.number || 0,
            position: player.position || "",
            imageUrl: player.imageUrl || "",
            rating: player.rating || 0,
            pac: player.pac || 0,
            sho: player.sho || 0,
            pas: player.pas || 0,
            dri: player.dri || 0,
            def: player.def || 0,
            phy: player.phy || 0,
          };
        });

        setPlayers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Players error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="players-page">

      {/* الهيدر */}

      <header className="players-header">

        <button
          className="back-button"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div>
          <h1>لاعبي الفريق</h1>
          <p>جميع لاعبي الفريق</p>
        </div>

      </header>

      {/* التحميل */}

      {loading && (
        <div className="players-loading">
          جاري تحميل اللاعبين...
        </div>
      )}

      {/* لا يوجد لاعبين */}

      {!loading && players.length === 0 && (
        <div className="players-empty">
          <div>⚽</div>
          <h2>لا يوجد لاعبين</h2>
          <p>
            لم تتم إضافة لاعبين للفريق حتى الآن.
          </p>
        </div>
      )}

      {/* اللاعبين */}

      {!loading && players.length > 0 && (
        <section className="players-grid">

          {players.map((player) => (
            <button
              key={player.id}
              className="player-card"
              onClick={() => setSelectedPlayer(player)}
            >

              <div className="player-card-image">

                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                  />
                ) : (
                  <span>👤</span>
                )}

                <div className="player-rating">
                  {player.rating}
                </div>

                <div className="player-number">
                  #{player.number}
                </div>

              </div>

              <div className="player-card-info">

                <h2>{player.name}</h2>

                <span>
                  {player.position}
                </span>

              </div>

            </button>
          ))}

        </section>
      )}

      {/* بطاقة اللاعب */}

      {selectedPlayer && (
        <div
          className="player-modal-overlay"
          onClick={() => setSelectedPlayer(null)}
        >

          <div
            className="player-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="player-modal-close"
              onClick={() => setSelectedPlayer(null)}
            >
              ×
            </button>

            {/* صورة اللاعب */}

            <div className="player-modal-top">

              <div className="player-modal-image">

                {selectedPlayer.imageUrl ? (
                  <img
                    src={selectedPlayer.imageUrl}
                    alt={selectedPlayer.name}
                  />
                ) : (
                  <span>👤</span>
                )}

              </div>

              <div className="player-modal-main-info">

                <div className="modal-rating">
                  <strong>
                    {selectedPlayer.rating}
                  </strong>

                  <span>OVR</span>
                </div>

                <h2>
                  {selectedPlayer.name}
                </h2>

                <p>
                  #{selectedPlayer.number} •{" "}
                  {selectedPlayer.position}
                </p>

              </div>

            </div>

            {/* الإحصائيات */}

            <div className="player-stats">

              <div>
                <strong>{selectedPlayer.pac}</strong>
                <span>PAC</span>
              </div>

              <div>
                <strong>{selectedPlayer.sho}</strong>
                <span>SHO</span>
              </div>

              <div>
                <strong>{selectedPlayer.pas}</strong>
                <span>PAS</span>
              </div>

              <div>
                <strong>{selectedPlayer.dri}</strong>
                <span>DRI</span>
              </div>

              <div>
                <strong>{selectedPlayer.def}</strong>
                <span>DEF</span>
              </div>

              <div>
                <strong>{selectedPlayer.phy}</strong>
                <span>PHY</span>
              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}