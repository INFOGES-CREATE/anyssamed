"use client";

import { HelpCircle, MessageSquare, Mail, Phone, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AyudaPage() {
  const faqs = [
    { q: "No puedo iniciar sesión", a: "Verifica tu correo/usuario y restablece la contraseña. Si tienes 2FA, confirma el OTP." },
    { q: "¿Cómo migro a Firestore?", a: "Usa nuestras plantillas de colección y reglas de seguridad; consulta la guía de Documentación." },
    { q: "Error de permisos", a: "Revisa las reglas de seguridad y el rol del usuario en tu proyecto." },
  ];
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-28 pb-10 px-4 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ayuda & Soporte</h1>
              <p className="text-gray-600">Estamos contigo 24/7</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <a href="#" className="p-6 rounded-2xl border bg-white hover:shadow-lg transition">
              <div className="flex items-center gap-3 font-semibold text-gray-900">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Chat en vivo
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                Soporte prioritario para clientes Enterprise.
              </p>
            </a>
            <a href="mailto:contacto@medisuitepro.cl" className="p-6 rounded-2xl border bg-white hover:shadow-lg transition">
              <div className="flex items-center gap-3 font-semibold text-gray-900">
                <Mail className="w-5 h-5 text-amber-600" />
                contacto@medisuitepro.cl
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                Respuesta en menos de 12 horas.
              </p>
            </a>
            <a href="tel:+56228457890" className="p-6 rounded-2xl border bg-white hover:shadow-lg transition">
              <div className="flex items-center gap-3 font-semibold text-gray-900">
                <Phone className="w-5 h-5 text-amber-600" />
                +56 2 2845 7890
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                Lunes a Viernes 9:00–18:00.
              </p>
            </a>
          </div>

          <div className="mt-10 p-6 rounded-2xl border bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ rápidas</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="border-b pb-4">
                  <p className="font-semibold text-gray-900">{f.q}</p>
                  <p className="text-gray-600 mt-1">{f.a}</p>
                </div>
              ))}
            </div>

            <a href="/recursos/documentacion" className="inline-flex items-center gap-2 mt-6 text-amber-700 font-semibold">
              Ver guías de solución <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
