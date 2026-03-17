"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  time: string;
};

type StoredMessage = {
  id: string;
  customer_phone: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [faq, setFaq] = useState("");
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState("");

  const [metaStatus, setMetaStatus] = useState("not_connected");
  const [metaConnectedAt, setMetaConnectedAt] = useState("");
  const [whatsappBusinessAccountId, setWhatsappBusinessAccountId] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hola 👋 Soy tu agente demo. Escríbeme como si fueras un cliente.",
      time: getCurrentTime(),
    },
  ]);

  const [storedMessages, setStoredMessages] = useState<StoredMessage[]>([]);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatStoredTime(dateString: string) {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalMessages = storedMessages.length;

  const uniqueCustomers = useMemo(() => {
    return new Set(storedMessages.map((m) => m.customer_phone)).size;
  }, [storedMessages]);

  const whatsappConnected = !!metaPhoneNumberId;

  useEffect(() => {
    async function loadDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (business) {
        setBusinessName(business.business_name || "");
        setBusinessType(business.business_type || "");
        setWhatsappNumber(business.whatsapp_number || "");
        setBusinessHours(business.business_hours || "");
        setFaq(business.faq || "");
        setMetaPhoneNumberId(business.meta_phone_number_id || "");
        setMetaStatus(business.meta_status || "not_connected");
        setMetaConnectedAt(business.meta_connected_at || "");
        setWhatsappBusinessAccountId(
          business.whatsapp_business_account_id || ""
        );

        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!messagesError && messagesData) {
          setStoredMessages(messagesData);
        }
      }

      if (businessError) {
        console.error(businessError);
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!businessName || !businessType || !whatsappNumber) {
      setMessage("Completa nombre, tipo y WhatsApp.");
      return;
    }

    setMessage("Guardando...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("businesses").upsert(
      {
        user_id: user.id,
        business_name: businessName,
        business_type: businessType,
        whatsapp_number: whatsappNumber,
        business_hours: businessHours,
        faq: faq,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      setMessage("Error al guardar: " + error.message);
    } else {
      setMessage("Negocio guardado correctamente.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleConnectWhatsApp() {
  window.location.href = "/api/meta/start";
}

  async function handleSendDemoMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();

    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage, time: getCurrentTime() },
      { role: "assistant", text: "Escribiendo...", time: getCurrentTime() },
    ]);

    setChatInput("");

    try {
      const res = await fetch("/api/demo-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          businessName,
          businessType,
          whatsappNumber,
          businessHours,
          faq,
        }),
      });

      const data = await res.json();

      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: data.reply,
          time: getCurrentTime(),
        };
        return updated;
      });
    } catch (error) {
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: "Hubo un error generando la respuesta del agente.",
          time: getCurrentTime(),
        };
        return updated;
      });
    }
  }

  if (loading) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-wrap">
          <h1>Cargando dashboard...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-wrap">
        <div className="dashboard-header">
          <h1>Panel de tu Agente IA</h1>
          <p>
            Configura tu negocio, prueba el agente y revisa las conversaciones
            reales que llegan por WhatsApp.
          </p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">WhatsApp</span>
            <strong className="stat-value">
              {whatsappConnected ? "Conectado" : "No conectado"}
            </strong>
            <span className="stat-subtext">
              {whatsappConnected
                ? `ID activo: ${metaPhoneNumberId}`
                : "Aún no hay número de Meta vinculado"}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Mensajes totales</span>
            <strong className="stat-value">{totalMessages}</strong>
            <span className="stat-subtext">
              Historial guardado en Supabase
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Clientes únicos</span>
            <strong className="stat-value">{uniqueCustomers}</strong>
            <span className="stat-subtext">
              Números distintos que escribieron
            </span>
          </div>
        </section>

        <section className="channel-card">
          <div className="channel-card-header">
            <div>
              <h2>Canal de WhatsApp</h2>
              <p>
                Conecta el número del negocio para activar el agente en
                producción.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConnectWhatsApp}
            >
              Conectar WhatsApp
            </button>
          </div>

          <div className="channel-grid">
            <div className="channel-item">
              <span className="channel-label">Estado</span>
              <strong className="channel-value">
                {metaStatus === "connected" ? "Conectado" : "No conectado"}
              </strong>
            </div>

            <div className="channel-item">
              <span className="channel-label">WABA ID</span>
              <strong className="channel-value">
                {whatsappBusinessAccountId || "Aún no disponible"}
              </strong>
            </div>

            <div className="channel-item">
              <span className="channel-label">Conectado el</span>
              <strong className="channel-value">
                {metaConnectedAt
                  ? new Date(metaConnectedAt).toLocaleString()
                  : "Sin conexión todavía"}
              </strong>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="dashboard-form">
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tipo de negocio"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          />

          <input
            type="text"
            placeholder="Número de WhatsApp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="Horario del negocio"
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
          />

          <textarea
            placeholder="Preguntas frecuentes"
            value={faq}
            onChange={(e) => setFaq(e.target.value)}
            rows={6}
          />

          <button type="submit" className="btn btn-primary full">
            Guardar negocio
          </button>
        </form>

        {message && <p className="message-ok">{message}</p>}

        <section className="demo-chat-card">
          <div className="demo-chat-header">
            <div className="demo-chat-avatar">
              {businessName ? businessName.charAt(0).toUpperCase() : "I"}
            </div>

            <div className="demo-chat-header-info">
              <h2>{businessName || "Tu negocio"}</h2>
              <p>En línea · Agente IA activo</p>
            </div>
          </div>

          <div className="demo-chat-messages">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "chat-bubble user-bubble"
                    : "chat-bubble assistant-bubble"
                }
              >
                {msg.role === "assistant" && (
                  <div className="ai-label">
                    {msg.text === "Escribiendo..." ? "IA escribiendo..." : "IA"}
                  </div>
                )}

                <div
                  className={msg.text === "Escribiendo..." ? "typing-text" : ""}
                >
                  {msg.text}
                </div>

                <div className="bubble-time">{msg.time}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendDemoMessage} className="demo-chat-form">
            <input
              type="text"
              placeholder="Ej: ¿A qué hora cierran hoy?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Enviar
            </button>
          </form>
        </section>

        <section className="inbox-card">
          <div className="inbox-header">
            <h2>Conversaciones recientes</h2>
            <p>Mensajes reales recibidos y respondidos por tu agente.</p>
          </div>

          {storedMessages.length === 0 ? (
            <p className="empty-state">
              Aún no hay conversaciones guardadas.
            </p>
          ) : (
            <div className="inbox-list">
              {storedMessages.map((msg) => (
                <div key={msg.id} className="inbox-item">
                  <div className="inbox-top">
                    <span className="inbox-phone">{msg.customer_phone}</span>
                    <span className="inbox-role">
                      {msg.role === "user" ? "Cliente" : "IA"}
                    </span>
                  </div>

                  <p className="inbox-content">{msg.content}</p>
                  <span className="inbox-time">
                    {formatStoredTime(msg.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={handleLogout}
          className="btn btn-secondary logout-btn"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}