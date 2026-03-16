import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      <div className="container">
        <section className="hero-startup">
          <div className="hero-copy">
            <span className="hero-badge">Agentes IA para negocios</span>

            <h1>
              Automatiza WhatsApp y responde clientes con inteligencia artificial
            </h1>

            <p className="hero-description">
              Imperio AI permite a restaurantes, hoteles, gimnasios y negocios
              locales crear un agente que responde automáticamente preguntas
              frecuentes, horarios, reservas y contacto en WhatsApp.
            </p>

            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary">
                Crear mi agente IA
              </Link>

              <a href="/dashboard" className="btn btn-secondary">
                Ver demo
              </a>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-dot" />
                <div className="preview-dot" />
                <div className="preview-dot" />
              </div>

              <div className="preview-content">
                <div className="preview-message preview-user">
                  Hola, ¿a qué hora cierran hoy?
                </div>

                <div className="preview-message preview-ai">
                  Hola 👋 Kitty Crush atiende hoy de 12:00 pm a 7:00 pm.
                </div>

                <div className="preview-message preview-user">
                  ¿Tienen reservas?
                </div>

                <div className="preview-message preview-ai">
                  Sí. Podemos ayudarte con reservas y consultas frecuentes por
                  WhatsApp automáticamente.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-features">
          <div className="grid home-grid">
            <div className="card">
              <h3>Configura tu negocio</h3>
              <p>
                Guarda nombre, horario, contacto y preguntas frecuentes desde tu
                dashboard.
              </p>
            </div>

            <div className="card">
              <h3>IA que responde clientes</h3>
              <p>
                El agente usa la información del negocio para responder de forma
                clara, rápida y automática.
              </p>
            </div>

            <div className="card">
              <h3>Preparado para WhatsApp</h3>
              <p>
                Diseñado para convertirse en un sistema de atención y ventas por
                WhatsApp.
              </p>
            </div>

            <div className="card">
              <h3>Ideal para negocios locales</h3>
              <p>
                Restaurantes, hoteles, gimnasios, clínicas y cualquier negocio
                con atención repetitiva.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}