import { PlacedElement } from './BoardGameBuilder';
import { AlignLeft, AlignRight, AlignCenterHorizontal, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, AlignCenterVertical, Layers, LayoutGrid } from 'lucide-react';

interface AlignmentToolsProps {
  selectedElements: PlacedElement[];
  onAlign: (elements: PlacedElement[]) => void;
}

export function AlignmentTools({ selectedElements, onAlign }: AlignmentToolsProps) {
  if (selectedElements.length < 2) return null;

  const alignLeft = () => {
    const minX = Math.min(...selectedElements.map(el => el.x));
    const aligned = selectedElements.map(el => ({ ...el, x: minX }));
    onAlign(aligned);
  };

  const alignRight = () => {
    const maxX = Math.max(...selectedElements.map(el => el.x + el.width));
    const aligned = selectedElements.map(el => ({ ...el, x: maxX - el.width }));
    onAlign(aligned);
  };

  const alignTop = () => {
    const minY = Math.min(...selectedElements.map(el => el.y));
    const aligned = selectedElements.map(el => ({ ...el, y: minY }));
    onAlign(aligned);
  };

  const alignBottom = () => {
    const maxY = Math.max(...selectedElements.map(el => el.y + el.height));
    const aligned = selectedElements.map(el => ({ ...el, y: maxY - el.height }));
    onAlign(aligned);
  };

  const alignCenterHorizontal = () => {
    const centerX = selectedElements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / selectedElements.length;
    const aligned = selectedElements.map(el => ({ ...el, x: centerX - el.width / 2 }));
    onAlign(aligned);
  };

  const alignCenterVertical = () => {
    const centerY = selectedElements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / selectedElements.length;
    const aligned = selectedElements.map(el => ({ ...el, y: centerY - el.height / 2 }));
    onAlign(aligned);
  };

  const distributeHorizontal = () => {
    const sorted = [...selectedElements].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
    const totalWidth = sorted.reduce((sum, el) => sum + el.width, 0);
    const gap = (maxX - minX - totalWidth) / (sorted.length - 1);
    
    let currentX = minX;
    const aligned = sorted.map(el => {
      const result = { ...el, x: currentX };
      currentX += el.width + gap;
      return result;
    });
    onAlign(aligned);
  };

  const distributeVertical = () => {
    const sorted = [...selectedElements].sort((a, b) => a.y - b.y);
    const minY = sorted[0].y;
    const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
    const totalHeight = sorted.reduce((sum, el) => sum + el.height, 0);
    const gap = (maxY - minY - totalHeight) / (sorted.length - 1);
    
    let currentY = minY;
    const aligned = sorted.map(el => {
      const result = { ...el, y: currentY };
      currentY += el.height + gap;
      return result;
    });
    onAlign(aligned);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground text-sm">Alignment</h4>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={alignLeft}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={alignCenterHorizontal}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Center Horizontal"
        >
          <AlignCenterHorizontal className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={alignRight}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={alignTop}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Top"
        >
          <AlignVerticalJustifyStart className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={alignCenterVertical}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Center Vertical"
        >
          <AlignCenterVertical className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={alignBottom}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          title="Align Bottom"
        >
          <AlignVerticalJustifyEnd className="w-4 h-4 mx-auto" />
        </button>
      </div>
      <h4 className="text-muted-foreground text-sm mt-4">Distribute</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={distributeHorizontal}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs"
          title="Distribute Horizontally"
        >
          <Layers className="w-4 h-4 mx-auto mb-1" />
          Horizontal
        </button>
        <button
          onClick={distributeVertical}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs"
          title="Distribute Vertically"
        >
          <LayoutGrid className="w-4 h-4 mx-auto mb-1" />
          Vertical
        </button>
      </div>
    </div>
  );
}