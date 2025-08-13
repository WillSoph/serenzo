// /app/api/analisar-texto/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json();
    if (!texto) {
      return NextResponse.json({ error: "Texto é obrigatório." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY ausente no ambiente." }, { status: 500 });
    }

    const system =
      "Você é um assistente de RH. Analise a mensagem enviada por um colaborador e classifique como 'sugestao', 'critica', 'ajuda' ou 'elogio'. \
Responda com empatia e profissionalismo. \
Retorne APENAS um JSON com o formato: { \"tipoDetectado\": \"sugestao|critica|ajuda|elogio\", \"resposta\": \"texto\" }.";

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: texto },
        ],
        temperature: 0.5,
        text: {
          format: {
            type: "json_schema",
            name: "AnaliseMensagem",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                tipoDetectado: {
                  type: "string",
                  enum: ["sugestao", "critica", "ajuda", "elogio"],
                },
                resposta: { type: "string" },
              },
              required: ["tipoDetectado", "resposta"],
            },
          },
        },
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error("OpenAI error:", JSON.stringify(err, null, 2));
      return NextResponse.json({ error: "Falha na chamada ao OpenAI." }, { status: 502 });
    }

    const data = await resp.json();

    // Preferir output_text; fallback para estrutura output
    let rawText: string | undefined = data.output_text;
    if (!rawText) rawText = data.output?.[0]?.content?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Resposta vazia do OpenAI." }, { status: 502 });
    }

    let parsed: { tipoDetectado: string; resposta: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Se vier texto puro, faz um fallback básico
      parsed = { tipoDetectado: "sugestao", resposta: rawText };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro ao analisar texto:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
