"use client";

import React, { useState } from "react";
import { useWorkoutStore, WorkoutSession } from "@/store/useWorkoutStore";
import { format, isSameWeek, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, Dumbbell, Calendar, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface HistoryListProps {
  onSessionClick: (session: WorkoutSession) => void;
}

export function HistoryList({ onSessionClick }: HistoryListProps) {
  const { completedWorkouts } = useWorkoutStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLetter, setFilterLetter] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPeriod, setFilterPeriod] = useState<string>("ALL");

  const filteredSessions = completedWorkouts.filter(session => {
    // Busca por título
    if (searchTerm && !session.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Filtro por Ficha A-E
    if (filterLetter !== "ALL" && session.letter !== filterLetter) return false;
    
    // Filtro por Status
    if (filterStatus !== "ALL" && session.status !== filterStatus) return false;

    // Filtro de Período
    const now = new Date();
    const sessionDate = new Date(session.startTime);
    if (filterPeriod === "WEEK" && !isSameWeek(sessionDate, now, { weekStartsOn: 1 })) return false;
    if (filterPeriod === "MONTH" && !isSameMonth(sessionDate, now)) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filtros */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar sessão por título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterLetter} onValueChange={setFilterLetter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Ficha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas Fichas</SelectItem>
              <SelectItem value="A">Treino A</SelectItem>
              <SelectItem value="B">Treino B</SelectItem>
              <SelectItem value="C">Treino C</SelectItem>
              <SelectItem value="D">Treino D</SelectItem>
              <SelectItem value="E">Treino E</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Qualquer Status</SelectItem>
              <SelectItem value="completed">Completo</SelectItem>
              <SelectItem value="partial">Incompleto</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todo Período</SelectItem>
              <SelectItem value="WEEK">Esta Semana</SelectItem>
              <SelectItem value="MONTH">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Sessões */}
      {filteredSessions.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground flex flex-col items-center gap-3">
          <HistoryIcon className="w-10 h-10 opacity-20" />
          <p>Nenhuma sessão encontrada para os filtros selecionados.</p>
          {(searchTerm || filterLetter !== "ALL" || filterStatus !== "ALL" || filterPeriod !== "ALL") && (
            <Button variant="link" onClick={() => {
              setSearchTerm("");
              setFilterLetter("ALL");
              setFilterStatus("ALL");
              setFilterPeriod("ALL");
            }}>Limpar filtros</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredSessions.map((session) => {
            const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
            
            return (
              <button 
                key={session.id}
                onClick={() => onSessionClick(session)}
                className="text-left bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:bg-muted/30 transition-colors active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">Treino {session.letter}</span>
                    <Badge variant={session.status === "partial" ? "outline" : "default"} className="text-[10px] h-5 px-1.5">
                      {session.status === "partial" ? "Parcial" : "Completo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{session.title}</p>
                  
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.startTime), "dd MMM", { locale: ptBR })}
                    </div>
                    {session.durationMs && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(session.durationMs / 60000)}m
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" />
                      {totalSets} séries
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
