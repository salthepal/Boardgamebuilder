import { RotateCw, Trash2 } from 'lucide-react';
import { PlacedElement } from './BoardGameBuilder';
import { useState } from 'react';

interface ToolbarProps {
  selectedElement: PlacedElement | undefined;
  onRotate: () => void;
  onSetRotation: (angle: number) => void;
  onDelete: () => void;
  onUpdateLabel: (label: string) => void;
}

export function Toolbar({ selectedElement, onRotate, onSetRotation, onDelete, onUpdateLabel }: ToolbarProps) {
  const [label, setLabel] = useState(selectedElement?.label || '');
  const [rotationInput, setRotationInput] = useState(selectedElement?.rotation.toString() || '0');

  if (!selectedElement) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdateLabel(newLabel);
  };

  const handleRotationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRotationInput(value);
    const angle = parseInt(value);
    if (!isNaN(angle)) {
      onSetRotation(angle % 360);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-foreground mb-3">Properties</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-sm block mb-1">Type</label>
            <div className="text-foreground capitalize">{selectedElement.type.replace('_', ' ')}</div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm block mb-2">Label</label>
            <input
              type="text"
              value={label}
              onChange={handleLabelChange}
              placeholder="Enter custom label..."
              className="w-full px-3 py-2 bg-input-background text-foreground rounded border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-muted-foreground text-sm block mb-1">Position</label>
            <div className="text-foreground text-sm">
              X: {selectedElement.x}px, Y: {selectedElement.y}px
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm block mb-1">Size</label>
            <div className="text-foreground text-sm">
              {selectedElement.width} × {selectedElement.height}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm block mb-1">Rotation</label>
            <input
              type="number"
              value={rotationInput}
              onChange={handleRotationInput}
              placeholder="Enter rotation angle..."
              className="w-full px-3 py-2 bg-input-background text-foreground rounded border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <button
          onClick={onRotate}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Rotate 90°
        </button>

        <button
          onClick={onDelete}
          className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-muted-foreground text-sm mb-2">Tips</h4>
        <ul className="text-muted-foreground text-xs space-y-1">
          <li>• Drag to move</li>
          <li>• Drag corners to resize</li>
          <li>• Double-click to rotate</li>
          <li>• Ctrl/Cmd+C to copy</li>
          <li>• Ctrl/Cmd+V to paste</li>
          <li>• Drag on canvas to select multiple</li>
          <li>• Press Delete to remove</li>
        </ul>
      </div>
    </div>
  );
}