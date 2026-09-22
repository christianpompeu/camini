import React from "react";

export default function CalendarioPublicoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#00c896] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Calendário CTC</h1>
          <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            Curso de Teologia Cristã
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto py-8 px-4 md:px-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Sem aulas programadas no momento</h2>
          <p>O calendário de aulas aparecerá aqui quando as próximas aulas forem agendadas.</p>
        </div>
      </main>
    </div>
  );
}
