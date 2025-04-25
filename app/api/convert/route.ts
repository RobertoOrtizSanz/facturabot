import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import pdf from "pdf-parse";
import OpenAI from "openai";

export const runtime = "edge";
export const config = { api: { bodyParser: false } }; // necesario para formidable

export async function POST(req: NextRequest) {
  // 1) leer el PDF
  const form = new IncomingForm();
  const { files } = await new Promise<any>((res, rej) =>
    form.parse(req as any, (err, _fields, files) => (err ? rej(err) : res({ files })))
  );
  const buffer = await files.file.toBuffer();

  // 2) extraer texto
  const text = (await pdf(buffer)).text;

  // 3) DeepSeek → XML + CSV
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL,
  });

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: `Convierte la siguiente factura al estándar Facturae 3.2 y devuélvela en XML. Después incluye la tabla en CSV.\n\n"""${text}"""`,
      },
    ],
    temperature: 0,
  });

  return new NextResponse(completion.choices[0].message.content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
