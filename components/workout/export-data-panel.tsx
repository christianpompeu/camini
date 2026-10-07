"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useWorkoutStore } from "@/store/useWorkoutStore";

export function ExportDataPanel() {
  const { completedWorkouts } = useWorkoutStore();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(completedWorkouts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `camini-treinos-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    // Flat CSV of all sets
    const headers = [
      "Session ID", "Date", "Session Title", "Session Status", "Observation", 
      "Exercise Name", "Target Muscle", "Set Number", "Set Type", 
      "Weight (kg)", "Reps/Duration/Distance", "RIR", "Side", "Notes"
    ];

    const rows = [headers.join(",")];

    completedWorkouts.forEach(session => {
      const sessionDate = new Date(session.startTime).toISOString();
      const sessionStatus = session.status || (session.isCompleted ? "completed" : "partial");
      const sessionObs = `"${(session.observation || "").replace(/"/g, '""')}"`;

      session.exercises.forEach(ex => {
        ex.sets.forEach((set, idx) => {
          const row = [
            session.id,
            sessionDate,
            `"${session.title}"`,
            sessionStatus,
            sessionObs,
            `"${ex.exerciseName}"`,
            `"${ex.targetMuscles}"`,
            idx + 1,
            set.type,
            set.weight,
            ex.measurementType === "duration" ? set.durationSeconds : (ex.measurementType === "distance" ? set.distanceMeters : set.reps),
            set.rir ?? "",
            set.side || "",
            `"${(set.note || "").replace(/"/g, '""')}"`
          ];
          rows.push(row.join(","));
        });
      });
    });

    const csvContent = rows.join("\n");
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `camini-series-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Exportar Dados Locais</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExportJSON} variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Exportar JSON
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV (Séries)
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center sm:text-left">
        Faça o download do seu histórico local para análise externa.
      </p>
    </div>
  );
}
