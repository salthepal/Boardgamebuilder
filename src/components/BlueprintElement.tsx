import { useState, useRef, useEffect } from 'react';
import { PlacedElement } from './BoardGameBuilder';

interface BlueprintElementProps {
  element: PlacedElement;
  isSelected: boolean;
  gridSize: number;
  onMove: (id: string, x: number, y: number) => void;
  onSelect: (id: string, ctrlKey?: boolean) => void;
  onResize: (id: string, width: number, height: number) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BlueprintElement({
  element,
  isSelected,
  gridSize,
  onMove,
  onSelect,
  onResize,
  onRotate,
  onDelete,
}: BlueprintElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeDimensions, setResizeDimensions] = useState<{ width: number; height: number } | null>(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0, elementWidth: 0, elementHeight: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't allow dragging locked elements
    if (element.locked) {
      onSelect(element.id, e.ctrlKey || e.metaKey);
      return;
    }
    
    // Check if Ctrl/Cmd key is pressed for multi-select toggle
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection without starting drag
      onSelect(element.id, true);
      return;
    }
    
    // If element is already selected (part of a multi-selection), don't change selection
    // Just start dragging all selected elements
    if (!isSelected) {
      onSelect(element.id);
    }
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
      elementWidth: element.width,
      elementHeight: element.height,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      const newX = Math.round((dragStart.current.elementX + dx) / gridSize) * gridSize;
      const newY = Math.round((dragStart.current.elementY + dy) / gridSize) * gridSize;
      
      onMove(element.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, element.id, gridSize, onMove]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRotate(element.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      onDelete(element.id);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
      elementWidth: element.width,
      elementHeight: element.height,
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      let newWidth = dragStart.current.elementWidth;
      let newHeight = dragStart.current.elementHeight;
      
      if (resizeHandle === 'top-left') {
        newWidth = Math.max(10, dragStart.current.elementWidth - dx);
        newHeight = Math.max(10, dragStart.current.elementHeight - dy);
        onMove(element.id, dragStart.current.elementX + dx, dragStart.current.elementY + dy);
      } else if (resizeHandle === 'top-right') {
        newWidth = Math.max(10, dragStart.current.elementWidth + dx);
        newHeight = Math.max(10, dragStart.current.elementHeight - dy);
        onMove(element.id, dragStart.current.elementX, dragStart.current.elementY + dy);
      } else if (resizeHandle === 'bottom-left') {
        newWidth = Math.max(10, dragStart.current.elementWidth - dx);
        newHeight = Math.max(10, dragStart.current.elementHeight + dy);
        onMove(element.id, dragStart.current.elementX + dx, dragStart.current.elementY);
      } else if (resizeHandle === 'bottom-right') {
        newWidth = Math.max(10, dragStart.current.elementWidth + dx);
        newHeight = Math.max(10, dragStart.current.elementHeight + dy);
        onMove(element.id, dragStart.current.elementX, dragStart.current.elementY);
      }
      
      onResize(element.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, element.id, gridSize, onMove, onResize]);

  return (
    <g
      transform={`translate(${element.x}, ${element.y}) rotate(${element.rotation}, ${element.width / 2}, ${element.height / 2})`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="cursor-move outline-none"
      style={{ pointerEvents: 'all' }}
    >
      {renderElement(element)}
      
      {/* Custom label overlay */}
      {element.label && (
        <text
          x={element.width / 2}
          y={element.height + 15}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="11"
          fontWeight="bold"
        >
          {element.label}
        </text>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <>
          <rect
            x={-2}
            y={-2}
            width={element.width + 4}
            height={element.height + 4}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Corner handles */}
          <circle cx={0} cy={0} r="4" fill="#3b82f6" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} style={{ cursor: 'nwse-resize' }} />
          <circle cx={element.width} cy={0} r="4" fill="#3b82f6" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} style={{ cursor: 'nesw-resize' }} />
          <circle cx={0} cy={element.height} r="4" fill="#3b82f6" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} style={{ cursor: 'nesw-resize' }} />
          <circle cx={element.width} cy={element.height} r="4" fill="#3b82f6" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} style={{ cursor: 'nwse-resize' }} />
        </>
      )}
    </g>
  );
}

function renderElement(element: PlacedElement) {
  const { type, width, height } = element;
  const strokeColor = '#60a5fa'; // Blue blueprint color
  const fillColor = 'rgba(96, 165, 250, 0.1)';
  const strokeWidth = 2;

  switch (type) {
    case 'bed':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Mattress */}
          <rect
            x={width * 0.1}
            y={height * 0.2}
            width={width * 0.8}
            height={height * 0.6}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={3}
          />
          {/* Pillow */}
          <ellipse 
            cx={width * 0.5} 
            cy={height * 0.35} 
            rx={width * 0.3} 
            ry={height * 0.15} 
            fill="rgba(96, 165, 250, 0.15)" 
            stroke={strokeColor} 
            strokeWidth={1.5} 
          />
          {/* Bed frame details */}
          <line x1={width * 0.1} y1={height * 0.2} x2={width * 0.1} y2={height * 0.8} stroke={strokeColor} strokeWidth={2} />
          <line x1={width * 0.9} y1={height * 0.2} x2={width * 0.9} y2={height * 0.8} stroke={strokeColor} strokeWidth={2} />
          {/* Headboard */}
          <rect x={width * 0.08} y={height * 0.15} width={width * 0.84} height={height * 0.08} fill="rgba(96, 165, 250, 0.15)" stroke={strokeColor} strokeWidth={1.5} />
          <text x={width / 2} y={height - 5} textAnchor="middle" fill={strokeColor} fontSize="10">BED</text>
        </g>
      );

    case 'gurney':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Main gurney surface */}
          <rect
            x={width * 0.15}
            y={height * 0.15}
            width={width * 0.7}
            height={height * 0.65}
            fill="rgba(96, 165, 250, 0.15)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={2}
          />
          {/* Pillow area */}
          <ellipse 
            cx={width * 0.5} 
            cy={height * 0.3} 
            rx={width * 0.25} 
            ry={height * 0.12} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth={1.5} 
          />
          {/* Wheels */}
          <circle cx={width * 0.2} cy={height * 0.87} r={4} fill={strokeColor} />
          <circle cx={width * 0.8} cy={height * 0.87} r={4} fill={strokeColor} />
          <circle cx={width * 0.2} cy={height * 0.95} r={4} fill={strokeColor} />
          <circle cx={width * 0.8} cy={height * 0.95} r={4} fill={strokeColor} />
          {/* Railing */}
          <line x1={width * 0.15} y1={height * 0.2} x2={width * 0.15} y2={height * 0.75} stroke={strokeColor} strokeWidth={1.5} strokeDasharray="2 2" />
          <line x1={width * 0.85} y1={height * 0.2} x2={width * 0.85} y2={height * 0.75} stroke={strokeColor} strokeWidth={1.5} strokeDasharray="2 2" />
          <text x={width / 2} y={height / 2 + 3} textAnchor="middle" fill={strokeColor} fontSize="10">GURNEY</text>
        </g>
      );

    case 'chair':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Seat */}
          <rect
            x={width * 0.2}
            y={height * 0.35}
            width={width * 0.6}
            height={width * 0.6}
            fill="rgba(96, 165, 250, 0.15)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={2}
          />
          {/* Backrest */}
          <rect
            x={width * 0.25}
            y={height * 0.08}
            width={width * 0.5}
            height={height * 0.3}
            fill="rgba(96, 165, 250, 0.15)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={2}
          />
          {/* Armrests */}
          <rect x={width * 0.15} y={height * 0.4} width={width * 0.08} height={height * 0.3} fill="none" stroke={strokeColor} strokeWidth={1} />
          <rect x={width * 0.77} y={height * 0.4} width={width * 0.08} height={height * 0.3} fill="none" stroke={strokeColor} strokeWidth={1} />
          {/* Legs */}
          <circle cx={width * 0.25} cy={height * 0.92} r={2.5} fill={strokeColor} />
          <circle cx={width * 0.75} cy={height * 0.92} r={2.5} fill={strokeColor} />
        </g>
      );

    case 'desk':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Desktop */}
          <rect
            x={width * 0.05}
            y={height * 0.25}
            width={width * 0.9}
            height={height * 0.12}
            fill="rgba(96, 165, 250, 0.15)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Drawers right side */}
          <rect x={width * 0.72} y={height * 0.42} width={width * 0.22} height={height * 0.15} fill="rgba(96, 165, 250, 0.1)" stroke={strokeColor} strokeWidth={1.5} />
          <rect x={width * 0.72} y={height * 0.6} width={width * 0.22} height={height * 0.15} fill="rgba(96, 165, 250, 0.1)" stroke={strokeColor} strokeWidth={1.5} />
          <rect x={width * 0.72} y={height * 0.78} width={width * 0.22} height={height * 0.15} fill="rgba(96, 165, 250, 0.1)" stroke={strokeColor} strokeWidth={1.5} />
          {/* Drawer handles */}
          <circle cx={width * 0.83} cy={height * 0.495} r={1.5} fill={strokeColor} />
          <circle cx={width * 0.83} cy={height * 0.675} r={1.5} fill={strokeColor} />
          <circle cx={width * 0.83} cy={height * 0.855} r={1.5} fill={strokeColor} />
          {/* Drawers left side */}
          <rect x={width * 0.06} y={height * 0.42} width={width * 0.22} height={height * 0.15} fill="rgba(96, 165, 250, 0.1)" stroke={strokeColor} strokeWidth={1.5} />
          <rect x={width * 0.06} y={height * 0.6} width={width * 0.22} height={height * 0.15} fill="rgba(96, 165, 250, 0.1)" stroke={strokeColor} strokeWidth={1.5} />
          <circle cx={width * 0.17} cy={height * 0.495} r={1.5} fill={strokeColor} />
          <circle cx={width * 0.17} cy={height * 0.675} r={1.5} fill={strokeColor} />
          {/* Legs */}
          <rect x={width * 0.08} y={height * 0.38} width={width * 0.04} height={height * 0.6} fill="none" stroke={strokeColor} strokeWidth={1} />
          <rect x={width * 0.88} y={height * 0.38} width={width * 0.04} height={height * 0.6} fill="none" stroke={strokeColor} strokeWidth={1} />
          <text x={width / 2} y={height / 2} textAnchor="middle" fill={strokeColor} fontSize="10">DESK</text>
        </g>
      );

    case 'computer':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Monitor */}
          <rect
            x={width * 0.15}
            y={height * 0.1}
            width={width * 0.7}
            height={height * 0.5}
            fill="rgba(96, 165, 250, 0.2)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Screen */}
          <rect
            x={width * 0.18}
            y={height * 0.13}
            width={width * 0.64}
            height={height * 0.42}
            fill="rgba(96, 165, 250, 0.3)"
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Monitor stand */}
          <rect
            x={width * 0.42}
            y={height * 0.6}
            width={width * 0.16}
            height={height * 0.1}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Base */}
          <rect
            x={width * 0.3}
            y={height * 0.7}
            width={width * 0.4}
            height={height * 0.08}
            fill="rgba(96, 165, 250, 0.15)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Keyboard */}
          <rect
            x={width * 0.2}
            y={height * 0.82}
            width={width * 0.6}
            height={height * 0.12}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          {/* Keyboard keys suggestion */}
          <line x1={width * 0.22} y1={height * 0.85} x2={width * 0.78} y2={height * 0.85} stroke={strokeColor} strokeWidth={0.5} />
          <line x1={width * 0.22} y1={height * 0.88} x2={width * 0.78} y2={height * 0.88} stroke={strokeColor} strokeWidth={0.5} />
          <line x1={width * 0.22} y1={height * 0.91} x2={width * 0.78} y2={height * 0.91} stroke={strokeColor} strokeWidth={0.5} />
          <text x={width / 2} y={height - 2} textAnchor="middle" fill={strokeColor} fontSize="9">PC</text>
        </g>
      );

    case 'wall_h':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="#1e293b"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={strokeColor} strokeWidth={1} strokeDasharray="5 5" />
        </g>
      );

    case 'wall_v':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="#1e293b"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke={strokeColor} strokeWidth={1} strokeDasharray="5 5" />
        </g>
      );

    case 'door':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path
            d={`M ${width * 0.1} ${height / 2} Q ${width * 0.5} ${height * 0.1} ${width * 0.9} ${height / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <text x={width / 2} y={height - 5} textAnchor="middle" fill={strokeColor} fontSize="9">DOOR</text>
        </g>
      );

    case 'cabinet':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx={width * 0.3} cy={height * 0.5} r={2} fill={strokeColor} />
          <circle cx={width * 0.7} cy={height * 0.5} r={2} fill={strokeColor} />
          <text x={width / 2} y={height - 5} textAnchor="middle" fill={strokeColor} fontSize="9">CAB</text>
        </g>
      );

    case 'sink':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width * 0.3}
            ry={height * 0.3}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <circle cx={width / 2} cy={height * 0.25} r={3} fill={strokeColor} />
          <text x={width / 2} y={height - 5} textAnchor="middle" fill={strokeColor} fontSize="9">SINK</text>
        </g>
      );

    case 'equipment':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <rect
            x={width * 0.2}
            y={height * 0.2}
            width={width * 0.6}
            height={height * 0.6}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line x1={width * 0.3} y1={height * 0.3} x2={width * 0.7} y2={height * 0.7} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1={width * 0.7} y1={height * 0.3} x2={width * 0.3} y2={height * 0.7} stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x={width / 2} y={height - 5} textAnchor="middle" fill={strokeColor} fontSize="9">EQUIP</text>
        </g>
      );

    case 'trauma_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(239, 68, 68, 0.05)"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
          />
          
          {/* Central bed - narrower */}
          <rect
            x={width * 0.35}
            y={height * 0.35}
            width={width * 0.25}
            height={height * 0.35}
            fill="rgba(239, 68, 68, 0.1)"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <circle cx={width * 0.475} cy={height * 0.45} r={height * 0.08} fill="none" stroke="#ef4444" strokeWidth={1.5} />
          
          {/* Ventilator (left side) */}
          <rect
            x={width * 0.1}
            y={height * 0.4}
            width={width * 0.12}
            height={height * 0.25}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.11}
            y={height * 0.42}
            width={width * 0.1}
            height={height * 0.12}
            fill="rgba(239, 68, 68, 0.15)"
            stroke="#ef4444"
            strokeWidth={1}
          />
          <line x1={width * 0.13} y1={height * 0.57} x2={width * 0.2} y2={height * 0.57} stroke="#ef4444" strokeWidth={1} />
          <line x1={width * 0.13} y1={height * 0.6} x2={width * 0.2} y2={height * 0.6} stroke="#ef4444" strokeWidth={1} />
          
          {/* Cabinets (top wall) */}
          <rect
            x={width * 0.1}
            y={height * 0.08}
            width={width * 0.15}
            height={height * 0.12}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <line x1={width * 0.175} y1={height * 0.08} x2={width * 0.175} y2={height * 0.2} stroke="#ef4444" strokeWidth={1.5} />
          <circle cx={width * 0.14} cy={height * 0.14} r={1.5} fill="#ef4444" />
          <circle cx={width * 0.21} cy={height * 0.14} r={1.5} fill="#ef4444" />
          
          <rect
            x={width * 0.28}
            y={height * 0.08}
            width={width * 0.15}
            height={height * 0.12}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <line x1={width * 0.355} y1={height * 0.08} x2={width * 0.355} y2={height * 0.2} stroke="#ef4444" strokeWidth={1.5} />
          <circle cx={width * 0.32} cy={height * 0.14} r={1.5} fill="#ef4444" />
          <circle cx={width * 0.39} cy={height * 0.14} r={1.5} fill="#ef4444" />
          
          {/* Computer station (right side) */}
          <rect
            x={width * 0.78}
            y={height * 0.4}
            width={width * 0.12}
            height={height * 0.15}
            fill="rgba(239, 68, 68, 0.1)"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.8}
            y={height * 0.42}
            width={width * 0.08}
            height={height * 0.08}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#ef4444" fontSize="12">TRAUMA BAY</text>
        </g>
      );

    case 'exam_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(34, 197, 94, 0.05)"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
          />
          
          {/* Exam bed */}
          <rect
            x={width * 0.15}
            y={height * 0.4}
            width={width * 0.25}
            height={height * 0.4}
            fill="rgba(34, 197, 94, 0.1)"
            stroke="#22c55e"
            strokeWidth={1.5}
          />
          <circle cx={width * 0.275} cy={height * 0.5} r={height * 0.08} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          
          {/* Computer station */}
          <rect
            x={width * 0.65}
            y={height * 0.5}
            width={width * 0.2}
            height={height * 0.25}
            fill="rgba(34, 197, 94, 0.1)"
            stroke="#22c55e"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.67}
            y={height * 0.52}
            width={width * 0.16}
            height={height * 0.12}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.72}
            y={height * 0.67}
            width={width * 0.06}
            height={height * 0.05}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1}
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#22c55e" fontSize="12">EXAM ROOM</text>
        </g>
      );

    case 'xray_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(168, 85, 247, 0.05)"
            stroke="#a855f7"
            strokeWidth={strokeWidth}
          />
          
          {/* X-ray table */}
          <rect
            x={width * 0.25}
            y={height * 0.4}
            width={width * 0.5}
            height={height * 0.25}
            fill="rgba(168, 85, 247, 0.1)"
            stroke="#a855f7"
            strokeWidth={1.5}
          />
          
          {/* X-ray machine overhead */}
          <rect
            x={width * 0.4}
            y={height * 0.15}
            width={width * 0.2}
            height={height * 0.15}
            fill="none"
            stroke="#a855f7"
            strokeWidth={1.5}
          />
          <line x1={width * 0.5} y1={height * 0.3} x2={width * 0.5} y2={height * 0.4} stroke="#a855f7" strokeWidth={2} />
          
          {/* Radiation symbol */}
          <circle cx={width * 0.15} cy={height * 0.15} r={height * 0.08} fill="none" stroke="#a855f7" strokeWidth={1.5} />
          <line x1={width * 0.15} y1={height * 0.1} x2={width * 0.15} y2={height * 0.2} stroke="#a855f7" strokeWidth={1.5} />
          <line x1={width * 0.11} y1={height * 0.15} x2={width * 0.19} y2={height * 0.15} stroke="#a855f7" strokeWidth={1.5} />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#a855f7" fontSize="12">X-RAY</text>
        </g>
      );

    case 'ct_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(59, 130, 246, 0.05)"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#3b82f6" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#3b82f6" strokeWidth={1} opacity={0.3} />
          
          {/* CT table */}
          <rect
            x={width * 0.2}
            y={height * 0.45}
            width={width * 0.6}
            height={height * 0.15}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
          
          {/* CT scanner ring */}
          <circle 
            cx={width * 0.5} 
            cy={height * 0.525} 
            r={height * 0.2} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth={2.5} 
          />
          <circle 
            cx={width * 0.5} 
            cy={height * 0.525} 
            r={height * 0.12} 
            fill="rgba(59, 130, 246, 0.1)" 
            stroke="#3b82f6" 
            strokeWidth={1} 
          />
          
          {/* Control station */}
          <rect
            x={width * 0.8}
            y={height * 0.15}
            width={width * 0.15}
            height={height * 0.2}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.82}
            y={height * 0.17}
            width={width * 0.11}
            height={height * 0.1}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1}
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#3b82f6" fontSize="12">CT SCAN</text>
        </g>
      );

    case 'operating_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(236, 72, 153, 0.05)"
            stroke="#ec4899"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#ec4899" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#ec4899" strokeWidth={1} opacity={0.3} />
          
          {/* Operating table */}
          <rect
            x={width * 0.35}
            y={height * 0.4}
            width={width * 0.3}
            height={height * 0.25}
            fill="rgba(236, 72, 153, 0.1)"
            stroke="#ec4899"
            strokeWidth={1.5}
          />
          
          {/* Surgical light */}
          <circle cx={width * 0.5} cy={height * 0.25} r={height * 0.08} fill="none" stroke="#ec4899" strokeWidth={2} />
          <circle cx={width * 0.5} cy={height * 0.25} r={height * 0.05} fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth={1} />
          <line x1={width * 0.5} y1={height * 0.33} x2={width * 0.5} y2={height * 0.4} stroke="#ec4899" strokeWidth={1.5} />
          
          {/* Equipment cart */}
          <rect
            x={width * 0.1}
            y={height * 0.5}
            width={width * 0.15}
            height={height * 0.25}
            fill="none"
            stroke="#ec4899"
            strokeWidth={1.5}
          />
          <line x1={width * 0.1} y1={height * 0.6} x2={width * 0.25} y2={height * 0.6} stroke="#ec4899" strokeWidth={1} />
          <line x1={width * 0.1} y1={height * 0.65} x2={width * 0.25} y2={height * 0.65} stroke="#ec4899" strokeWidth={1} />
          
          {/* Monitor */}
          <rect
            x={width * 0.75}
            y={height * 0.35}
            width={width * 0.15}
            height={height * 0.2}
            fill="rgba(236, 72, 153, 0.1)"
            stroke="#ec4899"
            strokeWidth={1.5}
          />
          <rect
            x={width * 0.77}
            y={height * 0.37}
            width={width * 0.11}
            height={height * 0.13}
            fill="none"
            stroke="#ec4899"
            strokeWidth={1}
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#ec4899" fontSize="12">OPERATING ROOM</text>
        </g>
      );

    case 'waiting_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(245, 158, 11, 0.05)"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#f59e0b" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#f59e0b" strokeWidth={1} opacity={0.3} />
          
          {/* Rows of chairs */}
          {/* Top row */}
          <rect x={width * 0.15} y={height * 0.25} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.3} y={height * 0.25} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.45} y={height * 0.25} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.6} y={height * 0.25} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          
          {/* Bottom row */}
          <rect x={width * 0.15} y={height * 0.6} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.3} y={height * 0.6} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.45} y={height * 0.6} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={width * 0.6} y={height * 0.6} width={width * 0.12} height={height * 0.12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          
          {/* Reception desk */}
          <rect
            x={width * 0.75}
            y={height * 0.4}
            width={width * 0.15}
            height={height * 0.25}
            fill="rgba(245, 158, 11, 0.1)"
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#f59e0b" fontSize="12">WAITING ROOM</text>
        </g>
      );

    case 'ambulance_bay':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(220, 38, 38, 0.05)"
            stroke="#dc2626"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#dc2626" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#dc2626" strokeWidth={1} opacity={0.3} />
          
          {/* Ambulance 1 */}
          <rect
            x={width * 0.15}
            y={height * 0.25}
            width={width * 0.3}
            height={height * 0.25}
            fill="rgba(220, 38, 38, 0.1)"
            stroke="#dc2626"
            strokeWidth={2}
          />
          <circle cx={width * 0.22} cy={height * 0.52} r={height * 0.04} fill="none" stroke="#dc2626" strokeWidth={1.5} />
          <circle cx={width * 0.38} cy={height * 0.52} r={height * 0.04} fill="none" stroke="#dc2626" strokeWidth={1.5} />
          <rect x={width * 0.2} y={height * 0.28} width={width * 0.15} height={height * 0.12} fill="none" stroke="#dc2626" strokeWidth={1} />
          <line x1={width * 0.275} y1={height * 0.32} x2={width * 0.275} y2={height * 0.36} stroke="#dc2626" strokeWidth={2} />
          <line x1={width * 0.255} y1={height * 0.34} x2={width * 0.295} y2={height * 0.34} stroke="#dc2626" strokeWidth={2} />
          
          {/* Ambulance 2 */}
          <rect
            x={width * 0.55}
            y={height * 0.25}
            width={width * 0.3}
            height={height * 0.25}
            fill="rgba(220, 38, 38, 0.1)"
            stroke="#dc2626"
            strokeWidth={2}
          />
          <circle cx={width * 0.62} cy={height * 0.52} r={height * 0.04} fill="none" stroke="#dc2626" strokeWidth={1.5} />
          <circle cx={width * 0.78} cy={height * 0.52} r={height * 0.04} fill="none" stroke="#dc2626" strokeWidth={1.5} />
          <rect x={width * 0.6} y={height * 0.28} width={width * 0.15} height={height * 0.12} fill="none" stroke="#dc2626" strokeWidth={1} />
          <line x1={width * 0.675} y1={height * 0.32} x2={width * 0.675} y2={height * 0.36} stroke="#dc2626" strokeWidth={2} />
          <line x1={width * 0.655} y1={height * 0.34} x2={width * 0.695} y2={height * 0.34} stroke="#dc2626" strokeWidth={2} />
          
          {/* Entry doors */}
          <rect
            x={width * 0.4}
            y={height * 0.65}
            width={width * 0.2}
            height={height * 0.15}
            fill="none"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#dc2626" fontSize="12">AMBULANCE BAY</text>
        </g>
      );

    case 'parking_lot':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(100, 116, 139, 0.05)"
            stroke="#64748b"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#64748b" strokeWidth={1} opacity={0.2} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#64748b" strokeWidth={1} opacity={0.2} />
          
          {/* Parking spaces - row 1 */}
          <rect x={width * 0.1} y={height * 0.15} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.28} y={height * 0.15} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.46} y={height * 0.15} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.64} y={height * 0.15} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          
          {/* Parking spaces - row 2 */}
          <rect x={width * 0.1} y={height * 0.55} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.28} y={height * 0.55} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.46} y={height * 0.55} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          <rect x={width * 0.64} y={height * 0.55} width={width * 0.15} height={height * 0.25} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
          
          {/* Handicap parking */}
          <rect x={width * 0.82} y={height * 0.35} width={width * 0.15} height={height * 0.25} fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth={2} />
          <text x={width * 0.895} y={height * 0.5} textAnchor="middle" fill="#3b82f6" fontSize="14">♿</text>
          
          <text x={width / 2} y={height * 0.92} textAnchor="middle" fill="#64748b" fontSize="12">PARKING LOT</text>
        </g>
      );

    case 'office':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(14, 165, 233, 0.05)"
            stroke="#0ea5e9"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#0ea5e9" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#0ea5e9" strokeWidth={1} opacity={0.3} />
          
          {/* Desk */}
          <rect
            x={width * 0.15}
            y={height * 0.35}
            width={width * 0.35}
            height={width * 0.2}
            fill="rgba(14, 165, 233, 0.1)"
            stroke="#0ea5e9"
            strokeWidth={1.5}
          />
          <line x1={width * 0.17} y1={height * 0.45} x2={width * 0.48} y2={height * 0.45} stroke="#0ea5e9" strokeWidth={1} />
          
          {/* Computer */}
          <rect
            x={width * 0.25}
            y={height * 0.28}
            width={width * 0.15}
            height={width * 0.08}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={1.5}
          />
          
          {/* Chair */}
          <rect
            x={width * 0.28}
            y={height * 0.58}
            width={width * 0.1}
            height={width * 0.1}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={1.5}
          />
          
          {/* Filing cabinet */}
          <rect
            x={width * 0.7}
            y={height * 0.3}
            width={width * 0.18}
            height={height * 0.25}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={1.5}
          />
          <line x1={width * 0.79} y1={height * 0.3} x2={width * 0.79} y2={height * 0.55} stroke="#0ea5e9" strokeWidth={1.5} />
          <circle cx={width * 0.745} cy={height * 0.42} r={1.5} fill="#0ea5e9" />
          <circle cx={width * 0.835} cy={height * 0.42} r={1.5} fill="#0ea5e9" />
          
          {/* Bookshelf */}
          <rect
            x={width * 0.1}
            y={height * 0.08}
            width={width * 0.2}
            height={height * 0.15}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={1.5}
          />
          <line x1={width * 0.1} y1={height * 0.125} x2={width * 0.3} y2={height * 0.125} stroke="#0ea5e9" strokeWidth={1} />
          <line x1={width * 0.1} y1={height * 0.18} x2={width * 0.3} y2={height * 0.18} stroke="#0ea5e9" strokeWidth={1} />
          
          <text x={width / 2} y={height * 0.9} textAnchor="middle" fill="#0ea5e9" fontSize="12">OFFICE</text>
        </g>
      );

    case 'conference_room':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="#10b981"
            strokeWidth={strokeWidth}
          />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#10b981" strokeWidth={1} opacity={0.3} />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#10b981" strokeWidth={1} opacity={0.3} />
          
          {/* Conference table */}
          <ellipse
            cx={width * 0.5}
            cy={height * 0.5}
            rx={width * 0.35}
            ry={height * 0.25}
            fill="rgba(16, 185, 129, 0.1)"
            stroke="#10b981"
            strokeWidth={2}
          />
          
          {/* Chairs around table */}
          {/* Top chairs */}
          <rect x={width * 0.25} y={height * 0.18} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          <rect x={width * 0.46} y={height * 0.18} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          <rect x={width * 0.67} y={height * 0.18} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          
          {/* Bottom chairs */}
          <rect x={width * 0.25} y={height * 0.74} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          <rect x={width * 0.46} y={height * 0.74} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          <rect x={width * 0.67} y={height * 0.74} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          
          {/* Side chairs */}
          <rect x={width * 0.05} y={height * 0.46} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          <rect x={width * 0.87} y={height * 0.46} width={width * 0.08} height={height * 0.08} fill="none" stroke="#10b981" strokeWidth={1.5} />
          
          {/* Screen/presentation area */}
          <rect
            x={width * 0.35}
            y={height * 0.08}
            width={width * 0.3}
            height={height * 0.08}
            fill="none"
            stroke="#10b981"
            strokeWidth={2}
          />
          
          <text x={width / 2} y={height * 0.92} textAnchor="middle" fill="#10b981" fontSize="12">CONFERENCE ROOM</text>
        </g>
      );

    case 'blank_box':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="rgba(96, 165, 250, 0.05)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </g>
      );

    case 'text_box':
      return (
        <g>
          <rect
            width={width}
            height={height}
            fill="none"
            stroke="none"
          />
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={strokeColor}
            fontSize="14"
            fontWeight="bold"
          >
            {element.label || 'TEXT'}
          </text>
        </g>
      );

    default:
      return (
        <rect
          width={width}
          height={height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
  }
}