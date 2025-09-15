import '@testing-library/jest-dom';

// Mock canvas API
class MockContext2D {
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  clearRect = jest.fn();
  strokeRect = jest.fn();
  fillRect = jest.fn();
  beginPath = jest.fn();
  stroke = jest.fn();
  fill = jest.fn();
}

// Override getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextId: string) {
  if (contextId === '2d') {
    return new MockContext2D(this) as unknown as CanvasRenderingContext2D;
  }
  return originalGetContext.call(this, contextId);
};

// Mock getBoundingClientRect for canvas
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 800,
  bottom: 600,
  toJSON: () => {}
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));