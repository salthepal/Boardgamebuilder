interface RulersProps {
  zoom: number;
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
}

export function Rulers({ zoom, scrollX, scrollY, width, height }: RulersProps) {
  const rulerSize = 30;
  const tickInterval = 100; // Show tick every 100px
  const numTicksH = Math.ceil(width / tickInterval);
  const numTicksV = Math.ceil(height / tickInterval);

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 left-[30px] bg-card border-b border-border overflow-hidden"
        style={{ 
          width: `calc(100% - 30px)`, 
          height: rulerSize,
          zIndex: 10,
        }}
      >
        <svg width="100%" height={rulerSize} className="text-muted-foreground">
          {Array.from({ length: numTicksH }).map((_, i) => {
            const x = i * tickInterval * zoom - scrollX;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={rulerSize - 10}
                  x2={x}
                  y2={rulerSize}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text
                  x={x + 2}
                  y={rulerSize - 12}
                  fontSize={10}
                  fill="currentColor"
                >
                  {i * tickInterval}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute top-[30px] left-0 bg-card border-r border-border overflow-hidden"
        style={{ 
          width: rulerSize,
          height: `calc(100% - 30px)`,
          zIndex: 10,
        }}
      >
        <svg width={rulerSize} height="100%" className="text-muted-foreground">
          {Array.from({ length: numTicksV }).map((_, i) => {
            const y = i * tickInterval * zoom - scrollY;
            return (
              <g key={i}>
                <line
                  x1={rulerSize - 10}
                  y1={y}
                  x2={rulerSize}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text
                  x={2}
                  y={y - 2}
                  fontSize={10}
                  fill="currentColor"
                  transform={`rotate(-90 10 ${y})`}
                >
                  {i * tickInterval}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Corner square */}
      <div 
        className="absolute top-0 left-0 bg-card border-r border-b border-border"
        style={{ 
          width: rulerSize,
          height: rulerSize,
          zIndex: 11,
        }}
      />
    </>
  );
}
