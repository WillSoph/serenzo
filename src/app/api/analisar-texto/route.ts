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

    // ⚠️ Agora pedimos APENAS classificação + orientação ao RH (nada para o colaborador)
    const system =
  "Você é um assistente de RH. Sua missão é analisar a mensagem enviada por um colaborador e classificá-la como 'sugestao', 'critica', 'ajuda' ou 'elogio'. \
  Regras importantes: \
  - Se o texto mencionar assédio, abuso, violência, depressão, burnout, ideação suicida, discriminação, vícios, ameaças ou qualquer situação de risco à saúde ou segurança, SEMPRE classifique como 'ajuda'. \
  - Use 'critica' apenas para reclamações menos graves, como sobre gestão, processos, políticas ou infraestrutura. \
  - 'Sugestao' é para melhorias ou novas ideias. \
  - 'Elogio' é para feedbacks positivos. \
  Retorne APENAS um JSON no formato: { \"tipoDetectado\": \"sugestao|critica|ajuda|elogio\", \"orientacaoRH\": \"texto\" }.";
 

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
        temperature: 0.3,
        text: {
          format: {
            type: "json_schema",
            name: "AnaliseMensagemRH",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                tipoDetectado: {
                  type: "string",
                  enum: ["sugestao", "critica", "ajuda", "elogio"],
                },
                orientacaoRH: { type: "string" },
              },
              required: ["tipoDetectado", "orientacaoRH"],
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

    let parsed: { tipoDetectado: "sugestao" | "critica" | "ajuda" | "elogio"; orientacaoRH: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // fallback minimalista
      parsed = { tipoDetectado: "sugestao", orientacaoRH: rawText };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro ao analisar texto:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
