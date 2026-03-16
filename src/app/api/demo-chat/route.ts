import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      message,
      businessName,
      businessType,
      whatsappNumber,
      businessHours,
      faq,
    } = body;

    const prompt = `
Eres el agente virtual de un negocio.

Datos del negocio:
- Nombre: ${businessName || "No configurado"}
- Tipo: ${businessType || "No configurado"}
- WhatsApp: ${whatsappNumber || "No configurado"}
- Horario: ${businessHours || "No configurado"}
- FAQ: ${faq || "No configurado"}

Instrucciones:
- Responde como asistente de atención al cliente por WhatsApp.
- Sé breve, claro y amable.
- Usa solo la información disponible.
- Si algo no está configurado, dilo claramente.
- Ayuda con horarios, reservas, contacto y preguntas frecuentes.

Mensaje del cliente:
${message}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return NextResponse.json({
      reply:
        response.output_text ||
        "No pude generar una respuesta en este momento.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Ocurrió un error al generar la respuesta." },
      { status: 500 }
    );
  }
}