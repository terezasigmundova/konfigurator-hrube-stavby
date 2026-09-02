'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Point2D, calculateScaleFactor, calculateSegmentLengthM, calculatePolygonAreaM2, distance2D, isEnvelopeClosed } from '@/lib/geometry';
import { CATALOG_UNIT_PRICES } from '@/lib/pricing';
import { VesperIcon } from '@/components/ui/VesperIcon';
import { UploadedSheetInfo } from '@/components/documents/PdfDocumentUploader';

export interface PolygonOpening {
  id: string;
  points: Point2D[];
  areaM2: number;
}

export interface TraceElement {
  id: string;
  category: 'WALL_OUTER' | 'WALL_INNER' | 'FLOOR' | 'CEILING' | 'ROOF';
  catalogCode: string;
  points: Point2D[];
  lengthOrAreaM: number;
  openings?: PolygonOpening[];
  isClosedLoop?: boolean;
  storey: '1NP' | '2NP' | '3NP';
  pitchDegrees?: number;
}

function distanceToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const l2 = Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);
  if (l2 === 0) return distance2D(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  return distance2D(p, projection);
}

function isPointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

interface InteractiveCanvasProps {
  backgroundImageUrl?: string;
  opacity?: number;
  rotation?: number;
  activeCatalogCode?: string;
  activeCategory?: TraceElement['category'];
  activeStorey?: '1NP' | '2NP' | '3NP';
  initialScale?: number | null;
  initialElements?: TraceElement[];
  onElementsChange?: (elements: TraceElement[]) => void;
  onScaleCalibrated?: (scaleMetresPerPx: number) => void;
  onSelectElement?: (element: TraceElement | null) => void;
  onResetSheet?: () => void;
  onUpdateSheet?: (sheet: Partial<UploadedSheetInfo>) => void;
}

export function InteractiveCanvas({
  backgroundImageUrl,
  opacity = 0.55,
  rotation = 0,
  activeCatalogCode = '1.1',
  activeCategory = 'WALL_OUTER',
  activeStorey = '1NP',
  initialScale = null,
  initialElements = [],
  onElementsChange,
  onScaleCalibrated,
  onSelectElement,
  onResetSheet,
  onUpdateSheet,
}: InteractiveCanvasProps) {
  const [scaleMetresPerPx, setScaleMetresPerPx] = useState<number | null>(initialScale || null);
  const [isScaleLocked, setIsScaleLocked] = useState<boolean>(!!initialScale);
  
  // Default mode upon displaying canvas is ALWAYS 'PAN' (Hand tool)
  const [toolMode, setToolMode] = useState<'PAN' | 'CALIBRATE' | 'TRACE' | 'SELECT'>('PAN');

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<Point2D>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });

  const [calibPoints, setCalibPoints] = useState<Point2D[]>([]);
  const [realDistanceMInput, setRealDistanceMInput] = useState<string>('');

  // Roof Pitch Selector State (0°, 35°, or Custom)
  const [roofPitchMode, setRoofPitchMode] = useState<'0' | '35' | 'CUSTOM'>('35');
  const [activeRoofPitch, setActiveRoofPitch] = useState<number>(35);
  const [showCalibWarning, setShowCalibWarning] = useState<boolean>(false);

  const [elements, setElements] = useState<TraceElement[]>(initialElements);
  const [currentLinePoints, setCurrentLinePoints] = useState<Point2D[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point2D | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(4.0, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  useEffect(() => {
    setScaleMetresPerPx(initialScale || null);
    setIsScaleLocked(!!initialScale);
  }, [initialScale]);

  useEffect(() => {
    if (!backgroundImageUrl) {
      setBgImage(null);
      return;
    }
    const img = new Image();
    img.src = backgroundImageUrl;
    img.onload = () => setBgImage(img);
    img.onerror = (e) => console.warn('Canvas background image load warning:', e);
  }, [backgroundImageUrl]);

  const handleRotateSheet = (direction: 'CW' | 'CCW') => {
    if (!bgImage || !backgroundImageUrl) return;

    // 1. Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    // Swap width and height for 90 deg rotation
    tempCanvas.width = bgImage.height;
    tempCanvas.height = bgImage.width;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 2. Perform the rotation drawing
    if (direction === 'CW') {
      tempCtx.translate(bgImage.height, 0);
      tempCtx.rotate((90 * Math.PI) / 180);
    } else {
      tempCtx.translate(0, bgImage.width);
      tempCtx.rotate((-90 * Math.PI) / 180);
    }
    tempCtx.drawImage(bgImage, 0, 0);

    // 3. Generate new rotated dataURL
    const rotatedDataUrl = tempCanvas.toDataURL('image/png');

    // 4. Update the parent page sheet state
    if (onUpdateSheet) {
      onUpdateSheet({
        fileUrl: rotatedDataUrl,
        widthPx: tempCanvas.width,
        heightPx: tempCanvas.height,
      });
    }

    // 5. Rotate points in canvas coordinate space proportionally
    const imgAspectNew = bgImage.height / bgImage.width;
    const containerAspect = 900 / 550;
    let W_new = 900;
    let H_new = 550;
    if (imgAspectNew > containerAspect) {
      W_new = 900;
      H_new = Math.round(900 / imgAspectNew);
    } else {
      H_new = 550;
      W_new = Math.round(550 * imgAspectNew);
    }

    const W_old = canvasWidth;
    const H_old = canvasHeight;

    const transformPoint = (pt: Point2D) => {
      if (direction === 'CW') {
        return {
          x: W_new - pt.y * (W_new / H_old),
          y: pt.x * (H_new / W_old),
        };
      } else {
        return {
          x: pt.y * (W_new / H_old),
          y: H_new - pt.x * (H_new / W_old),
        };
      }
    };

    const rotatedCalibPoints = calibPoints.map(transformPoint);
    setCalibPoints(rotatedCalibPoints);

    // Rotate currentLinePoints (line in progress)
    const rotatedCurrentLinePoints = currentLinePoints.map(transformPoint);
    setCurrentLinePoints(rotatedCurrentLinePoints);

    // Rotate traced elements (tracedElements)
    const rotatedElements = elements.map((el) => {
      const isSameStorey = el.storey === activeStorey;
      const isRelatedCategory =
        el.category === activeCategory ||
        (activeCategory.startsWith('WALL') && el.category.startsWith('WALL'));

      if (isSameStorey && isRelatedCategory) {
        return {
          ...el,
          points: el.points.map(transformPoint),
        };
      }
      return el;
    });

    // Notify parent
    if (onElementsChange) {
      onElementsChange(rotatedElements);
    } else {
      setElements(rotatedElements);
    }
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentLinePoints([]);
        setSelectedElementId(null);
        setShowCalibWarning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTraceTool = () => {
    if (!isScaleLocked) {
      setShowCalibWarning(true);
      setToolMode('CALIBRATE');
      return;
    }
    setShowCalibWarning(false);
    setToolMode('TRACE');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (toolMode === 'PAN' || e.button === 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (e.button === 2) {
      e.preventDefault();
      setCurrentLinePoints([]);
      setSelectedElementId(null);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const canvasX = (e.clientX - rect.left - panOffset.x) / zoomScale;
    const canvasY = (e.clientY - rect.top - panOffset.y) / zoomScale;
    setHoverPoint({ x: canvasX, y: canvasY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const canvasX = (rawX - panOffset.x) / zoomScale;
    const canvasY = (rawY - panOffset.y) / zoomScale;
    const clickedPoint = { x: canvasX, y: canvasY };

    if (toolMode === 'CALIBRATE' && !isScaleLocked) {
      if (calibPoints.length < 2) {
        setCalibPoints((prev) => [...prev, clickedPoint]);
      } else {
        setCalibPoints([clickedPoint]);
      }
      return;
    }

    if (toolMode === 'TRACE') {
      if (!isScaleLocked || scaleMetresPerPx === null) {
        setShowCalibWarning(true);
        setToolMode('CALIBRATE');
        return;
      }

      if (activeCategory === 'WALL_INNER') {
        if (currentLinePoints.length === 0) {
          setCurrentLinePoints([clickedPoint]);
        } else {
          const ptA = currentLinePoints[0];
          const ptB = clickedPoint;
          const pxLength = distance2D(ptA, ptB);
          const lengthM = pxLength * scaleMetresPerPx;

          const newElement: TraceElement = {
            id: `el-${Date.now()}`,
            category: 'WALL_INNER',
            catalogCode: activeCatalogCode,
            points: [ptA, ptB],
            lengthOrAreaM: lengthM,
            storey: activeStorey,
          };

          const updated = [...elements, newElement];
          setElements(updated);
          setCurrentLinePoints([]);
          if (onElementsChange) onElementsChange(updated);
        }
        return;
      }

      if (activeCategory === 'WALL_OUTER') {
        if (currentLinePoints.length === 0) {
          setCurrentLinePoints([clickedPoint]);
        } else {
          const ptA = currentLinePoints[currentLinePoints.length - 1];
          const ptB = clickedPoint;
          const pxLength = distance2D(ptA, ptB);
          const lengthM = pxLength * scaleMetresPerPx;

          const newElement: TraceElement = {
            id: `el-${Date.now()}-${Math.random()}`,
            category: 'WALL_OUTER',
            catalogCode: activeCatalogCode,
            points: [ptA, ptB],
            lengthOrAreaM: lengthM,
            storey: activeStorey,
            isClosedLoop: false,
          };

          const updated = [...elements, newElement];
          setElements(updated);
          setCurrentLinePoints([clickedPoint]);
          if (onElementsChange) onElementsChange(updated);
        }
        return;
      }

      if (currentLinePoints.length >= 3) {
        const firstPt = currentLinePoints[0];
        const distToFirst = distance2D(clickedPoint, firstPt);
        if (distToFirst < 30 / zoomScale) {
          finishCurrentPolygon(true);
          return;
        }
      }

      setCurrentLinePoints((prev) => [...prev, clickedPoint]);
      return;
    }

    if (toolMode === 'SELECT') {
      const hitRadiusPx = 25 / zoomScale;
      const found = elements.find((el) => {
        if (el.storey !== activeStorey) return false;
        if (el.category !== activeCategory && !(activeCategory === 'WALL_INNER' && el.category === 'WALL_OUTER')) return false;

        // 1. Check distance to any corner vertex
        if (el.points.some((pt) => distance2D(pt, clickedPoint) < hitRadiusPx)) {
          return true;
        }

        // 2. Check distance to any line segment (wall edge)
        for (let i = 0; i < el.points.length - (el.isClosedLoop ? 0 : 1); i++) {
          const pA = el.points[i];
          const pB = el.points[(i + 1) % el.points.length];
          const segDist = distanceToSegment(clickedPoint, pA, pB);
          if (segDist < hitRadiusPx) {
            return true;
          }
        }

        // 3. Check inside closed polygon
        if (el.isClosedLoop && el.points.length >= 3 && isPointInPolygon(clickedPoint, el.points)) {
          return true;
        }

        return false;
      });

      if (found) {
        setSelectedElementId(found.id);
        if (onSelectElement) onSelectElement(found);
      } else {
        setSelectedElementId(null);
        if (onSelectElement) onSelectElement(null);
      }
    }
  };

  const handleCanvasDoubleClick = () => {
    if (toolMode === 'TRACE' && currentLinePoints.length >= 2) {
      const shouldClose = currentLinePoints.length >= 3;
      finishCurrentPolygon(shouldClose);
    }
  };

  const finishCurrentPolygon = (isClosed = true) => {
    if (currentLinePoints.length < 2 || !scaleMetresPerPx) return;

    let totalVal = 0;
    if (activeCategory.startsWith('WALL')) {
      totalVal = calculateSegmentLengthM(currentLinePoints, scaleMetresPerPx);
    } else if (isClosed && currentLinePoints.length >= 3) {
      totalVal = calculatePolygonAreaM2(currentLinePoints, scaleMetresPerPx);
    } else {
      totalVal = calculateSegmentLengthM(currentLinePoints, scaleMetresPerPx);
    }

    const newElement: TraceElement = {
      id: `el-${Date.now()}`,
      category: activeCategory,
      catalogCode: activeCatalogCode,
      points: currentLinePoints,
      lengthOrAreaM: totalVal,
      isClosedLoop: isClosed,
      storey: activeStorey,
      pitchDegrees: activeCategory === 'ROOF' ? activeRoofPitch : undefined,
    };

    const updated = [...elements, newElement];
    setElements(updated);
    setCurrentLinePoints([]);
    if (onElementsChange) onElementsChange(updated);
  };

  const applyCalibration = () => {
    if (calibPoints.length !== 2) {
      alert('Nejprve na výkresu kliknutím označte bod A a bod B (známou kótovanou čáru).');
      return;
    }
    const realM = parseFloat(realDistanceMInput);
    if (isNaN(realM) || realM <= 0) {
      alert('Zadejte prosím reálnou vzdálenost úsečky A-B v metrech (např. 11.7 m) z kótování na vašem výkresu.');
      return;
    }
    const pxDist = distance2D(calibPoints[0], calibPoints[1]);
    if (pxDist < 5) {
      alert('Zvolte na výkresu 2 různé body A a B s větší vzdáleností.');
      return;
    }
    const scale = realM / pxDist;

    setScaleMetresPerPx(scale);
    setIsScaleLocked(true);
    setShowCalibWarning(false);
    setToolMode('TRACE');
    if (onScaleCalibrated) onScaleCalibrated(scale);
  };

  const resetCalibPoints = () => {
    setCalibPoints([]);
    setScaleMetresPerPx(null);
    setIsScaleLocked(false);
    setToolMode('CALIBRATE');
  };

  const handleCalibBack = () => {
    if (calibPoints.length > 0) {
      setCalibPoints((prev) => prev.slice(0, -1));
    } else {
      setToolMode('SELECT');
    }
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    setElements(updated);
    setSelectedElementId(null);
    if (onElementsChange) onElementsChange(updated);
    if (onSelectElement) onSelectElement(null);
  };

  const updateElementCatalogCode = (id: string, newCode: string) => {
    const updated = elements.map((el) => (el.id === id ? { ...el, catalogCode: newCode } : el));
    setElements(updated);
    if (onElementsChange) onElementsChange(updated);
  };

  const updateElementPitch = (id: string, pitchDeg: number) => {
    const updated = elements.map((el) => (el.id === id ? { ...el, pitchDegrees: pitchDeg } : el));
    setElements(updated);
    if (onElementsChange) onElementsChange(updated);
  };

  const formatScaleText = (scale: number | null) => {
    if (!scale || isNaN(scale) || scale <= 0) return 'Nezkalibrováno';
    const cmPerPx = scale * 100;
    const mmPerPx = scale * 1000;
    if (cmPerPx >= 1) {
      return `1 px = ${cmPerPx.toFixed(2)} cm (${scale.toFixed(4)} m)`;
    }
    return `1 px = ${mmPerPx.toFixed(1)} mm (${scale.toFixed(4)} m)`;
  };

  const activeCategoryElements = elements.filter(
    (el) => el.storey === activeStorey && el.category === activeCategory
  );

  const canvasRenderElements = elements.filter((el) => {
    if (el.storey !== activeStorey) return false;
    if (el.category === activeCategory) return true;
    if (activeCategory === 'WALL_INNER' && el.category === 'WALL_OUTER') return true;
    return false;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomScale, zoomScale);

    if (bgImage) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#f1f3f5';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Render finished elements
    canvasRenderElements.forEach((el) => {
      if (el.points.length < 2) return;
      const isSelected = el.id === selectedElementId;
      const isGuideOnly = el.category !== activeCategory;

      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }

      if (el.isClosedLoop) {
        ctx.closePath();
        ctx.fillStyle = isSelected
          ? 'rgba(117, 145, 146, 0.25)'
          : isGuideOnly
          ? 'rgba(41, 37, 39, 0.05)'
          : 'rgba(255, 255, 255, 0.75)';
        ctx.fill();
      }

      ctx.strokeStyle = isSelected
        ? '#759192'
        : isGuideOnly
        ? '#9e998e'
        : '#759192';
      ctx.lineWidth = isSelected ? 4 : isGuideOnly ? 1.5 : 3;
      if (isGuideOnly) ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (scaleMetresPerPx && !isGuideOnly) {
        for (let i = 0; i < el.points.length - (el.isClosedLoop ? 0 : 1); i++) {
          const pA = el.points[i];
          const pB = el.points[(i + 1) % el.points.length];
          const segDistPx = distance2D(pA, pB);
          const segLenM = segDistPx * scaleMetresPerPx;

          const midX = (pA.x + pB.x) / 2;
          const midY = (pA.y + pB.y) / 2;

          ctx.fillStyle = '#181a1c';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`${segLenM.toFixed(1)} m`, midX + 4, midY - 4);
        }
      }

      el.points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isGuideOnly ? 2.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#759192' : isGuideOnly ? '#9e998e' : '#292527';
        ctx.fill();
      });
    });

    // Render active drawing line/polygon in progress (currentLinePoints)
    if (currentLinePoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentLinePoints[0].x, currentLinePoints[0].y);
      for (let i = 1; i < currentLinePoints.length; i++) {
        ctx.lineTo(currentLinePoints[i].x, currentLinePoints[i].y);
      }
      if (hoverPoint && toolMode === 'TRACE') {
        ctx.lineTo(hoverPoint.x, hoverPoint.y);
      }

      ctx.strokeStyle = '#759192';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      currentLinePoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#d39a52' : '#292527';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    if (calibPoints.length > 0) {
      calibPoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#292527' : '#759192';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(idx === 0 ? 'A' : 'B', pt.x - 3, pt.y + 3);
      });

      if (calibPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(calibPoints[0].x, calibPoints[0].y);
        ctx.lineTo(calibPoints[1].x, calibPoints[1].y);
        ctx.strokeStyle = '#4dbde6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
      }
    }

    // Render envelope open vertices (dangling wall ends) as visual warnings
    const envelope = isEnvelopeClosed(elements, activeStorey, scaleMetresPerPx || 0.02);
    if (activeCategory === 'WALL_OUTER' && !envelope.isClosed) {
      envelope.openVertices.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14 / zoomScale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(211, 154, 82, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 / zoomScale, 0, Math.PI * 2);
        ctx.fillStyle = '#d39a52';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [
    elements,
    canvasRenderElements,
    currentLinePoints,
    calibPoints,
    hoverPoint,
    bgImage,
    opacity,
    selectedElementId,
    panOffset,
    zoomScale,
    activeStorey,
    activeCategory,
    scaleMetresPerPx,
    toolMode,
  ]);

  // Calculate dynamic canvas dimensions based on bgImage aspect ratio, fitting within 900x550 bounding box
  let canvasWidth = 900;
  let canvasHeight = 550;
  if (bgImage) {
    const imgAspect = bgImage.width / bgImage.height;
    const containerAspect = 900 / 550;
    if (imgAspect > containerAspect) {
      canvasWidth = 900;
      canvasHeight = Math.round(900 / imgAspect);
    } else {
      canvasHeight = 550;
      canvasWidth = Math.round(550 * imgAspect);
    }
  }

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="flex flex-col space-y-3 font-sans select-none w-full">
      <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-2 rounded-t-sm flex flex-wrap items-center justify-between gap-2 w-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onResetSheet && (
            <button
              type="button"
              onClick={onResetSheet}
              className="h-11 px-4 rounded-sm text-sm font-semibold flex items-center gap-2 bg-[var(--prefa-white)] text-[var(--prefa-ink)] border border-[var(--prefa-line)] hover:bg-[var(--prefa-paper)] transition shrink-0 cursor-pointer"
            >
              <VesperIcon name="upload" className="w-[18px] h-[18px]" />
              <span>Změnit výkres</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setToolMode('PAN')}
            aria-pressed={toolMode === 'PAN'}
            className={`h-11 px-4 rounded-sm text-sm font-semibold flex items-center gap-2 border transition shrink-0 cursor-pointer ${
              toolMode === 'PAN'
                ? 'bg-[var(--prefa-ink)] text-white border-[var(--prefa-ink)]'
                : 'bg-[var(--prefa-white)] text-[var(--prefa-ink)] border-[var(--prefa-line)] hover:bg-[var(--prefa-paper)]'
            }`}
          >
            <VesperIcon name="pan" className="w-[18px] h-[18px]" />
            <span>Posun</span>
          </button>

          {!isScaleLocked ? (
            <button
              type="button"
              onClick={() => setToolMode('CALIBRATE')}
              aria-pressed={toolMode === 'CALIBRATE'}
              className={`h-11 px-4 rounded-sm text-sm font-semibold flex items-center gap-2 border transition shrink-0 cursor-pointer ${
                toolMode === 'CALIBRATE'
                  ? 'bg-[var(--prefa-ink)] text-white border-[var(--prefa-ink)]'
                  : 'bg-[#FAF4EC] text-[var(--prefa-amber)] border-[var(--prefa-amber)] hover:bg-[#FAF4EC]/85'
              }`}
            >
              <VesperIcon name="calibrate" className="w-[18px] h-[18px]" />
              <span>Kalibrovat A-B</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 h-11 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] px-3 rounded-sm text-sm font-semibold text-[var(--prefa-ink)] shrink-0">
              <span className="flex items-center gap-1.5 group relative">
                <VesperIcon name="lock" className="w-[18px] h-[18px] text-[var(--prefa-aqua)] shrink-0" />
                <span>Měřítko aktivní</span>
                <VesperIcon name="info" className="w-[18px] h-[18px] text-[var(--prefa-stone)] group-hover:text-[var(--prefa-ink)] cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[var(--prefa-ink)] text-white text-xs px-2.5 py-1 rounded-sm shadow-md border border-[var(--prefa-line)] whitespace-nowrap z-50">
                  {formatScaleText(scaleMetresPerPx)}
                </span>
              </span>
              
              <button
                type="button"
                onClick={() => {
                  const newM = prompt('Zadejte novou skutečnou vzdálenost A-B v metrech:', realDistanceMInput);
                  if (newM && !isNaN(parseFloat(newM)) && parseFloat(newM) > 0) {
                    setRealDistanceMInput(newM);
                    const pxDist = distance2D(calibPoints[0] || { x: 100, y: 100 }, calibPoints[1] || { x: 200, y: 100 });
                    const scale = parseFloat(newM) / (pxDist || 100);
                    setScaleMetresPerPx(scale);
                    if (onScaleCalibrated) onScaleCalibrated(scale);
                  }
                }}
                className="h-10 px-3 bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-[var(--prefa-ink)] font-semibold text-xs cursor-pointer transition"
              >
                Upravit
              </button>

              <button
                type="button"
                onClick={resetCalibPoints}
                className="h-10 px-3 bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-amber)] rounded-sm text-[var(--prefa-amber)] font-semibold text-xs cursor-pointer transition"
              >
                Zrušit měřítko
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSelectTraceTool}
            aria-pressed={toolMode === 'TRACE'}
            className={`h-11 px-4 rounded-sm text-sm font-semibold flex items-center gap-2 border transition shrink-0 cursor-pointer ${
              toolMode === 'TRACE'
                ? 'bg-[var(--prefa-ink)] text-white border-[var(--prefa-ink)]'
                : 'bg-[var(--prefa-white)] text-[var(--prefa-ink)] border-[var(--prefa-line)] hover:bg-[var(--prefa-paper)]'
            }`}
          >
            <VesperIcon name={activeCategory === 'ROOF' ? 'draw-area' : 'draw-wall'} className="w-[18px] h-[18px]" />
            <span>
              {activeCategory === 'ROOF'
                ? 'Kreslit střechu'
                : activeCategory === 'WALL_OUTER'
                ? `Vnější stěny (${activeStorey})`
                : activeCategory === 'WALL_INNER'
                ? `Vnitřní stěny (${activeStorey})`
                : 'Kreslit'}
            </span>
          </button>

          {currentLinePoints.length >= 2 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => finishCurrentPolygon(true)}
                className="h-11 px-4 bg-[var(--prefa-ink)] hover:bg-black text-white font-semibold text-sm rounded-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <VesperIcon name="complete" className="w-[18px] h-[18px] text-white" />
                <span>Dokončit obvod ({currentLinePoints.length})</span>
              </button>
              <button
                type="button"
                onClick={() => finishCurrentPolygon(false)}
                className="h-11 px-4 bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] text-[var(--prefa-ink)] border border-[var(--prefa-line)] font-semibold text-sm rounded-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Úsečka</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setToolMode('SELECT')}
            aria-pressed={toolMode === 'SELECT'}
            className={`h-11 px-4 rounded-sm text-sm font-semibold flex items-center gap-2 border transition shrink-0 cursor-pointer ${
              toolMode === 'SELECT'
                ? 'bg-[var(--prefa-ink)] text-white border-[var(--prefa-ink)]'
                : 'bg-[var(--prefa-white)] text-[var(--prefa-ink)] border-[var(--prefa-line)] hover:bg-[var(--prefa-paper)]'
            }`}
          >
            <VesperIcon name="select" className="w-[18px] h-[18px]" />
            <span>Výběr</span>
          </button>
        </div>

        {/* Roof Pitch Selector Toolbar */}
        {activeCategory === 'ROOF' && (
          <div className="flex items-center gap-2 bg-[#f1f3f5] border border-[#d8dee8] px-3 py-1 rounded-xl text-xs">
            <VesperIcon name="roof" className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-800">Sklon střechy:</span>
            {[
              { mode: '0', label: '0° (Plochá)', pitch: 0 },
              { mode: '35', label: '35° (Šikmá)', pitch: 35 },
              { mode: 'CUSTOM', label: 'Vlastní°', pitch: activeRoofPitch },
            ].map((p) => (
              <button
                key={p.mode}
                type="button"
                onClick={() => {
                  const m = p.mode as '0' | '35' | 'CUSTOM';
                  setRoofPitchMode(m);
                  if (m === '0') setActiveRoofPitch(0);
                  if (m === '35') setActiveRoofPitch(35);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  roofPitchMode === p.mode ? 'bg-[#181a1c] text-white' : 'bg-white text-slate-700 border border-[#d8dee8]'
                }`}
              >
                {p.label}
              </button>
            ))}

            {roofPitchMode === 'CUSTOM' && (
              <input
                type="number"
                min="0"
                max="80"
                value={activeRoofPitch}
                onChange={(e) => setActiveRoofPitch(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-bold text-center text-xs"
              />
            )}
          </div>
        )}

        {/* Selected Element Actions */}
        {selectedElement && (
          <div className="flex items-center gap-3 bg-[#f1f3f5] border border-[#d8dee8] px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-900 font-extrabold flex items-center gap-1.5">
              <VesperIcon name="ruler" className="w-4 h-4 text-slate-600" />
              {selectedElement.category.startsWith('WALL')
                ? `Obvod: ${selectedElement.lengthOrAreaM.toFixed(1)} m (Plocha: ${(selectedElement.lengthOrAreaM * 2.8).toFixed(1)} m²)`
                : `Výměra: ${selectedElement.lengthOrAreaM.toFixed(1)} m²`}
            </span>

            <button
              type="button"
              onClick={deleteSelectedElement}
              className="v-btn v-btn--danger text-xs px-2.5 py-1 min-h-0"
            >
              <VesperIcon name="delete" className="w-3.5 h-3.5" />
              <span>Odstranit</span>
            </button>
          </div>
        )}

        {/* Calibration Instruction Banner & Control Panel */}
        {!isScaleLocked && toolMode === 'CALIBRATE' && (
          <div className="bg-[#FAF4EC] border border-[var(--prefa-amber)] text-[var(--prefa-ink)] p-5 space-y-3 text-sm text-left rounded-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--prefa-amber)]/20">
              <span className="font-semibold text-base flex items-center gap-2">
                Kalibrace měřítka výkresu
              </span>
              <span className="text-xs font-semibold bg-[var(--prefa-amber)]/10 text-[var(--prefa-amber)] px-2.5 py-0.5 rounded-sm">
                Postup: 3 kroky
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[var(--prefa-cedar)] font-medium">
              1. Najděte na výkresu známou kótu. 2. Kliknutím označte její začátek (bod A) a konec (bod B). 3. Zadejte délku v metrech a potvrďte.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--prefa-amber)]/20">
              <span className="font-semibold text-sm">
                {calibPoints.length === 0
                  ? 'Krok 1: Klikněte na počáteční bod A'
                  : calibPoints.length === 1
                  ? 'Krok 2: Klikněte na koncový bod B'
                  : 'Krok 3: Zadejte délku v metrech:'}
              </span>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={realDistanceMInput}
                  onChange={(e) => setRealDistanceMInput(e.target.value)}
                  placeholder="8.5"
                  className="h-11 w-24 px-3 bg-[var(--prefa-white)] border border-[var(--prefa-line)] text-[var(--prefa-ink)] font-semibold text-center text-sm focus:outline-none rounded-sm"
                />
                <span className="font-bold text-sm">m</span>
              </div>

              <button
                type="button"
                disabled={calibPoints.length !== 2}
                onClick={applyCalibration}
                className="h-11 px-4 text-sm font-semibold transition cursor-pointer rounded-sm border border-transparent bg-[var(--prefa-ink)] hover:bg-black text-white disabled:bg-[var(--prefa-stone)] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Potvrdit kalibraci
              </button>

              <button
                type="button"
                onClick={handleCalibBack}
                className="h-11 px-4 bg-transparent hover:bg-[var(--prefa-linen)] text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] font-semibold text-sm transition flex items-center justify-center gap-1 cursor-pointer rounded-sm border border-transparent ml-auto"
              >
                <span>Zpět</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2D Canvas Viewport */}
      <div className="relative border border-[var(--prefa-line)] rounded-b-sm overflow-hidden bg-white w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          onContextMenu={(e) => e.preventDefault()}
          className={`block ${
            toolMode === 'PAN' || isPanning ? 'cursor-grab active:cursor-grabbing' : toolMode === 'SELECT' ? 'cursor-pointer' : 'cursor-crosshair'
          }`}
        />

        {/* Floating Zoom HUD Widget (Prominent, crisp dark contrast, safe bottom offset) */}
        <div className="absolute bottom-6 right-6 bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-1 rounded-sm shadow-md flex items-center gap-2 text-sm z-30">
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Oddálit výkres"
            className="w-11 h-11 flex items-center justify-center bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-[var(--prefa-ink)] font-semibold text-lg cursor-pointer transition focus:border-[var(--prefa-aqua)]"
          >
            <VesperIcon name="minus" className="w-[18px] h-[18px]" />
          </button>
          <span className="text-[var(--prefa-ink)] font-semibold w-14 text-center text-sm font-sans tracking-wider">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Přiblížit výkres"
            className="w-11 h-11 flex items-center justify-center bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-[var(--prefa-ink)] font-semibold text-lg cursor-pointer transition focus:border-[var(--prefa-aqua)]"
          >
            <VesperIcon name="plus" className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* KONTROLNÍ SOUPIS NAMĚŘENÝCH ČAR A PLOCH */}
      <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-4 rounded-sm space-y-4 text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--prefa-line)]">
          <span className="font-semibold text-[var(--prefa-ink)] uppercase tracking-wider text-xs flex items-center gap-1.5 font-sans">
            <VesperIcon name="receipt" className="w-[18px] h-[18px]" />
            Kontrolní soupis naměřených čar a výměr ({activeStorey} — {activeCategory})
          </span>
          <span className="text-xs font-semibold text-[var(--prefa-stone)] font-sans">
            {formatScaleText(scaleMetresPerPx)}
          </span>
        </div>

        {activeCategoryElements.length === 0 ? (
          <p className="text-sm text-[var(--prefa-stone)] font-medium italic font-sans">
            Zatím nebyly nakresleny žádné čáry pro {activeStorey} — {activeCategory}. Nakreslete obvod klikáním do rohů stavby.
          </p>
        ) : (
          <div className="space-y-2 font-sans text-sm">
            {activeCategoryElements.map((el, idx) => {
              const wallArea = el.category.startsWith('WALL') ? el.lengthOrAreaM * 2.8 : el.lengthOrAreaM;
              const unitPrice = CATALOG_UNIT_PRICES[el.catalogCode] || 8500;
              const itemTotal = wallArea * unitPrice;

              return (
                <div
                  key={el.id}
                  className={`min-h-[48px] py-2 px-3 bg-[var(--prefa-white)] border rounded-sm flex flex-wrap items-center justify-between gap-3 transition ${
                    el.id === selectedElementId ? 'border-[var(--prefa-amber)] shadow-sm' : 'border-[var(--prefa-line)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[var(--prefa-ink)] text-sm"># {idx + 1}</span>
                    <span className="text-[var(--prefa-cedar)] text-sm font-medium tabular-nums font-sans">
                      {el.category.startsWith('WALL')
                        ? `Délka L = ${el.lengthOrAreaM.toFixed(1)} m | Plocha stěny = ${wallArea.toFixed(1)} m²`
                        : el.category === 'ROOF'
                        ? (() => {
                            const pitch = el.pitchDegrees ?? 35;
                            const pitchRad = (pitch * Math.PI) / 180;
                            const slopedArea = pitch > 0 ? el.lengthOrAreaM / Math.cos(pitchRad) : el.lengthOrAreaM;
                            return `Půdorysně: ${el.lengthOrAreaM.toFixed(1)} m² | Skutečně (sklon ${pitch}°): ${slopedArea.toFixed(1)} m²`;
                          })()
                        : `Výměra = ${wallArea.toFixed(1)} m²`}
                    </span>
                  </div>

                  {el.category.startsWith('WALL') && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--prefa-stone)] font-sans">Typ panelu:</span>
                      <select
                        value={el.catalogCode}
                        onChange={(e) => updateElementCatalogCode(el.id, e.target.value)}
                        className="h-10 px-3 bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-[var(--prefa-ink)] font-semibold text-sm cursor-pointer transition focus:border-[var(--prefa-aqua)] focus:outline-none"
                      >
                        {el.category === 'WALL_OUTER' ? (
                          <>
                            <option value="1.1">Skladba 1.1 (Kontaktní zateplení - 8 500 Kč/m²)</option>
                            <option value="1.2">Skladba 1.2 (Provětrávaná fasáda - 10 238 Kč/m²)</option>
                            <option value="1.3">Skladba 1.3 (Ekonomický panel - 6 450 Kč/m²)</option>
                            <option value="1.4">Skladba 1.4 (CLT masiv 84mm - 9 200 Kč/m²)</option>
                          </>
                        ) : (
                          <>
                            <option value="NS_VF_01">NS_VF_01 (Nosná 120mm - 3 500 Kč/m²)</option>
                            <option value="DS_VF_01">DS_VF_01 (Akustická 300mm - 5 500 Kč/m²)</option>
                            <option value="PS_VF_01">PS_VF_01 (Příčka 100mm - 2 800 Kč/m²)</option>
                          </>
                        )}
                      </select>
                      <span className="font-semibold text-[var(--prefa-ink)] text-sm whitespace-nowrap tabular-nums font-sans">
                        {itemTotal.toLocaleString('cs-CZ')} Kč
                      </span>
                    </div>
                  )}

                  {el.category === 'ROOF' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--prefa-stone)] font-sans">Sklon:</span>
                      <select
                        value={el.pitchDegrees ?? 35}
                        onChange={(e) => updateElementPitch(el.id, parseInt(e.target.value))}
                        className="h-10 px-3 bg-[var(--prefa-white)] hover:bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm text-[var(--prefa-ink)] font-semibold text-sm cursor-pointer transition focus:border-[var(--prefa-aqua)] focus:outline-none"
                      >
                        <option value={0}>0° (Plochá)</option>
                        <option value={15}>15°</option>
                        <option value={25}>25°</option>
                        <option value={35}>35° (Šikmá standard)</option>
                        <option value={45}>45°</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
