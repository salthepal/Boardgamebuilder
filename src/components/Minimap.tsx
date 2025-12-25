import { PlacedElement } from './BoardGameBuilder';

interface MinimapProps {
  placedElements: PlacedElement[];
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export function Minimap({
  placedElements,
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  scrollX,
  scrollY,
  zoom,
}: MinimapProps) {
  const minimapWidth = 200;
  const minimapHeight = 150;
  const scaleX = minimapWidth / canvasWidth;
  const scaleY = minimapHeight / canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div 
      className="absolute bottom-4 right-4 bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden"
      style={{ width: minimapWidth, height: minimapHeight }}
    >
      <svg width={minimapWidth} height={minimapHeight} className="bg-background">
        {/* Canvas background */}
        <rect
          x={0}
          y={0}
          width={canvasWidth * scale}
          height={canvasHeight * scale}
          fill="#1e293b"
        />
        
        {/* Elements */}
        {placedElements.map(el => (
          <rect
            key={el.id}
            x={el.x * scale}
            y={el.y * scale}
            width={el.width * scale}
            height={el.height * scale}
            fill="#3b82f6"
            opacity={0.7}
          />
        ))}
        
        {/* Viewport indicator */}
        <rect
          x={scrollX * scale}
          y={scrollY * scale}
          width={(viewportWidth / zoom) * scale}
          height={(viewportHeight / zoom) * scale}
          fill="none"
          stroke="#fb8500"
          strokeWidth={2}
          opacity={0.8}
        />
      </svg>
      <div className="absolute bottom-1 left-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
        Minimap
      </div>
    </div>
  );
}
