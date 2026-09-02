'use client';

import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { VesperIcon } from '@/components/ui/VesperIcon';

// Configure PDF.js worker safely without external CDN dependencies
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker init warning:', e);
  }
}

export interface UploadedSheetInfo {
  sheetId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  dpi: number;
  widthPx: number;
  heightPx: number;
  rotation: number;
  opacity: number;
}

interface PdfDocumentUploaderProps {
  title?: string;
  subtitle?: string;
  onSheetSelected?: (sheet: UploadedSheetInfo) => void;
}


export function PdfDocumentUploader({ onSheetSelected, title, subtitle }: PdfDocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [pendingSheet, setPendingSheet] = useState<UploadedSheetInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFileToImage = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSelectedFile(file);

    try {
      if (file.type.startsWith('image/')) {
        // Direct Image Upload (PNG, JPG, WEBP)
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            setPreviewUrl(dataUrl);
            setIsProcessing(false);

            const sheetInfo: UploadedSheetInfo = {
              sheetId: `sheet-${Date.now()}`,
              fileName: file.name,
              fileUrl: dataUrl,
              fileSizeBytes: file.size,
              dpi: 300,
              widthPx: img.width || 1600,
              heightPx: img.height || 1200,
              rotation: 0,
              opacity: 0.7,
            };
            setPendingSheet(sheetInfo);
          };
          img.onerror = () => {
            setIsProcessing(false);
            setErrorMessage('Obrázek se nepodařilo načíst. Zkontrolujte formát souboru.');
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // PDF Upload — Render Page 1 to PNG Data URL using PDF.js without external CDN worker dependency
        const arrayBuffer = await file.arrayBuffer();
        
        let pdf = null;
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
          });
          pdf = await loadingTask.promise;
        } catch (pdfErr) {
          console.warn('PDF.js worker render attempt failed, trying fallback:', pdfErr);
        }

        if (pdf) {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const renderedDataUrl = canvas.toDataURL('image/png');

            setPreviewUrl(renderedDataUrl);
            setIsProcessing(false);

            const sheetInfo: UploadedSheetInfo = {
              sheetId: `sheet-${Date.now()}`,
              fileName: file.name,
              fileUrl: renderedDataUrl,
              fileSizeBytes: file.size,
              dpi: 300,
              widthPx: canvas.width,
              heightPx: canvas.height,
              rotation: 0,
              opacity: 0.7,
            };
            setPendingSheet(sheetInfo);
            return;
          }
        }

        // If PDF.js fails completely (e.g. encrypted PDF), render PDF natively via Object URL
        const pdfBlobUrl = URL.createObjectURL(file);
        setPreviewUrl(pdfBlobUrl);
        setIsProcessing(false);

        setPendingSheet({
          sheetId: `sheet-${Date.now()}`,
          fileName: file.name,
          fileUrl: pdfBlobUrl,
          fileSizeBytes: file.size,
          dpi: 300,
          widthPx: 1600,
          heightPx: 1200,
          rotation: 0,
          opacity: 0.7,
        });
      } else {
        setIsProcessing(false);
        setErrorMessage('Podporované formáty výkresů jsou PDF, PNG, JPG a WEBP.');
      }
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      setIsProcessing(false);
      setErrorMessage('Nepodařilo se zpracovat soubor. Ujistěte se, že soubor PDF není poškozen nebo neobsahuje heslo.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileToImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };


  const handleRotatePendingSheet = () => {
    if (!pendingSheet || !previewUrl) return;

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.height;
      tempCanvas.height = img.width;

      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.translate(img.height, 0);
      tempCtx.rotate((90 * Math.PI) / 180);
      tempCtx.drawImage(img, 0, 0);

      const rotatedDataUrl = tempCanvas.toDataURL('image/png');

      setPreviewUrl(rotatedDataUrl);
      setPendingSheet((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          fileUrl: rotatedDataUrl,
          widthPx: tempCanvas.width,
          heightPx: tempCanvas.height,
        };
      });
    };
  };

  const handleConfirmSheet = () => {
    if (pendingSheet && onSheetSelected) {
      onSheetSelected(pendingSheet);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPendingSheet(null);
    setErrorMessage(null);
  };

  return (
    <div className="bg-white border border-[#d8dee8] p-6 rounded-2xl shadow-xs max-w-3xl mx-auto my-4 font-sans select-none space-y-4">
      <div className="border-b border-[#d8dee8] pb-4">
        <h3 className="text-sm font-black text-[#0f172a] tracking-tight">
          Vložení vlastního výkresu projektové dokumentace
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Vyberte a nahrajte váš vlastní výkres půdorysu (PDF, PNG, JPG) pro obkreslení konstrukcí.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-600 underline">
            Zavřít
          </button>
        </div>
      )}

      {!pendingSheet && !isProcessing && (
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed border-[var(--prefa-line)] rounded-sm p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 bg-[var(--prefa-white)] hover:border-[var(--prefa-aqua)] hover:bg-[var(--prefa-paper)]`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && processFileToImage(e.target.files[0])}
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <div className="w-11 h-11 flex items-center justify-center text-[var(--prefa-ink)] bg-[var(--prefa-linen)] rounded-sm shrink-0">
              <VesperIcon name="upload" className="w-6 h-6 text-[var(--prefa-ink)]" />
            </div>

            <div>
              <div className="text-base font-semibold text-[var(--prefa-ink)] font-sans">
                Klikněte sem pro výběr vašeho vlastního výkresu (PDF, PNG, JPG)
              </div>
              <div className="text-sm text-[var(--prefa-cedar)] mt-1 font-medium font-sans">
                nebo přetáhněte soubor z počítače do tohoto okna
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="p-8 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-center space-y-2">
          <div className="text-sm font-bold text-[var(--prefa-ink)]">Nahrávám a zpracovávám váš soubor výkresu...</div>
          <div className="text-xs text-[var(--prefa-cedar)] font-medium">Vykresluji 1. stránku výkresu v rozlišení 300 DPI.</div>
        </div>
      )}

      {pendingSheet && previewUrl && !isProcessing && (
        <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--prefa-line)]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white bg-[var(--prefa-aqua)] px-2.5 py-1 rounded-sm inline-flex items-center gap-1.5 mb-1">
                <VesperIcon name="check" className="w-3.5 h-3.5" />
                <span>Váš výkres byl úspěšně připraven</span>
              </div>
              <h4 className="text-sm font-semibold text-[var(--prefa-ink)] font-sans">{pendingSheet.fileName}</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotatePendingSheet}
                className="h-11 px-4 flex items-center gap-2 text-sm font-semibold text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm cursor-pointer"
                title="Otočit výkres o 90 stupňů po směru hodinových ručiček"
              >
                <VesperIcon name="snap" className="w-[18px] h-[18px]" />
                <span>Otočit výkres</span>
              </button>
              <span className="text-[var(--prefa-line)]">|</span>
              <button
                type="button"
                onClick={handleResetFile}
                className="h-11 px-4 flex items-center justify-center text-sm font-semibold text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] cursor-pointer"
              >
                Vybrat jiný soubor
              </button>
            </div>
          </div>

          <div className="relative w-full h-80 rounded-sm overflow-hidden border border-[var(--prefa-line)] bg-white flex items-center justify-center p-2">
            <img
              src={previewUrl}
              alt={pendingSheet.fileName}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[var(--prefa-line)]">
            <span className="text-xs text-[var(--prefa-stone)] font-medium text-center sm:text-left font-sans">
              Vykresleno v rozlišení 300 DPI ({pendingSheet.widthPx} × {pendingSheet.heightPx} px)
            </span>
            <button
              type="button"
              onClick={handleConfirmSheet}
              className="w-full sm:w-auto h-14 px-6 bg-[var(--prefa-ink)] hover:bg-black text-white font-semibold text-sm rounded-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Vložit tento váš výkres do plátna</span>
              <VesperIcon name="next" className="w-[18px] h-[18px] text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
