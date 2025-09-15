import { useEffect, useRef, useState } from 'react';

import { useBoard } from '@context/BoardContext';

const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(20); // Each cell is 20x20 pixels by default
  const [offset, setOffset] = useState(() => {
    // Center the board in the canvas
    // Default dimensions when no board exists
    const defaultWidth = 50;
    const defaultHeight = 50;
    return {
      x: (800 - defaultWidth * 20) / 2, // canvas width - board width
      y: (600 - defaultHeight * 20) / 2  // canvas height - board height
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const [initialClickPos, setInitialClickPos] = useState<{ x: number, y: number } | null>(null);
  const { board, loading, toggleSquare } = useBoard();

  useEffect(() => {
    drawBoard();
  }, [board, scale, offset]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Default dimensions when no board exists
    const dimensions = board?.dimensions ?? { width: 50, height: 50 };

    // Draw grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < dimensions.width; x++) {
      for (let y = 0; y < dimensions.height; y++) {
        const screenX = x * scale + offset.x;
        const screenY = y * scale + offset.y;

        ctx.strokeRect(screenX, screenY, scale, scale);

        // Fill living cells if a board exists
        if (board) {
          const isAlive = board.livingCells.some(cell => cell.Column === x && cell.Row === y);
          if (isAlive) {
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX, screenY, scale, scale);
          }
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(5, Math.min(50, prev * zoomFactor)));
  };

  const getGridCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - offset.x) / scale);
    const y = Math.floor((clientY - rect.top - offset.y) / scale);
    
    // Check if coordinates are within grid bounds
    const dimensions = board?.dimensions ?? { width: 50, height: 50 };
    if (x >= 0 && x < dimensions.width && y >= 0 && y < dimensions.height) {
      return { x, y };
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownTime(Date.now());
    setInitialClickPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!initialClickPos) return;

    // Start dragging if mouse has moved more than 5 pixels
    const dx = e.clientX - initialClickPos.x;
    const dy = e.clientY - initialClickPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      setIsDragging(true);
    }

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const timeElapsed = Date.now() - mouseDownTime;
    
    // If it was a click (short duration and minimal movement)
    if (timeElapsed < 200 && !isDragging) {
      const gridCoords = getGridCoordinates(e.clientX, e.clientY);
      if (gridCoords) {
        toggleSquare(gridCoords);
      }
    }

    setIsDragging(false);
    setInitialClickPos(null);
  };

  return (
    <div className="relative w-full h-[600px] border border-gray-300 rounded">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div 
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-8 w-8 border-4 border-gray-900 border-t-transparent" 
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        role="presentation"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default GameBoard;