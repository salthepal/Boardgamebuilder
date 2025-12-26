import { useState } from 'react';
import { X, FileImage, FileType } from 'lucide-react';
import { PlacedElement } from './BoardGameBuilder';
import jsPDF from 'jspdf';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  placedElements: PlacedElement[];
  selectedElements: string[];
  canvasBackground: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  placedElements,
  selectedElements,
  canvasBackground,
}: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [exportScale, setExportScale] = useState(2);
  const [customScale, setCustomScale] = useState('');
  const [useCustomScale, setUseCustomScale] = useState(false);
  const [exportSelection, setExportSelection] = useState(false);
  const [showPrintHelper, setShowPrintHelper] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const elementsToExport = exportSelection && selectedElements.length > 0
      ? placedElements.filter(el => selectedElements.includes(el.id))
      : placedElements;

    const scale = useCustomScale ? parseFloat(customScale) || 2 : exportScale;

    if (exportFormat === 'png') {
      exportAsPNG(elementsToExport, scale);
    } else if (exportFormat === 'svg') {
      exportAsSVG(elementsToExport);
    } else if (exportFormat === 'pdf') {
      exportAsPDF(elementsToExport, scale);
    }
    
    onClose();
  };

  const exportAsPNG = (elements: PlacedElement[], scale: number) => {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height + 20);
    });

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = (maxX - minX) * scale;
    const height = (maxY - minY) * scale;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, width, height);

    // Create SVG and render to canvas
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    svg.setAttribute("xmlns", svgNS);

    // Clone elements from canvas SVG
    const canvasSvg = document.querySelector('.canvas-svg');
    if (canvasSvg) {
      const clone = canvasSvg.cloneNode(true) as SVGElement;
      Array.from(clone.children).forEach(child => {
        const childEl = child as SVGElement;
        const elementId = childEl.getAttribute('data-element-id');
        if (!elementId || elements.some(el => el.id === elementId)) {
          svg.appendChild(child.cloneNode(true));
        }
      });
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `blueprint-${scale}x.png`;
          link.click();
        }
      });
    };
    img.src = url;
  };

  const exportAsSVG = (elements: PlacedElement[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height + 20);
    });

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
    svg.setAttribute("xmlns", svgNS);

    const bgRect = document.createElementNS(svgNS, "rect");
    bgRect.setAttribute("x", minX.toString());
    bgRect.setAttribute("y", minY.toString());
    bgRect.setAttribute("width", width.toString());
    bgRect.setAttribute("height", height.toString());
    bgRect.setAttribute("fill", canvasBackground);
    svg.appendChild(bgRect);

    const canvasSvg = document.querySelector('.canvas-svg');
    if (canvasSvg) {
      const clone = canvasSvg.cloneNode(true) as SVGElement;
      Array.from(clone.children).forEach(child => {
        const childEl = child as SVGElement;
        const elementId = childEl.getAttribute('data-element-id');
        if (!elementId || elements.some(el => el.id === elementId)) {
          svg.appendChild(child.cloneNode(true));
        }
      });
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blueprint.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = (elements: PlacedElement[], scale: number) => {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height + 20);
    });

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Create SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
    svg.setAttribute("xmlns", svgNS);

    const bgRect = document.createElementNS(svgNS, "rect");
    bgRect.setAttribute("x", minX.toString());
    bgRect.setAttribute("y", minY.toString());
    bgRect.setAttribute("width", width.toString());
    bgRect.setAttribute("height", height.toString());
    bgRect.setAttribute("fill", canvasBackground);
    svg.appendChild(bgRect);

    const canvasSvg = document.querySelector('.canvas-svg');
    if (canvasSvg) {
      const clone = canvasSvg.cloneNode(true) as SVGElement;
      Array.from(clone.children).forEach(child => {
        const childEl = child as SVGElement;
        const elementId = childEl.getAttribute('data-element-id');
        if (!elementId || elements.some(el => el.id === elementId)) {
          svg.appendChild(child.cloneNode(true));
        }
      });
    }

    // Convert SVG to canvas, then to PDF
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        alert('Error creating PDF. Please try SVG or PNG export instead.');
        return;
      }

      ctx.drawImage(img, 0, 0, width * scale, height * scale);
      URL.revokeObjectURL(url);

      // Create PDF
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [width, height]
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('blueprint.pdf');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Error creating PDF. Please try SVG or PNG export instead.');
    };

    img.src = url;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-lg">Export Options</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportFormat('png')}
                className={`p-3 border rounded-lg ${
                  exportFormat === 'png'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground'
                }`}
              >
                <FileImage className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">PNG</div>
              </button>
              <button
                onClick={() => setExportFormat('svg')}
                className={`p-3 border rounded-lg ${
                  exportFormat === 'svg'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground'
                }`}
              >
                <FileType className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">SVG</div>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-3 border rounded-lg ${
                  exportFormat === 'pdf'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground'
                }`}
              >
                <FileType className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">PDF</div>
              </button>
            </div>
          </div>

          {(exportFormat === 'png' || exportFormat === 'pdf') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-muted-foreground">
                  Scale (Resolution Multiplier)
                </label>
                <button
                  onClick={() => setShowPrintHelper(!showPrintHelper)}
                  className="text-xs text-primary hover:underline"
                >
                  {showPrintHelper ? 'Hide' : 'Show'} Print Guide
                </button>
              </div>
              
              {showPrintHelper && (
                <div className="mb-3 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground mb-1">Recommended Scales for Print Sizes:</div>
                  <div>• 8.5×11" (Letter): 4x-6x</div>
                  <div>• 11×17" (Tabloid): 8x-12x</div>
                  <div>• 18×24" (Small Poster): 12x-18x</div>
                  <div>• 24×36" (Medium Poster): 18x-25x</div>
                  <div>• 36×48" (Large Poster): 25x-35x</div>
                  <div className="mt-2 text-xs opacity-75">These assume 300 DPI for professional quality prints.</div>
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[1, 2, 3, 4, 6, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50].map(scale => (
                  <button
                    key={scale}
                    onClick={() => {
                      setExportScale(scale);
                      setUseCustomScale(false);
                    }}
                    className={`p-2 border rounded-lg text-sm ${
                      exportScale === scale && !useCustomScale
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground'
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomScale}
                    onChange={(e) => setUseCustomScale(e.target.checked)}
                    className="rounded"
                  />
                  Custom:
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.5"
                  value={customScale}
                  onChange={(e) => setCustomScale(e.target.value)}
                  disabled={!useCustomScale}
                  placeholder="e.g. 32"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {exportFormat === 'pdf' 
                  ? 'For 36×48" posters, use 25x-35x scale for professional quality.'
                  : 'For 36×48" posters, use 25x-35x scale. Larger = better quality but bigger file size.'}
              </p>
            </div>
          )}

          {selectedElements.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelection}
                  onChange={(e) => setExportSelection(e.target.checked)}
                  className="rounded"
                />
                Export selected elements only ({selectedElements.length} items)
              </label>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}