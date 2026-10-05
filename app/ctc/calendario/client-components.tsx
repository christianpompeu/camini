"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Search,
  X,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Aula, Disciplina } from "@/app/dashboard/ctc/actions";

interface CalendarioPublicoListProps {
  aulas: Aula[];
  disciplinas: Disciplina[];
}

export function CalendarioPublicoList({
  aulas,
  disciplinas,
}: CalendarioPublicoListProps) {
  const [search, setSearch] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [timeFilter, setTimeFilter] = useState<"todas" | "proximas" | "anteriores">("todas");

  const now = new Date();

  // Filtro de aulas
  const filtered = aulas.filter((aula) => {
    const dataAula = new Date(aula.data_hora);
    const isPast = dataAula < now;

    if (timeFilter === "proximas" && isPast) return false;
    if (timeFilter === "anteriores" && !isPast) return false;

    if (selectedDisciplina && aula.disciplina_id !== selectedDisciplina) {
      return false;
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      const discNome = aula.disciplina?.nome?.toLowerCase() || "";
      const profNome = aula.professor?.nome?.toLowerCase() || "";
      if (!discNome.includes(term) && !profNome.includes(term)) {
        return false;
      }
    }

    return true;
  });

  // Agrupamento por data (YYYY-MM-DD)
  const groupedByDate: { [key: string]: Aula[] } = {};
  filtered.forEach((aula) => {
    try {
      const dateKey = new Date(aula.data_hora).toISOString().split("T")[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(aula);
    } catch {
      const fallbackKey = aula.data_hora;
      if (!groupedByDate[fallbackKey]) {
        groupedByDate[fallbackKey] = [];
      }
      groupedByDate[fallbackKey].push(aula);
    }
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  const formatDateHeader = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatHorario = (dataHoraStr: string, duracaoMin: number) => {
    try {
      const inicio = new Date(dataHoraStr);
      const fim = new Date(inicio.getTime() + duracaoMin * 60000);
      const horaInicio = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(inicio);
      const horaFim = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(fim);
      return `${horaInicio} às ${horaFim}`;
    } catch {
      return `${duracaoMin} min`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por disciplina ou professor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Disciplina */}
          <div className="w-full sm:w-64 shrink-0">
            <select
              value={selectedDisciplina}
              onChange={(e) => setSelectedDisciplina(e.target.value)}
              aria-label="Filtrar por disciplina"
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas as disciplinas ({disciplinas.length})</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome} {d.carga_horaria ? `(${d.carga_horaria}h)` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha secundária: Filtros temporais e contador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button
              variant={timeFilter === "todas" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("todas")}
              className="h-7 text-xs px-2.5"
            >
              Todas ({aulas.length})
            </Button>
            <Button
              variant={timeFilter === "proximas" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("proximas")}
              className="h-7 text-xs px-2.5"
            >
              Próximas aulas
            </Button>
            <Button
              variant={timeFilter === "anteriores" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("anteriores")}
              className="h-7 text-xs px-2.5"
            >
              Realizadas
            </Button>
          </div>

          <div className="text-muted-foreground sm:text-right">
            Exibindo <strong className="text-foreground">{filtered.length}</strong> de{" "}
            {aulas.length} {aulas.length === 1 ? "aula programada" : "aulas programadas"}
          </div>
        </div>
      </div>

      {/* Listagem de Aulas Agrupadas por Data */}
      {sortedDates.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center shadow-xs">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Nenhuma aula encontrada
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || selectedDisciplina || timeFilter !== "todas"
              ? "Tente ajustar os filtros ou redefinir os termos da busca."
              : "Não há aulas cadastradas no calendário público no momento."}
          </p>
          {(search || selectedDisciplina || timeFilter !== "todas") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedDisciplina("");
                setTimeFilter("todas");
              }}
              className="mt-4 text-xs"
            >
              Limpar todos os filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateAulas = groupedByDate[dateKey];
            const dateObj = new Date(dateKey + "T00:00:00");
            const isToday =
              dateObj.toDateString() === new Date().toDateString();

            return (
              <section key={dateKey} className="space-y-3">
                {/* Header do Grupo de Data */}
                <div className="flex items-center gap-2.5 pb-1 border-b border-border">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <h2 className="text-sm font-semibold capitalize text-foreground">
                    {formatDateHeader(dateKey)}
                  </h2>
                  {isToday && (
                    <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4.5">
                      Hoje
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {dateAulas.length} {dateAulas.length === 1 ? "sessão" : "sessões"}
                  </span>
                </div>

                {/* Cards das Aulas do Dia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dateAulas.map((aula) => {
                    const aulaDate = new Date(aula.data_hora);
                    const isPast = aulaDate < now;

                    return (
                      <div
                        key={aula.id}
                        className={`rounded-lg border bg-card p-4 transition-all shadow-xs ${
                          isPast ? "border-border/60 opacity-80" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{formatHorario(aula.data_hora, aula.duracao_minutos)}</span>
                          </div>
                          <Badge
                            variant={isPast ? "secondary" : "outline"}
                            className="text-[11px] font-normal"
                          >
                            {aula.duracao_minutos} min
                          </Badge>
                        </div>

                        {/* Disciplina */}
                        <div className="space-y-1 mb-3">
                          <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
                            {aula.disciplina?.nome || "Disciplina não informada"}
                          </h3>
                          {aula.disciplina?.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {aula.disciplina.descricao}
                            </p>
                          )}
                        </div>

                        {/* Rodapé do Card: Professor */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{aula.professor?.nome || "Docente a definir"}</span>
                          </div>

                          {isPast ? (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                              Concluída
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                              Agendada
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
