"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
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

type LineupPlayer = {
  playerId: string;
  position: string;
  x: number;
  y: number;
};

const defaultPositions = [
  { position: "GK", x: 50, y: 88 },
  { position: "RB", x: 82, y: 68 },
  { position: "CB", x: 62, y: 70 },
  { position: "CB", x: 38, y: 70 },
  { position: "LB", x: 18, y: 68 },
  { position: "CM", x: 68, y: 48 },
  { position: "CM", x: 32, y: 48 },
  { position: "CAM", x: 50, y: 37 },
  { position: "RW", x: 80, y: 23 },
  { position: "ST", x: 50, y: 18 },
  { position: "LW", x: 20, y: 23 },
];

export default function LineupPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [starters, setStarters] = useState<LineupPlayer[]>([]);
  const [substitutes, setSubstitutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playersUnsubscribe = onSnapshot(
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
      }
    );

    async function loadLineup() {
      try {
        const lineupRef = doc(db, "lineup", "current");
        const lineupSnapshot = await getDoc(lineupRef);

        if (lineupSnapshot.exists()) {
          const data = lineupSnapshot.data();

          setStarters(data.starters || []);
          setSubstitutes(data.substitutes || []);
        }
      } catch (error) {
        console.error("Lineup error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLineup();

    return () => {
      playersUnsubscribe();
    };
  }, []);

  function getPlayer(playerId: string) {
    return players.find(
      (player) => player.id === playerId
    );
  }

  if (loading) {
    return (
      <main className="lineup-page">
        <div className="players-loading">
          جاري تحميل التشكيلة...
        </div>
      </main>
    );
  }

  return (
    <main className="lineup-page">

      <header className="lineup-header">

        <a href="/" className="back-button">
          →
        </a>

        <div>
          <h1>التشكيلة</h1>
          <p>التشكيلة الأساسية</p>
        </div>

      </header>

      <section className="football-field">

        <div className="field-line center-line" />

        <div className="center-circle" />

        <div className="penalty-box top-box" />
        <div className="goal top-goal" />

        <div className="penalty-box bottom-box" />
        <div className="goal bottom-goal" />

        {starters.map((lineupPlayer, index) => {

          const player = getPlayer(
            lineupPlayer.playerId
          );

          if (!player) return null;

          const fallbackPosition =
            defaultPositions[index];

          return (
            <a
              href={`/players/${player.id}`}
              key={player.id}
              className="player-position"
              style={{
                left: `${
                  lineupPlayer.x ??
                  fallbackPosition?.x ??
                  50
                }%`,

                top: `${
                  lineupPlayer.y ??
                  fallbackPosition?.y ??
                  50
                }%`,
              }}
            >

              <div className="player-circle">

                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                  />
                ) : (
                  player.number
                )}

              </div>

              <div className="player-name">
                {player.name}
              </div>

              <div className="player-position-text">
                {lineupPlayer.position}
              </div>

            </a>
          );
        })}

      </section>

      <section className="substitutes">

        <div className="section-title">

          <h2>الاحتياط</h2>

          <span>
            {substitutes.length}
          </span>

        </div>

        <div className="substitute-list">

          {substitutes.map((playerId) => {

            const player = getPlayer(playerId);

            if (!player) return null;

            return (
              <a
                href={`/players/${player.id}`}
                className="substitute-card"
                key={player.id}
              >

                <div className="substitute-number">
                  {player.number}
                </div>

                <div>
                  <strong>
                    {player.name}
                  </strong>

                  <small>
                    {player.position}
                  </small>
                </div>

                <span className="substitute-arrow">
                  ←
                </span>

              </a>
            );
          })}

        </div>

      </section>

    </main>
  );
}