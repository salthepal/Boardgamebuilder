import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { AlignmentTools } from './AlignmentTools';
import { LayerControls } from './LayerControls';
import { ExportDialog } from './ExportDialog';
import { Download, Upload, Grid, FileDown, Undo2, Redo2, Trash2, Search, Github } from 'lucide-react';

export interface PlacedElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string;
  locked?: boolean;
  groupId?: string;
  zIndex?: number;
}

interface HistoryState {
  placedElements: PlacedElement[];
  selectedElement: string | null;
  selectedElements: string[];
}

export function BoardGameBuilder() {
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [copiedElements, setCopiedElements] = useState<PlacedElement[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [gridSize, setGridSize] = useState(20);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [componentSearch, setComponentSearch] = useState('');
  
  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleAddElement = (type: string, x: number, y: number) => {
    const maxZ = placedElements.length > 0 
      ? Math.max(...placedElements.map(el => el.zIndex || 0))
      : 0;
    
    const newElement: PlacedElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: snapToGrid ? Math.round(x / gridSize) * gridSize : x,
      y: snapToGrid ? Math.round(y / gridSize) * gridSize : y,
      rotation: 0,
      width: getDefaultWidth(type),
      height: getDefaultHeight(type),
      zIndex: maxZ + 1,
    };
    setPlacedElements([...placedElements, newElement]);
    addToHistory();
  };

  const handleMoveElement = (id: string, x: number, y: number) => {
    const finalX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const finalY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    
    if (selectedElements.includes(id) && selectedElements.length > 1) {
      const element = placedElements.find(el => el.id === id);
      if (!element || element.locked) return;
      
      const dx = finalX - element.x;
      const dy = finalY - element.y;
      
      setPlacedElements(
        placedElements.map((el) =>
          selectedElements.includes(el.id) && !el.locked
            ? { ...el, x: el.x + dx, y: el.y + dy }
            : el
        )
      );
    } else {
      setPlacedElements(
        placedElements.map((el) =>
          el.id === id && !el.locked ? { ...el, x: finalX, y: finalY } : el
        )
      );
    }
  };

  const handleResizeElement = (id: string, width: number, height: number) => {
    setPlacedElements(
      placedElements.map((el) =>
        el.id === id && !el.locked ? { ...el, width, height } : el
      )
    );
  };

  const handleRotateElement = (id: string) => {
    setPlacedElements(
      placedElements.map((el) =>
        el.id === id && !el.locked ? { ...el, rotation: (el.rotation + 90) % 360 } : el
      )
    );
    addToHistory();
  };

  const handleSetRotation = (id: string, rotation: number) => {
    setPlacedElements(
      placedElements.map((el) =>
        el.id === id && !el.locked ? { ...el, rotation } : el
      )
    );
    addToHistory();
  };

  const handleDeleteElement = (id: string) => {
    setPlacedElements(placedElements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    setSelectedElements(selectedElements.filter(elId => elId !== id));
    addToHistory();
  };

  const handleSelectMultiple = (ids: string[]) => {
    setSelectedElements(ids);
    if (ids.length === 0) {
      setSelectedElement(null);
    }
  };

  const handleSelectElement = (id: string | null, ctrlKey?: boolean) => {
    if (ctrlKey && id) {
      if (selectedElements.includes(id)) {
        const newSelection = selectedElements.filter(elId => elId !== id);
        setSelectedElements(newSelection);
        if (newSelection.length === 0) {
          setSelectedElement(null);
        }
      } else {
        setSelectedElements([...selectedElements, id]);
        setSelectedElement(null);
      }
    } else {
      setSelectedElement(id);
      setSelectedElements([]);
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedElements.length > 0) {
      setPlacedElements(placedElements.filter((el) => !selectedElements.includes(el.id)));
      setSelectedElements([]);
      setSelectedElement(null);
      addToHistory();
    }
  };

  const handleCopy = () => {
    if (selectedElement) {
      const elementToCopy = placedElements.find(el => el.id === selectedElement);
      if (elementToCopy) {
        setCopiedElements([elementToCopy]);
      }
    } else if (selectedElements.length > 0) {
      const elementsToCopy = placedElements.filter(el => selectedElements.includes(el.id));
      setCopiedElements(elementsToCopy);
    }
  };

  const handlePaste = () => {
    if (copiedElements.length === 0) return;
    
    const maxZ = placedElements.length > 0 
      ? Math.max(...placedElements.map(el => el.zIndex || 0))
      : 0;
    
    const offset = 40;
    const newElements: PlacedElement[] = copiedElements.map((el, i) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random()}`,
      x: el.x + offset,
      y: el.y + offset,
      zIndex: maxZ + i + 1,
    }));
    
    setPlacedElements([...placedElements, ...newElements]);
    
    const newIds = newElements.map(el => el.id);
    if (newIds.length === 1) {
      setSelectedElement(newIds[0]);
      setSelectedElements([]);
    } else {
      setSelectedElements(newIds);
      setSelectedElement(null);
    }
    addToHistory();
  };

  const handleDuplicate = () => {
    handleCopy();
    setTimeout(() => handlePaste(), 0);
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setPlacedElements(
      placedElements.map((el) =>
        el.id === id ? { ...el, label } : el
      )
    );
    addToHistory();
  };

  const handleAlign = (alignedElements: PlacedElement[]) => {
    const updatedMap = new Map(alignedElements.map(el => [el.id, el]));
    setPlacedElements(
      placedElements.map(el => updatedMap.get(el.id) || el)
    );
    addToHistory();
  };

  const handleBringToFront = () => {
    const maxZ = Math.max(...placedElements.map(el => el.zIndex || 0));
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, zIndex: maxZ + 1 } : el
      )
    );
    addToHistory();
  };

  const handleSendToBack = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, zIndex: 0 } : el
      )
    );
    addToHistory();
  };

  const handleBringForward = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, zIndex: (el.zIndex || 0) + 1 } : el
      )
    );
    addToHistory();
  };

  const handleSendBackward = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, zIndex: Math.max(0, (el.zIndex || 0) - 1) } : el
      )
    );
    addToHistory();
  };

  const handleToggleLock = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, locked: !el.locked } : el
      )
    );
    addToHistory();
  };

  const handleGroup = () => {
    if (selectedElements.length < 2) return;
    const groupId = `group-${Date.now()}`;
    setPlacedElements(
      placedElements.map(el =>
        selectedElements.includes(el.id) ? { ...el, groupId } : el
      )
    );
    addToHistory();
  };

  const handleUngroup = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    setPlacedElements(
      placedElements.map(el =>
        ids.includes(el.id) ? { ...el, groupId: undefined } : el
      )
    );
    addToHistory();
  };

  const handleZoomToFit = () => {
    if (placedElements.length === 0) return;
    
    const minX = Math.min(...placedElements.map(el => el.x));
    const minY = Math.min(...placedElements.map(el => el.y));
    const maxX = Math.max(...placedElements.map(el => el.x + el.width));
    const maxY = Math.max(...placedElements.map(el => el.y + el.height));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const viewportWidth = window.innerWidth - 400;
    const viewportHeight = window.innerHeight - 100;
    
    const zoomX = viewportWidth / width;
    const zoomY = viewportHeight / height;
    const newZoom = Math.min(zoomX, zoomY, 2) * 0.9;
    
    setZoom(Math.max(0.3, newZoom));
  };

  const handleZoomToSelection = () => {
    const ids = selectedElement ? [selectedElement] : selectedElements;
    if (ids.length === 0) return;
    
    const elements = placedElements.filter(el => ids.includes(el.id));
    const minX = Math.min(...elements.map(el => el.x));
    const minY = Math.min(...elements.map(el => el.y));
    const maxX = Math.max(...elements.map(el => el.x + el.width));
    const maxY = Math.max(...elements.map(el => el.y + el.height));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const viewportWidth = window.innerWidth - 400;
    const viewportHeight = window.innerHeight - 100;
    
    const zoomX = viewportWidth / width;
    const zoomY = viewportHeight / height;
    const newZoom = Math.min(zoomX, zoomY, 2) * 0.9;
    
    setZoom(Math.max(0.3, newZoom));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all elements?')) {
      setPlacedElements([]);
      setSelectedElement(null);
      setSelectedElements([]);
      addToHistory();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(placedElements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'board-layout.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            setPlacedElements(data);
            setSelectedElement(null);
            setSelectedElements([]);
            addToHistory();
          } catch (error) {
            alert('Error importing file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const addToHistory = () => {
    setTimeout(() => {
      const currentHistory = {
        placedElements: [...placedElements],
        selectedElement: selectedElement,
        selectedElements: [...selectedElements],
      };
      const newHistory = [...history.slice(0, historyIndex + 1), currentHistory];
      // Limit history to last 50 states
      const trimmedHistory = newHistory.slice(-50);
      setHistory(trimmedHistory);
      setHistoryIndex(trimmedHistory.length - 1);
    }, 100);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const state = history[historyIndex - 1];
      setPlacedElements(state.placedElements);
      setSelectedElement(state.selectedElement);
      setSelectedElements(state.selectedElements);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const state = history[historyIndex + 1];
      setPlacedElements(state.placedElements);
      setSelectedElement(state.selectedElement);
      setSelectedElements(state.selectedElements);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
      
      // Nudge with arrow keys
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && 
          (selectedElement || selectedElements.length > 0)) {
        e.preventDefault();
        const ids = selectedElement ? [selectedElement] : selectedElements;
        const nudgeAmount = e.shiftKey ? gridSize : 1;
        
        setPlacedElements(
          placedElements.map(el => {
            if (!ids.includes(el.id) || el.locked) return el;
            
            let newX = el.x;
            let newY = el.y;
            
            if (e.key === 'ArrowLeft') newX -= nudgeAmount;
            if (e.key === 'ArrowRight') newX += nudgeAmount;
            if (e.key === 'ArrowUp') newY -= nudgeAmount;
            if (e.key === 'ArrowDown') newY += nudgeAmount;
            
            return { ...el, x: newX, y: newY };
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, selectedElements, placedElements, gridSize, historyIndex, history]);

  const selectedElementData = selectedElement ? placedElements.find(el => el.id === selectedElement) : null;
  const selectedElementsData = placedElements.filter(el => selectedElements.includes(el.id));
  const isLocked = selectedElementData?.locked || selectedElementsData.some(el => el.locked) || false;
  const isGrouped = selectedElementData?.groupId !== undefined || selectedElementsData.some(el => el.groupId !== undefined);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-foreground">Medical Board Game Builder</h1>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  v1.26
                </span>
              </div>
              <p className="text-muted-foreground text-sm">by Sal Phadnis</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-1"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-1"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              
              <div className="h-6 w-px bg-border" />
              
              <label className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg">
                <span className="text-sm">BG:</span>
                <input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => setCanvasBackground(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer"
                />
              </label>
              
              <button
                onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
              >
                +
              </button>
              <span className="px-2 text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.3))}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
              >
                -
              </button>
              <button
                onClick={handleZoomToFit}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
              >
                Fit
              </button>
              
              <div className="h-6 w-px bg-border" />
              
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-2 rounded-lg hover:bg-secondary/80 text-sm flex items-center gap-1 ${
                  showGrid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-3 py-2 rounded-lg hover:bg-secondary/80 text-sm ${
                  snapToGrid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Snap
              </button>
              
              <select
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm"
              >
                <option value={10}>10px</option>
                <option value={20}>20px</option>
                <option value={50}>50px</option>
                <option value={100}>100px</option>
              </select>
              
              <div className="h-6 w-px bg-border" />
              
              <button
                onClick={handleImport}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1 text-sm"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1 text-sm"
              >
                <Download className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 text-sm"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 flex items-center gap-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <a
                href="https://github.com/salthepal/Boardgamebuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1 text-sm"
                title="View on GitHub"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Component Palette */}
          <div className="w-64 bg-card border-r border-border overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <ComponentPalette searchQuery={componentSearch} />
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-auto bg-background">
            <Canvas
              placedElements={placedElements}
              selectedElement={selectedElement}
              selectedElements={selectedElements}
              showGrid={showGrid}
              gridSize={gridSize}
              zoom={zoom}
              canvasBackground={canvasBackground}
              snapToGrid={snapToGrid}
              onAddElement={handleAddElement}
              onMoveElement={handleMoveElement}
              onSelectElement={handleSelectElement}
              onSelectMultiple={handleSelectMultiple}
              onResizeElement={handleResizeElement}
              onRotateElement={handleRotateElement}
              onDeleteElement={handleDeleteElement}
              onDeleteMultiple={handleDeleteMultiple}
              onCopy={handleCopy}
              onPaste={handlePaste}
            />
          </div>

          {/* Properties Panel */}
          {selectedElement && (
            <div className="w-72 bg-card border-l border-border overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground">Properties</h3>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary"
                    title="Close Properties"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </div>
                
                <Toolbar
                  selectedElement={placedElements.find(el => el.id === selectedElement)}
                  onRotate={() => selectedElement && handleRotateElement(selectedElement)}
                  onSetRotation={(angle) => selectedElement && handleSetRotation(selectedElement, angle)}
                  onDelete={() => selectedElement && handleDeleteElement(selectedElement)}
                  onUpdateLabel={(label) => selectedElement && handleUpdateLabel(selectedElement, label)}
                />
                
                <div className="pt-4 border-t border-border">
                  <LayerControls
                    onBringToFront={handleBringToFront}
                    onSendToBack={handleSendToBack}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onToggleLock={handleToggleLock}
                    onDuplicate={handleDuplicate}
                    onGroup={handleGroup}
                    onUngroup={handleUngroup}
                    isLocked={isLocked}
                    isGrouped={isGrouped}
                    canGroup={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Multi-select Panel */}
          {!selectedElement && selectedElements.length > 0 && (
            <div className="w-72 bg-card border-l border-border overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground mb-1">Multi-Selection</h3>
                    <div className="text-muted-foreground text-sm">
                      {selectedElements.length} items selected
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedElements([])}
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary"
                    title="Close Properties"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </div>

                <AlignmentTools
                  selectedElements={selectedElementsData}
                  onAlign={handleAlign}
                />

                <div className="pt-4 border-t border-border">
                  <LayerControls
                    onBringToFront={handleBringToFront}
                    onSendToBack={handleSendToBack}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onToggleLock={handleToggleLock}
                    onDuplicate={handleDuplicate}
                    onGroup={handleGroup}
                    onUngroup={handleUngroup}
                    isLocked={isLocked}
                    isGrouped={isGrouped}
                    canGroup={selectedElements.length >= 2}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    onClick={handleDeleteMultiple}
                    className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All Selected
                  </button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-muted-foreground text-sm mb-2">Tips</h4>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Arrow keys to nudge</li>
                    <li>• Shift+Arrow for larger steps</li>
                    <li>• Ctrl/Cmd+C to copy</li>
                    <li>• Ctrl/Cmd+V to paste</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        placedElements={placedElements}
        selectedElements={selectedElements}
        canvasBackground={canvasBackground}
      />
    </DndProvider>
  );
}

function getDefaultWidth(type: string): number {
  const widths: Record<string, number> = {
    bed: 80,
    gurney: 100,
    chair: 40,
    desk: 100,
    computer: 60,
    wall_h: 200,
    wall_v: 20,
    door: 80,
    cabinet: 60,
    sink: 50,
    equipment: 60,
    trauma_room: 180,
    exam_room: 140,
    xray_room: 160,
    ct_room: 180,
    operating_room: 200,
    waiting_room: 200,
    ambulance_bay: 240,
    parking_lot: 260,
    office: 120,
    conference_room: 180,
    blank_box: 100,
    text_box: 150,
  };
  return widths[type] || 60;
}

function getDefaultHeight(type: string): number {
  const heights: Record<string, number> = {
    bed: 100,
    gurney: 80,
    chair: 40,
    desk: 60,
    computer: 60,
    wall_h: 20,
    wall_v: 200,
    door: 20,
    cabinet: 40,
    sink: 50,
    equipment: 60,
    trauma_room: 180,
    exam_room: 140,
    xray_room: 160,
    ct_room: 180,
    operating_room: 200,
    waiting_room: 180,
    ambulance_bay: 200,
    parking_lot: 220,
    office: 120,
    conference_room: 140,
    blank_box: 80,
    text_box: 50,
  };
  return heights[type] || 60;
}