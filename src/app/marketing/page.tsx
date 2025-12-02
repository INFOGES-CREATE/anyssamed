// src/app/(marketing)/page.tsx
"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Page() {
  return (
    <div className="min-h-screen px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">(marketing)</h1>
      <p className="text-gray-600">Contenido en construcción.</p>
    </div>
  );
}
