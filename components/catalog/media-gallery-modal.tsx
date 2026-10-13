"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseMediaItem } from "@/types/exercise";
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from "lucide-react";

interface MediaGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  media: ExerciseMediaItem[];
}

export function MediaGalleryModal({
  open,
  onOpenChange,
  exerciseName,
  media,
}: MediaGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const currentItem = media[currentIndex] || media[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "execution_start":
        return "Início do Movimento (M)";
      case "execution_end":
        return "Fim do Movimento (M)";
      case "execution_start_female":
        return "Início do Movimento (F)";
      case "execution_end_female":
        return "Fim do Movimento (F)";
      case "muscle_map":
        return "Mapa Muscular (M)";
      case "muscle_map_female":
        return "Mapa Muscular (F)";
      case "instruction_card":
        return "Cartão de Orientação (M)";
      case "instruction_card_female":
        return "Cartão de Orientação (F)";
      case "video":
        return "Vídeo de Execução";
      default:
        return "Mídia Visual";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base sm:text-lg font-bold">
            Galeria 9:16 — {exerciseName}
          </DialogTitle>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <Badge variant="outline">{getRoleLabel(currentItem.role)}</Badge>
            <span>
              {currentIndex + 1} de {media.length}
            </span>
          </div>
        </DialogHeader>

        {/* Visualizador de Mídia 9:16 */}
        <div className="relative aspect-[9/16] w-full max-h-[550px] bg-muted/40 rounded-xl overflow-hidden border border-border flex items-center justify-center my-2">
          {currentItem.availability === "available" && currentItem.url ? (
            <Image
              src={currentItem.url}
              alt={currentItem.label || exerciseName}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 90vw, 400px"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
              <ImageIcon className="w-12 h-12 stroke-[1.5] text-muted-foreground/60" />
              <p className="font-semibold text-sm text-foreground">Mídia Pendente de Download</p>
              <p className="text-xs max-w-xs">
                O arquivo original desta tomada ainda não está baixado localmente.
              </p>
              <Badge variant="secondary" className="gap-1 mt-2 text-[10px]">
                <AlertCircle className="w-3 h-3" />
                Disponível na próxima atualização
              </Badge>
            </div>
          )}

          {/* Navegação Prev / Next */}
          {media.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full shadow-md w-9 h-9"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full shadow-md w-9 h-9"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {currentItem.label && (
          <p className="text-xs text-center text-muted-foreground mt-1">
            {currentItem.label}
          </p>
        )}

        {/* Miniaturas de Acesso Rápido */}
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2 px-1 mt-2 scrollbar-thin">
            {media.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-12 h-16 rounded-md border-2 overflow-hidden bg-muted transition-all ${
                  currentIndex === idx ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {item.availability === "available" && item.url ? (
                  <Image
                    src={item.url}
                    alt={item.label || "Miniatura"}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] text-muted-foreground">
                    {idx + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
