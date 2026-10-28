"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressClientImage } from "@/lib/mercado/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureButtonProps {
  photoBase64?: string | null;
  onPhotoCaptured: (base64: string | undefined) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export function CameraCaptureButton({
  photoBase64,
  onPhotoCaptured,
  label = "Tirar Foto",
  helperText = "Opcional • usa a câmera traseira",
  className,
}: CameraCaptureButtonProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressClientImage(file, 960, 0.78);
      onPhotoCaptured(compressed);
    } catch (err) {
      console.error("[MERCADO] Erro ao processar foto:", err);
    } finally {
      setIsCompressing(false);
      // Reset input value
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoCaptured(undefined);
  };

  return (
    <div className={className}>
      {/* Hidden file inputs: one targeting camera, one targeting file system */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {photoBase64 ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 p-2 flex items-center justify-between gap-3">
          <div
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="relative size-14 rounded-lg overflow-hidden border border-border/60 bg-muted shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoBase64}
                alt="Foto capturada"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="size-4 text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                Foto anexada
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Toque para ampliar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="size-8 rounded-lg"
              title="Remover foto"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isCompressing}
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 text-xs font-semibold"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Otimizando imagem...</span>
                </>
              ) : (
                <>
                  <Camera className="size-4 text-primary" />
                  <span>{label}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isCompressing}
              onClick={() => galleryInputRef.current?.click()}
              className="size-12 rounded-xl border border-input text-muted-foreground hover:text-foreground shrink-0"
              title="Escolher da galeria"
            >
              <ImageIcon className="size-4" />
            </Button>
          </div>
          {helperText && (
            <p className="text-[11px] text-muted-foreground px-1">{helperText}</p>
          )}
        </div>
      )}

      {/* Modal de ampliação da foto */}
      {photoBase64 && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-md p-4 bg-background/95 backdrop-blur-md rounded-2xl">
            <DialogTitle className="text-sm font-semibold mb-2">
              Visualização da Imagem
            </DialogTitle>
            <div className="relative rounded-xl overflow-hidden border border-border max-h-[70vh] flex items-center justify-center bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoBase64}
                alt="Foto ampliada"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              className="w-full mt-2 rounded-xl"
            >
              Fechar visualização
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
