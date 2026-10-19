"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, User, ArrowRight, Activity, Calendar } from "lucide-react";
import { MOCK_PATIENTS } from "@/data/nutre/mock-patients";
import { useNutreNavigation } from "./nutre-navigation-context";

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { resolveUrl, push } = useNutreNavigation();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = query.trim()
    ? MOCK_PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.cpf.includes(query) ||
          p.clinicalGoal.toLowerCase().includes(query.toLowerCase()) ||
          p.code.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_PATIENTS.slice(0, 5);

  const handleSelectPatient = (id: string) => {
    onClose();
    startTransition(() => {
      push(`/pacientes/${id}`);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E1B26]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#EAE5F2] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAE5F2]">
          <Search className="w-5 h-5 text-[#6846B5]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por paciente, CPF, objetivo ou código (#NUT)..."
            className="w-full bg-transparent text-sm text-[#1D1928] placeholder:text-[#7A7483] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[#7A7483] hover:text-[#1D1928] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-[#6B6678] bg-[#F8F1FF] border border-[#EAE5F2] rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F8F1FF]">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#7A7483] uppercase tracking-wider">
            {query.trim() ? "Resultados da Busca" : "Pacientes Recentes"}
          </div>

          {filteredPatients.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6B6678]">
              Nenhum paciente encontrado para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F1FC] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBDDFF] text-[#230E48] font-semibold text-xs flex items-center justify-center shrink-0">
                      {patient.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1D1928] group-hover:text-[#6846B5] transition-colors">
                          {patient.name}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F8F1FF] text-[#6846B5] font-medium border border-[#EDE5FA]">
                          {patient.clinicalGoal}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7483]">
                        {patient.code} • CPF: {patient.cpf} • {patient.age} anos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6846B5] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver Prontuário</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="p-3 bg-[#F8F1FF]/60 rounded-xl mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6678]">
            <div className="flex items-center gap-3">
              <Link
                href={resolveUrl("/nutre/pacientes/novo")}
                onClick={onClose}
                className="hover:text-[#6846B5] font-medium flex items-center gap-1 transition-colors"
              >
                <span>+ Novo Paciente</span>
              </Link>
              <span>•</span>
              <Link
                href={resolveUrl("/nutre/pacientes")}
                onClick={onClose}
                className="hover:text-[#6846B5] font-medium flex items-center gap-1 transition-colors"
              >
                <span>Ver Todos os Pacientes</span>
              </Link>
            </div>
            <span className="text-[11px] text-[#7A7483]">
              Navegue com ↑ ↓ e pressione Enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
