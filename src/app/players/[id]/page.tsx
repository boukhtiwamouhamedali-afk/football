const players = [
  {
    id: 1,
    number: 1,
    name: "محمد",
    position: "حارس مرمى",
    shortPosition: "GK",
    rating: 82,
    pac: 72,
    sho: 40,
    pas: 68,
    dri: 55,
    def: 82,
    phy: 75,
  },
  {
    id: 2,
    number: 2,
    name: "أحمد",
    position: "مدافع",
    shortPosition: "DF",
    rating: 78,
    pac: 78,
    sho: 35,
    pas: 65,
    dri: 60,
    def: 84,
    phy: 80,
  },
  {
    id: 3,
    number: 5,
    name: "علي",
    position: "مدافع",
    shortPosition: "DF",
    rating: 81,
    pac: 82,
    sho: 42,
    pas: 70,
    dri: 62,
    def: 87,
    phy: 83,
  },
  {
    id: 4,
    number: 8,
    name: "يوسف",
    position: "وسط",
    shortPosition: "MF",
    rating: 84,
    pac: 79,
    sho: 72,
    pas: 88,
    dri: 82,
    def: 65,
    phy: 75,
  },
  {
    id: 5,
    number: 10,
    name: "عمر",
    position: "وسط هجومي",
    shortPosition: "CAM",
    rating: 87,
    pac: 86,
    sho: 82,
    pas: 91,
    dri: 94,
    def: 40,
    phy: 68,
  },
  {
    id: 6,
    number: 9,
    name: "خالد",
    position: "مهاجم",
    shortPosition: "ST",
    rating: 89,
    pac: 92,
    sho: 91,
    pas: 76,
    dri: 90,
    def: 35,
    phy: 84,
  },
];

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const player = players.find(
    (player) => player.id === Number(id)
  );

  if (!player) {
    return (
      <main className="player-not-found">
        <h1>اللاعب غير موجود</h1>
        <a href="/players">العودة إلى اللاعبين</a>
      </main>
    );
  }

  return (
    <main className="player-profile">

      <header className="profile-header">
        <a href="/players" className="back-button">
          →
        </a>

        <div>
          <h1>بطاقة اللاعب</h1>
          <p>معلومات اللاعب وإحصائياته</p>
        </div>
      </header>

      <section className="player-card-large">

        <div className="card-top">

          <div className="large-player-photo">
            👤
          </div>

          <div className="player-main-info">

            <div className="overall">
              <span>OVR</span>
              <strong>{player.rating}</strong>
            </div>

            <h2>{player.name}</h2>

            <p>
              {player.position} • #{player.number}
            </p>

          </div>

        </div>

        <div className="stats">

          <div className="stat">
            <strong>{player.pac}</strong>
            <span>PAC</span>
            <small>السرعة</small>
          </div>

          <div className="stat">
            <strong>{player.sho}</strong>
            <span>SHO</span>
            <small>التسديد</small>
          </div>

          <div className="stat">
            <strong>{player.pas}</strong>
            <span>PAS</span>
            <small>التمرير</small>
          </div>

          <div className="stat">
            <strong>{player.dri}</strong>
            <span>DRI</span>
            <small>المراوغة</small>
          </div>

          <div className="stat">
            <strong>{player.def}</strong>
            <span>DEF</span>
            <small>الدفاع</small>
          </div>

          <div className="stat">
            <strong>{player.phy}</strong>
            <span>PHY</span>
            <small>القوة</small>
          </div>

        </div>

      </section>

      <a href="/players" className="back-to-players">
        ← العودة إلى قائمة اللاعبين
      </a>

    </main>
  );
}