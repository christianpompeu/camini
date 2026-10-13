"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useWorkoutStore, WorkoutSession } from "@/store/useWorkoutStore";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { CatalogExercise } from "@/types/exercise";

import { useWorkoutPlanStore } from "@/store/useWorkoutPlanStore";
import { WorkoutPlan } from "@/types/workout-plan";

export function escapeCsvField(val: unknown): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  // Escapa aspas duplicando-as conforme RFC 4180
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function formatWorkoutsAsJson(
  sessions: WorkoutSession[],
  catalog?: CatalogExercise[],
  workoutPlans?: WorkoutPlan[],
  activePlanId?: string | null
): string {
  const exportPayload = {
    app: "Camini FORÇA",
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    activePlanId: activePlanId || null,
    workoutPlans: workoutPlans || [],
    sessions,
    catalog: catalog || [],
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function formatWorkoutsAsCsv(sessions: WorkoutSession[]): string {
  const headers = [
    "Session ID",
    "Session Date (ISO)",
    "Workout Letter",
    "Session Title",
    "Session Status",
    "Session Notes",
    "Exercise ID",
    "Exercise Name",
    "Target Muscle",
    "Set Index",
    "Set Type",
    "Is Extra",
    "Is Corrected",
    "Load Convention",
    "Weight (kg)",
    "Measurement Type",
    "Metric Value",
    "Metric Unit",
    "RIR",
    "Side",
    "Set Notes",
  ];

  const rows: string[] = [headers.map(escapeCsvField).join(",")];

  sessions.forEach((session) => {
    const sessionDate = new Date(session.startTime).toISOString();
    const sessionStatus = session.status || (session.isCompleted ? "completed" : "partial");
    const sessionObs = session.observation || "";

    session.exercises.forEach((ex) => {
      ex.sets.forEach((set, idx) => {
        const isExtra = Boolean(set.isExtra || set.type === "extra");
        const isCorrected = Boolean(set.editedAt);

        let metricValue: number | string = "";
        let metricUnit = "reps";
        if (ex.measurementType === "duration") {
          metricValue = set.durationSeconds ?? set.reps ?? "";
          metricUnit = "segundos";
        } else if (ex.measurementType === "distance") {
          metricValue = set.distanceMeters ?? set.reps ?? "";
          metricUnit = "metros";
        } else {
          metricValue = set.reps ?? "";
          metricUnit = "repetições";
        }

        const rirValue = set.rir !== undefined ? (set.rir >= 4 ? "4+" : set.rir) : "";

        const row = [
          session.id,
          sessionDate,
          session.letter,
          session.title,
          sessionStatus,
          sessionObs,
          ex.definitionId,
          ex.exerciseName,
          ex.targetMuscles,
          idx + 1,
          set.type,
          isExtra ? "true" : "false",
          isCorrected ? "true" : "false",
          ex.loadConvention,
          set.weight,
          ex.measurementType,
          metricValue,
          metricUnit,
          rirValue,
          set.side || "",
          set.note || "",
        ];

        rows.push(row.map(escapeCsvField).join(","));
      });
    });
  });

  return rows.join("\r\n");
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", url);
  linkElement.setAttribute("download", filename);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}

export function ExportDataPanel() {
  const { completedWorkouts } = useWorkoutStore();
  const { exercises } = useExerciseCatalogStore();
  const { plans, activePlanId } = useWorkoutPlanStore();

  const handleExportJSON = () => {
    const jsonStr = formatWorkoutsAsJson(completedWorkouts, exercises, plans, activePlanId);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(jsonStr, `camini-forca-export-${dateStr}.json`, "application/json;charset=utf-8;");
  };

  const handleExportCSV = () => {
    const csvContent = formatWorkoutsAsCsv(completedWorkouts);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(csvContent, `camini-forca-series-${dateStr}.csv`, "text/csv;charset=utf-8;");
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Exportar Dados Locais
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExportJSON} variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Exportar JSON (Completo)
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV (Séries Detalhadas)
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center sm:text-left">
        Faça o download do seu histórico local com versionamento de esquema e unidades claras para análise externa.
      </p>
    </div>
  );
}

