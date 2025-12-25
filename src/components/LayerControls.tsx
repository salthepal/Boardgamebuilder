import { ArrowUp, ArrowDown, ChevronFirst, ChevronLast, Lock, Unlock, Copy, Group, Ungroup } from 'lucide-react';

interface LayerControlsProps {
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  isLocked: boolean;
  isGrouped: boolean;
  canGroup: boolean;
}

export function LayerControls({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onToggleLock,
  onDuplicate,
  onGroup,
  onUngroup,
  isLocked,
  isGrouped,
  canGroup,
}: LayerControlsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground text-sm">Layers</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onBringToFront}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title="Bring to Front"
        >
          <ChevronFirst className="w-4 h-4" />
          To Front
        </button>
        <button
          onClick={onSendToBack}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title="Send to Back"
        >
          <ChevronLast className="w-4 h-4" />
          To Back
        </button>
        <button
          onClick={onBringForward}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title="Bring Forward"
        >
          <ArrowUp className="w-4 h-4" />
          Forward
        </button>
        <button
          onClick={onSendBackward}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title="Send Backward"
        >
          <ArrowDown className="w-4 h-4" />
          Backward
        </button>
      </div>

      <h4 className="text-muted-foreground text-sm mt-4">Actions</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleLock}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
        <button
          onClick={onDuplicate}
          className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        {canGroup && (
          <>
            <button
              onClick={onGroup}
              className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
              title="Group"
              disabled={isGrouped}
            >
              <Group className="w-4 h-4" />
              Group
            </button>
            {isGrouped && (
              <button
                onClick={onUngroup}
                className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-xs flex items-center justify-center gap-1"
                title="Ungroup"
              >
                <Ungroup className="w-4 h-4" />
                Ungroup
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
