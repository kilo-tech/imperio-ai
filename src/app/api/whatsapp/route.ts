import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const change = body?.entry?.[0]?.changes?.[0]?.value;
    const messages = change?.messages;
    const metadata = change?.metadata;

    if (!messages || !messages.length) {
      return new Response("No messages", { status: 200 });
    }

    const incoming = messages[0];
    const from = incoming?.from;
    const incomingText = incoming?.text?.body || "";
    const phoneNumberId = metadata?.phone_number_id || WHATSAPP_PHONE_NUMBER_ID;

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("meta_phone_number_id", phoneNumberId)
      .maybeSingle();

    if (!business) {
      return new Response("Business not found", { status: 200 });
    }

    const businessName = business.business_name || "este negocio";
    const businessType = business.business_type || "negocio";
    const businessHours = business.business_hours || "no configurado";
    const faq = business.faq || "no configurado";
    const whatsappNumber = business.whatsapp_number || "no configurado";

    await supabase.from("messages").insert({
      business_id: business.id,
      customer_phone: from,
      role: "user",
      content: incomingText,
    });

    const prompt = `
Eres el agente de atención al cliente de un negocio en WhatsApp.

Datos del negocio:
- Nombre: ${businessName}
- Tipo: ${businessType}
- WhatsApp: ${whatsappNumber}
- Horario: ${businessHours}
- FAQ: ${faq}

Cliente:
- Número: ${from}

Reglas:
- Responde breve, claro y amable.
- Usa solo la información disponible.
- Si no sabes algo, dilo.
- Ayuda con horarios, reservas, contacto y preguntas frecuentes.

Mensaje del cliente:
${incomingText}
`;

    const ai = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const reply =
      ai.output_text || "No pude generar una respuesta en este momento.";

    await supabase.from("messages").insert({
      business_id: business.id,
      customer_phone: from,
      role: "assistant",
      content: reply,
    });

    const graphUrl = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

    await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply },
      }),
    });

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Webhook POST error:", error);
    return new Response("Server error", { status: 500 });
  }
}