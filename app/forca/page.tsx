"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  ArrowLeft,
  Dumbbell,
  Clock,
  TrendingUp,
  History,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkoutCard } from "@/components/workout/workout-card";
import { ActiveSetCard } from "@/components/workout/active-set-card";
import { RestTimer } from "@/components/workout/rest-timer";
import { ExerciseHero } from "@/components/workout/exercise-hero";
import { BottomNavigation, NavItem } from "@/components/workout/bottom-navigation";

interface WorkoutDef {
  letter: "A" | "B" | "C";
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted: string;
  estimatedMinutes: number;
  exercises: string[];
}

const WORKOUT_PROGRAM: WorkoutDef[] = [
  {
    letter: "A",
    title: "Peito, Ombros e Tríceps",
    focus: "Hipertrofia & Força Estrita",
    exerciseCount: 6,
    lastExecuted: "Ontem, 19:30",
    estimatedMinutes: 50,
    exercises: [
      "Supino Inclinado com Halteres",
      "Supino Reto com Barra",
      "Desenvolvimento Militar com Halteres",
      "Elevação Lateral na Polia",
      "Tríceps Testa com Barra W",
      "Tríceps Corda na Polia",
    ],
  },
  {
    letter: "B",
    title: "Costas e Bíceps",
    focus: "Densidade Dorsal & Puxadas",
    exerciseCount: 6,
    lastExecuted: "Há 3 dias",
    estimatedMinutes: 55,
    exercises: [
      "Puxada Frontal Aberta",
      "Remada Curvada com Barra",
      "Remada Baixa no Triângulo",
      "Crucifixo Invertido",
      "Rosca Direta com Barra W",
      "Rosca Martelo com Halteres",
    ],
  },
  {
    letter: "C",
    title: "Pernas Completo",
    focus: "Quadríceps, Isquiotibiais & Panturrilhas",
    exerciseCount: 7,
    lastExecuted: "Há 5 dias",
    estimatedMinutes: 60,
    exercises: [
      "Agachamento Livre com Barra",
      "Leg Press 45°",
      "Cadeira Extensora",
      "Mesa Flexora",
      "Stiff com Halteres",
      "Elevação Pélvica",
      "Panturrilha no Smith",
    ],
  },
];

export default function ForcaAppPage() {
  const [activeTab, setActiveTab] = useState<NavItem["id"]>("treinos");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDef>(WORKOUT_PROGRAM[0]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const startWorkoutSession = (workout: WorkoutDef) => {
    setSelectedWorkout(workout);
    setActiveExerciseIndex(0);
    setSessionCompleted(false);
    setActiveTab("treinos");
  };

  const handleNextExercise = () => {
    if (activeExerciseIndex < selectedWorkout.exercises.length - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Barra de Navegação Superior Global */}
      <Navbar />

      {/* Sub-header Contextual do Módulo */}
      <div className="border-b border-border bg-muted/20 px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Camini Hub</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">FORÇA</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] gap-1.5 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Treino Ativo: Treino {selectedWorkout.letter}
            </Badge>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ABA: TREINOS (SELEÇÃO E EXECUÇÃO) */}
        {activeTab === "treinos" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header da Seção de Treinos */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Plano de Treino Atual
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Divisões do Ciclo
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Selecione o treino do dia ou continue a sessão ativa:
                </span>
              </div>
            </div>

            {/* Grid dos Cards de Treino */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {WORKOUT_PROGRAM.map((workout) => {
                const isSelected = selectedWorkout.letter === workout.letter;
                return (
                  <div key={workout.letter} className="relative">
                    <WorkoutCard
                      letter={workout.letter}
                      title={workout.title}
                      focus={workout.focus}
                      exerciseCount={workout.exerciseCount}
                      lastExecuted={workout.lastExecuted}
                      estimatedMinutes={workout.estimatedMinutes}
                      onStart={() => startWorkoutSession(workout)}
                      className={isSelected ? "ring-2 ring-primary" : ""}
                    />
                    {isSelected && (
                      <div className="absolute -top-2.5 right-4 z-10">
                        <Badge variant="default" className="text-[10px] px-2 py-0.5 font-bold">
                          Em Foco
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sessão em Andamento do Treino Selecionado */}
            <div className="pt-4 border-t border-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Sessão Ativa: Treino {selectedWorkout.letter}
                    </h2>
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {selectedWorkout.title}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Exercício {activeExerciseIndex + 1} de {selectedWorkout.exercises.length}:{" "}
                    <strong className="text-foreground">
                      {selectedWorkout.exercises[activeExerciseIndex]}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveExerciseIndex(0);
                      setSessionCompleted(false);
                    }}
                    className="gap-1.5 text-xs h-9"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reiniciar Sessão
                  </Button>
                </div>
              </div>

              {!sessionCompleted ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Coluna Principal: Registro de Cargas e Séries */}
                  <div className="lg:col-span-7 space-y-4">
                    <ActiveSetCard
                      exerciseName={selectedWorkout.exercises[activeExerciseIndex]}
                      targetMuscles={selectedWorkout.focus}
                      currentSet={2}
                      totalSets={4}
                      initialWeight={activeExerciseIndex === 0 ? 34 : 28}
                      initialReps={activeExerciseIndex === 0 ? 8 : 10}
                      initialRir={1}
                    />

                    {/* Botão de Avançar Exercício */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="text-xs text-muted-foreground">
                        <span>Próximo exercício: </span>
                        <span className="font-semibold text-foreground">
                          {selectedWorkout.exercises[activeExerciseIndex + 1] || "Conclusão do Treino"}
                        </span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleNextExercise}
                        className="gap-1.5 h-9 font-semibold"
                      >
                        <span>Próximo Exercício</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Coluna Secundária: Descanso com Temporizador */}
                  <div className="lg:col-span-5 space-y-4">
                    <RestTimer initialSeconds={90} />

                    {/* Lista Rápida dos Exercícios da Sessão */}
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Sequência do Treino {selectedWorkout.letter}
                      </h3>
                      <ul className="space-y-1.5 text-xs">
                        {selectedWorkout.exercises.map((name, idx) => {
                          const isCurrent = idx === activeExerciseIndex;
                          const isDone = idx < activeExerciseIndex;
                          return (
                            <li
                              key={name}
                              onClick={() => setActiveExerciseIndex(idx)}
                              className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : isDone
                                  ? "text-muted-foreground line-through hover:bg-muted/50"
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate mr-2">
                                <span className="font-mono text-[11px] opacity-70">
                                  #{idx + 1}
                                </span>
                                <span className="truncate">{name}</span>
                              </div>
                              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center rounded-xl border border-border bg-card space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                      Treino {selectedWorkout.letter} Finalizado!
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Excelente trabalho. Todas as séries e exercícios foram executados com foco pleno.
                    </p>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => {
                      setActiveExerciseIndex(0);
                      setSessionCompleted(false);
                    }}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Novo Treino
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: EXERCÍCIOS (CONSULTA E INSTRUÇÕES) */}
        {activeTab === "exercicios" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Biblioteca de Execução
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Instruções dos Exercícios
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Consulte a mecânica exata, músculos ativados e pontos de atenção para cada movimento.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExerciseHero
                name="Supino Reto com Barra"
                category="Peitoral & Tríceps"
                muscles={["Peitoral Maior", "Deltoide Anterior", "Tríceps Braquial"]}
                sets="4 Séries"
                reps="6 a 10 Repetições"
                cues={[
                  "Escápulas retraídas e deprimidas durante todo o movimento.",
                  "Trajetória da barra ligeiramente em arco até a linha dos mamilos.",
                  "Pausa controlada de 1 segundo no ponto de maior contração.",
                ]}
              />

              <ExerciseHero
                name="Supino Inclinado com Halteres"
                category="Peitoral Superior"
                muscles={["Peitoral Clavicular", "Deltoide Anterior", "Tríceps"]}
                sets="4 Séries"
                reps="8 a 12 Repetições"
                cues={[
                  "Banco regulado entre 30° e 45° de inclinação.",
                  "Cotovelos em ângulo de ~60° com o tronco, sem abrir excessivamente.",
                  "Controle a descida em 2 segundos sem tocar os halteres no topo.",
                ]}
              />
            </div>
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {activeTab === "historico" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Histórico de Execuções
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Treinos Anteriores
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Registros dos treinos e sobrecargas consolidadas.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  workout: "Treino A",
                  title: "Peito, Ombros e Tríceps",
                  date: "Ontem, 19:30",
                  duration: "48 min",
                  status: "Concluído",
                },
                {
                  workout: "Treino B",
                  title: "Costas e Bíceps",
                  date: "Há 3 dias",
                  duration: "52 min",
                  status: "Concluído",
                },
                {
                  workout: "Treino C",
                  title: "Pernas Completo",
                  date: "Há 5 dias",
                  duration: "58 min",
                  status: "Concluído",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {item.workout.replace("Treino ", "")}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {item.workout} — {item.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="secondary" className="w-fit text-xs font-semibold">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: PROGRESSO */}
        {activeTab === "progresso" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Sobrecarga Progressiva
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Evolução de Cargas
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Ganhos de carga verificados nos exercícios principais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Supino Inclinado com Halteres
                  </span>
                  <Badge variant="default" className="text-xs font-bold">
                    +4 kg esta semana
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-black text-foreground font-mono">
                    34 kg
                  </span>
                  <span className="text-xs text-muted-foreground">por halter • 8 reps (RIR 1)</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Agachamento Livre
                  </span>
                  <Badge variant="secondary" className="text-xs font-bold">
                    +5 kg esta semana
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-black text-foreground font-mono">
                    110 kg
                  </span>
                  <span className="text-xs text-muted-foreground">carga total • 6 reps (RIR 2)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior Flutuante Fixa */}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNavigation
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>
    </div>
  );
}
