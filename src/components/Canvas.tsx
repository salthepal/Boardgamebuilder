import { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { PlacedElement } from './BoardGameBuilder';
import { BlueprintElement } from './BlueprintElement';

interface CanvasProps {
  placedElements: PlacedElement[];
  selectedElement: string | null;
  selectedElements: string[];
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  canvasBackground: string;
  snapToGrid: boolean;
  onAddElement: (type: string, x: number, y: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onSelectElement: (id: string | null, ctrlKey?: boolean) => void;
  onSelectMultiple: (ids: string[]) => void;
  onResizeElement: (id: string, width: number, height: number) => void;
  onRotateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDeleteMultiple: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export function Canvas({
  placedElements,
  selectedElement,
  selectedElements,
  showGrid,
  gridSize,
  zoom,
  canvasBackground,
  snapToGrid,
  onAddElement,
  onMoveElement,
  onSelectElement,
  onSelectMultiple,
  onResizeElement,
  onRotateElement,
  onDeleteElement,
  onDeleteMultiple,
  onCopy,
  onPaste,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

  // Add keyboard handler for Delete key, Copy, and Paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        e.preventDefault();
        onDeleteMultiple();
      }
      
      // Copy (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && (selectedElement || selectedElements.length > 0)) {
        e.preventDefault();
        onCopy();
      }
      
      // Paste (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        onPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, selectedElements, onDeleteMultiple, onCopy, onPaste]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: { type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (offset && canvasRect) {
        // Adjust for zoom
        const x = Math.round(((offset.x - canvasRect.left) / zoom) / gridSize) * gridSize;
        const y = Math.round(((offset.y - canvasRect.top) / zoom) / gridSize) * gridSize;
        onAddElement(item.type, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [gridSize, zoom, onAddElement]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      if (!e.ctrlKey && !e.metaKey) {
        onSelectElement(null);
        onSelectMultiple([]);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const x = (e.clientX - canvasRect.left) / zoom;
        const y = (e.clientY - canvasRect.top) / zoom;
        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      }
    }
  };

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const x = (e.clientX - canvasRect.left) / zoom;
        const y = (e.clientY - canvasRect.top) / zoom;
        setSelectionBox(prev => ({ ...prev, endX: x, endY: y }));
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      
      // Calculate which elements are in the selection box
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      const selectedIds = placedElements
        .filter(el => {
          return (
            el.x < maxX &&
            el.x + el.width > minX &&
            el.y < maxY &&
            el.y + el.height > minY
          );
        })
        .map(el => el.id);

      if (selectedIds.length > 0) {
        onSelectMultiple(selectedIds);
        onSelectElement(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionBox.startX, selectionBox.startY, placedElements, zoom, onSelectMultiple, onSelectElement]);

  const selectionBoxStyle = {
    left: Math.min(selectionBox.startX, selectionBox.endX) * zoom,
    top: Math.min(selectionBox.startY, selectionBox.endY) * zoom,
    width: Math.abs(selectionBox.endX - selectionBox.startX) * zoom,
    height: Math.abs(selectionBox.endY - selectionBox.startY) * zoom,
  };

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      className={`w-full h-full relative overflow-auto ${
        isOver ? 'bg-slate-800' : 'bg-slate-900'
      }`}
    >
      <div style={{ 
        transform: `scale(${zoom})`, 
        transformOrigin: 'top left',
        minWidth: `${4000 / zoom}px`,
        minHeight: `${3000 / zoom}px`,
        backgroundImage: showGrid
          ? `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `
          : 'none',
        backgroundSize: showGrid ? `${gridSize * zoom}px ${gridSize * zoom}px` : 'auto',
        backgroundColor: canvasBackground,
      }}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none canvas-svg"
          style={{ 
            minWidth: `${4000 / zoom}px`, 
            minHeight: `${3000 / zoom}px`,
          }}
        >
          {placedElements.map((element) => (
            <BlueprintElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElement || selectedElements.includes(element.id)}
              gridSize={gridSize}
              onMove={onMoveElement}
              onSelect={onSelectElement}
              onResize={onResizeElement}
              onRotate={onRotateElement}
              onDelete={onDeleteElement}
            />
          ))}
        </svg>

        {isOver && (
          <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none" />
        )}

        {/* Selection box */}
        {isSelecting && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={selectionBoxStyle}
          />
        )}
      </div>
    </div>
  );
}