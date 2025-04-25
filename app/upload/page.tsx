"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File>();
  const [output, setOutput] = useState("");

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Convertir factura PDF → Facturae</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0])}
        className="border p-2 w-full"
      />

      <button
        onClick={async () => {
          if (!file) return;
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/convert", { method: "POST", body });
          setOutput(await res.text());
        }}
        disabled={!file}
        className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-40"
      >
        Convertir
      </button>

      {output && (
        <textarea
          value={output}
          readOnly
          className="mt-6 w-full h-64 border p-2"
        />
      )}
    </main>
  );
}
