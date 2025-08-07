// app/api/adicionar-usuario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
      const { texto } = await req.json();
  
      if (!texto) {
        return NextResponse.json({ error: "Texto é obrigatório." }, { status: 400 });
      }
  
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente de RH. Analise a mensagem enviada por um colaborador e classifique como 'sugestao', 'critica', 'ajuda' ou 'elogio'. Depois, responda com empatia e profissionalismo, demonstrando que o RH recebeu e está avaliando.",
            },
            { role: "user", content: texto },
          ],
          temperature: 0.7,
        }),
      });
  
      const data = await openAiRes.json();
      console.log("🧠 Resposta do OpenAI:", JSON.stringify(data, null, 2));
  
      const resposta = data.choices?.[0]?.message?.content || "Sem resposta.";
      let tipoDetectado = "sugestao";
  
      if (resposta.toLowerCase().includes("crítica")) tipoDetectado = "critica";
      else if (resposta.toLowerCase().includes("ajuda")) tipoDetectado = "ajuda";
      else if (resposta.toLowerCase().includes("elogio")) tipoDetectado = "elogio";
  
      return NextResponse.json({ tipoDetectado, resposta });
    } catch (error) {
      console.error("❌ Erro ao analisar texto:", error);
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
  }
