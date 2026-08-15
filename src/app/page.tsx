import Link from "next/link";

export default function Home() {
  return (
    <main className="home">

      {/* Header */}
      <header className="team-header">
        <div className="team-logo">
          ⚽
        </div>

        <h1>فريق النسور</h1>

        <p>فريق كرة القدم</p>
      </header>

      {/* Main buttons */}
      <section className="menu">

        <Link href="/lineup" className="menu-card lineup-card">
          <div className="menu-icon">📋</div>

          <div>
            <h2>التشكيلة</h2>
            <p>الأساسيون والاحتياط</p>
          </div>

          <span className="arrow">←</span>
        </Link>

        <Link href="/players" className="menu-card players-card">
          <div className="menu-icon">👥</div>

          <div>
            <h2>اللاعبين</h2>
            <p>جميع لاعبي الفريق</p>
          </div>

          <span className="arrow">←</span>
        </Link>

        <Link href="/training" className="menu-card training-card">
          <div className="menu-icon">🏋️</div>

          <div>
            <h2>أوقات التدريب</h2>
            <p>مواعيد ومكان التدريبات</p>
          </div>

          <span className="arrow">←</span>
        </Link>

      </section>

      {/* Admin */}
      <section className="admin-section">
        <Link href="/admin" className="admin-button">

          <span>🔐</span>

          <div>
            <strong>لوحة الإدارة</strong>
            <small>للمسؤول فقط</small>
          </div>

          <span className="arrow">←</span>

        </Link>
      </section>

      <footer>
        <p>© 2026 فريق النسور</p>
      </footer>

    </main>
  );
}