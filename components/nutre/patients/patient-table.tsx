"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  RotateCcw,
  X,
  Phone,
  Mail,
  FolderOpen,
  MoreVertical,
  ArrowUpDown,
  CheckSquare,
  FileSpreadsheet,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { MOCK_PATIENTS } from "@/data/nutre/mock-patients";
import { Patient, ClinicalGoal, PatientStatus } from "@/types/nutre";
import { useNutreNavigation } from "@/components/nutre/nutre-navigation-context";

export function PatientTable() {
  const { resolveUrl } = useNutreNavigation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [goalFilter, setGoalFilter] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<string>("recente");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Filtered and sorted patients
  const filteredPatients = useMemo(() => {
    return MOCK_PATIENTS.filter((patient) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search.trim() ||
        patient.name.toLowerCase().includes(searchLower) ||
        patient.cpf.includes(search) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.clinicalGoal.toLowerCase().includes(searchLower) ||
        patient.address.city.toLowerCase().includes(searchLower) ||
        (patient.tags && patient.tags.some((t) => t.toLowerCase().includes(searchLower)));

      // Status
      const matchStatus =
        statusFilter === "todos" || patient.status === statusFilter;

      // Goal
      const matchGoal =
        goalFilter === "todos" ||
        patient.clinicalGoal.toLowerCase().includes(goalFilter.toLowerCase());

      return matchSearch && matchStatus && matchGoal;
    }).sort((a, b) => {
      if (sortOrder === "nome_az") {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === "nome_za") {
        return b.name.localeCompare(a.name);
      }
      if (sortOrder === "antiga") {
        return a.lastConsultation.localeCompare(b.lastConsultation);
      }
      // default: recente
      return b.lastConsultation.localeCompare(a.lastConsultation);
    });
  }, [search, statusFilter, goalFilter, sortOrder]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPatients.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setGoalFilter("todos");
    setSortOrder("recente");
    setSelectedIds([]);
  };

  const isAllSelected =
    filteredPatients.length > 0 &&
    selectedIds.length === filteredPatients.length;

  return (
    <div className="space-y-4">
      {/* Control & Filter Bar */}
      <div className="p-4 bg-[#FFFFFF] border border-[#EAE5F2] rounded-xl shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7483]" />
            <input
              id="search-patients"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CPF (000.000.000-00), e-mail ou tag..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2] text-[#1D1928] placeholder:text-[#7A7483] text-xs sm:text-sm focus:outline-none focus:border-[#6846B5] focus:bg-[#FFFFFF] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7483] hover:text-[#1D1928] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Select */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2] text-[#1D1928] text-xs font-medium focus:outline-none focus:border-[#6846B5] cursor-pointer hover:bg-[#F3EAFF] transition-colors"
              >
                <option value="todos">Status: Todos</option>
                <option value="ativo">Status: Ativos (84)</option>
                <option value="pausado">Status: Pausados (12)</option>
                <option value="alta">Status: Em Alta (24)</option>
                <option value="inativo">Status: Inativos (28)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A7483]" />
            </div>

            {/* Clinical Goal Select */}
            <div className="relative">
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2] text-[#1D1928] text-xs font-medium focus:outline-none focus:border-[#6846B5] cursor-pointer hover:bg-[#F3EAFF] transition-colors"
              >
                <option value="todos">Objetivo: Todos</option>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="hipertrofia">Hipertrofia &amp; Rendimento</option>
                <option value="clinica">Clínica Geral</option>
                <option value="sop">SOP &amp; Hormonal</option>
                <option value="gestantes">Gestantes</option>
                <option value="longevidade">Longevidade</option>
                <option value="saúde intestinal">Saúde Intestinal</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A7483]" />
            </div>

            {/* Order Select */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2] text-[#1D1928] text-xs font-medium focus:outline-none focus:border-[#6846B5] cursor-pointer hover:bg-[#F3EAFF] transition-colors"
              >
                <option value="recente">Ordenar: Última Consulta (Recente)</option>
                <option value="antiga">Ordenar: Última Consulta (Antiga)</option>
                <option value="nome_az">Nome (A - Z)</option>
                <option value="nome_za">Nome (Z - A)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A7483]" />
            </div>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              type="button"
              className="h-9 px-2.5 rounded-lg text-[#7A7483] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>

        {/* Active Filters Chips */}
        {(statusFilter !== "todos" || goalFilter !== "todos" || search.trim()) && (
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#EDE5FA]/50 text-xs text-[#494552]">
            <span className="text-[11px] font-semibold text-[#7A7483] uppercase tracking-wider">
              Filtros Ativos:
            </span>

            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDE5FA] text-[#1D1928] font-medium text-xs">
                Termo: &ldquo;{search}&rdquo;
                <button
                  onClick={() => setSearch("")}
                  className="hover:text-[#BA1A1A] ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== "todos" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDE5FA] text-[#1D1928] font-medium text-xs">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("todos")}
                  className="hover:text-[#BA1A1A] ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {goalFilter !== "todos" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDE5FA] text-[#1D1928] font-medium text-xs">
                Objetivo: {goalFilter}
                <button
                  onClick={() => setGoalFilter("todos")}
                  className="hover:text-[#BA1A1A] ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Batch Selection Bar (Appears when >= 1 checkbox picked) */}
      {selectedIds.length > 0 && (
        <div className="p-3 sm:p-4 rounded-xl bg-[#6846B5] text-[#FFFFFF] flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-[#EBDDFF]" />
            <span className="text-sm font-semibold">
              <strong className="font-bold">{selectedIds.length}</strong> pacientes selecionados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 px-3 rounded-lg bg-[#FFFFFF] text-[#6846B5] hover:bg-[#F8F1FF] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mensagem em Lote</span>
            </button>
            <button
              type="button"
              className="h-8 px-3 rounded-lg bg-[#EDE5FA]/20 hover:bg-[#EDE5FA]/30 text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-1.5 border border-[#EDE5FA]/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      )}

      {/* High-Density Clinical Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#EAE5F2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[960px]">
            {/* Table Header */}
            <thead className="bg-[#F8F1FF] text-[#494552] text-[11px] font-semibold uppercase tracking-wider select-none border-b border-[#EAE5F2]">
              <tr>
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#CBC3D4] text-[#6846B5] focus:ring-[#6846B5] h-4 w-4 cursor-pointer accent-[#6846B5]"
                  />
                </th>
                <th className="px-4 py-3.5 font-semibold w-[260px]">Paciente</th>
                <th className="px-4 py-3.5 font-semibold w-[240px]">Contato</th>
                <th className="px-4 py-3.5 font-semibold w-[200px]">Objetivo Clínico</th>
                <th className="px-4 py-3.5 font-semibold w-[160px]">Última Consulta</th>
                <th className="px-4 py-3.5 font-semibold w-[160px]">Status do Plano</th>
                <th className="px-4 py-3.5 font-semibold w-[180px] text-right">Ações</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#EDE5FA]/60 text-[#1D1928]">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7A7483]">
                    Nenhum paciente encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const isChecked = selectedIds.includes(patient.id);
                  const isVigente = patient.planStatus === "Vigente";

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-[#F8F1FF]/60 transition-colors group ${
                        isChecked ? "bg-[#F8F1FF]/80" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(patient.id)}
                          className="rounded border-[#CBC3D4] text-[#6846B5] focus:ring-[#6846B5] h-4 w-4 cursor-pointer accent-[#6846B5]"
                        />
                      </td>

                      {/* Paciente */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EBDDFF] text-[#230E48] flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[#FFFFFF]">
                            {patient.avatarInitials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={resolveUrl(`/nutre/pacientes/${patient.id}`)}
                              className="font-semibold text-sm text-[#1D1928] group-hover:text-[#6846B5] transition-colors truncate"
                            >
                              {patient.name}
                            </Link>
                            <span className="text-xs text-[#7A7483] truncate">
                              {patient.age} anos • {patient.address.city}, {patient.address.state}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-tabular text-[#1D1928] font-medium flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#685490]" />
                            {patient.phone}
                          </span>
                          <span className="text-[#7A7483] flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-[#7A7483]" />
                            {patient.email}
                          </span>
                        </div>
                      </td>

                      {/* Objetivo Clínico */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E9DDFF] text-[#522E9E] text-[11px] font-semibold">
                          {patient.clinicalGoal}
                        </span>
                      </td>

                      {/* Última Consulta */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-tabular font-semibold text-[#6846B5]">
                            {patient.lastConsultation}
                          </span>
                          <span className="text-[11px] text-[#93AA91] font-medium">
                            {patient.lastConsultationRelative}
                          </span>
                        </div>
                      </td>

                      {/* Status do Plano */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isVigente ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1E9CE] text-[#0C200F] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#93AA91]" />
                            Vigente (Sálvia)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DCA76B]" />
                            Ajuste pendente
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={resolveUrl(`/nutre/pacientes/${patient.id}`)}
                            className="h-8 px-3 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Ver Prontuário</span>
                          </Link>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === patient.id ? null : patient.id
                                )
                              }
                              type="button"
                              className="h-8 w-8 rounded-lg text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] flex items-center justify-center transition-colors cursor-pointer"
                              title="Mais opções"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdownId === patient.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-44 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#EAE5F2] p-1.5 z-40 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                  <Link
                                    href={resolveUrl(`/nutre/pacientes/${patient.id}`)}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="block px-3 py-1.5 text-xs text-[#1D1928] hover:bg-[#F8F1FF] rounded-md font-medium"
                                  >
                                    Abrir Prontuário
                                  </Link>
                                  <button
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-[#1D1928] hover:bg-[#F8F1FF] rounded-md font-medium"
                                  >
                                    Nova Consulta
                                  </button>
                                  <button
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-[#1D1928] hover:bg-[#F8F1FF] rounded-md font-medium"
                                  >
                                    Exportar Dados
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="p-3 sm:px-4 bg-[#F8F1FF] border-t border-[#EDE5FA]/70 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6678] gap-2">
          <span>
            Exibindo <strong className="text-[#1D1928]">{filteredPatients.length}</strong> de{" "}
            <strong className="text-[#1D1928]">148</strong> pacientes cadastrados
          </span>
          <span className="text-[11px] text-[#7A7483]">
            Base de demonstração ativa • Atualizado hoje
          </span>
        </div>
      </div>
    </div>
  );
}
