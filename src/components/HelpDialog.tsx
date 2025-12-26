import { X, Mouse, Move, RotateCw, Copy, Trash2, Grid, Layers, Download, Keyboard } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl text-foreground">How to Use Medical Board Game Builder</h2>
            <p className="text-sm text-muted-foreground mt-1">Quick guide to get you started</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Getting Started */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Mouse className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Getting Started</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Drag & Drop:</strong> Click and drag any component from the left palette onto the canvas to place it.</p>
                <p><strong className="text-foreground">Select:</strong> Click any placed element to select it. Properties will appear on the right.</p>
                <p><strong className="text-foreground">Multi-Select:</strong> Hold Ctrl/Cmd and click multiple elements, or click and drag to draw a selection box.</p>
              </div>
            </div>

            {/* Moving & Editing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Move className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Moving & Editing</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Move:</strong> Drag selected elements to move them around the canvas.</p>
                <p><strong className="text-foreground">Resize:</strong> Drag the corner handles of selected elements to resize.</p>
                <p><strong className="text-foreground">Rotate:</strong> Use the rotation button in properties or enter a specific angle.</p>
                <p><strong className="text-foreground">Label:</strong> Add custom text labels to any element in the properties panel.</p>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Keyboard Shortcuts</h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground font-mono">
                <p><span className="text-foreground">Ctrl/Cmd + Z:</span> Undo</p>
                <p><span className="text-foreground">Ctrl/Cmd + Shift + Z:</span> Redo</p>
                <p><span className="text-foreground">Ctrl/Cmd + C:</span> Copy</p>
                <p><span className="text-foreground">Ctrl/Cmd + V:</span> Paste</p>
                <p><span className="text-foreground">Delete/Backspace:</span> Delete selected</p>
                <p><span className="text-foreground">Arrow Keys:</span> Nudge (1px)</p>
                <p><span className="text-foreground">Shift + Arrows:</span> Nudge (grid size)</p>
              </div>
            </div>

            {/* Grid & Snapping */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Grid className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Grid & Snapping</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Grid:</strong> Toggle grid visibility for alignment reference.</p>
                <p><strong className="text-foreground">Snap:</strong> Enable to snap elements to grid points automatically.</p>
                <p><strong className="text-foreground">Grid Size:</strong> Choose 10px, 20px, 50px, or 100px spacing.</p>
                <p className="text-xs opacity-75">Note: Grid lines don't appear in exports.</p>
              </div>
            </div>

            {/* Layers & Organization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Layers & Organization</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Layer Order:</strong> Use Bring to Front, Send to Back, or step forward/backward.</p>
                <p><strong className="text-foreground">Group:</strong> Select multiple elements and group them to move together.</p>
                <p><strong className="text-foreground">Lock:</strong> Lock elements to prevent accidental edits.</p>
                <p><strong className="text-foreground">Alignment:</strong> Align multiple selected elements (left, right, center, etc.).</p>
              </div>
            </div>

            {/* Copy, Paste & Duplicate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Copy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Copy & Duplicate</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Copy/Paste:</strong> Use Ctrl/Cmd+C and Ctrl/Cmd+V to duplicate elements.</p>
                <p><strong className="text-foreground">Duplicate Button:</strong> Quick duplicate in the properties panel.</p>
                <p><strong className="text-foreground">Multiple Instances:</strong> Place the same component type as many times as you need.</p>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Saving & Exporting</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Save:</strong> Export your layout as JSON to save and load later.</p>
                <p><strong className="text-foreground">Import:</strong> Load previously saved JSON layouts.</p>
                <p><strong className="text-foreground">Export PNG/PDF:</strong> Export high-resolution images (up to 50x for posters).</p>
                <p><strong className="text-foreground">Export SVG:</strong> Export as scalable vector graphics.</p>
                <p><strong className="text-foreground">Print Guide:</strong> Check recommended scales for different print sizes.</p>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <RotateCw className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Advanced Features</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Smart Guides:</strong> Alignment guides appear when elements align with others.</p>
                <p><strong className="text-foreground">Minimap:</strong> See overview of your entire layout (visible when zoomed).</p>
                <p><strong className="text-foreground">Rulers:</strong> Measure distances with on-canvas rulers.</p>
                <p><strong className="text-foreground">Search:</strong> Use the search box to quickly find components.</p>
                <p><strong className="text-foreground">Zoom to Fit:</strong> Automatically zoom to see your whole layout.</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
              <span className="text-primary">💡</span> Pro Tips
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Start by placing room layouts, then add furniture and equipment inside them</li>
              <li>• Use the grid and snap features for precise alignment</li>
              <li>• Group related elements together for easier organization</li>
              <li>• Save your work frequently using the Save button</li>
              <li>• For poster prints (36×48"), use 25x-35x export scale for best quality</li>
              <li>• Customize the background color for different blueprint styles</li>
              <li>• Use custom labels to annotate specific equipment or areas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
