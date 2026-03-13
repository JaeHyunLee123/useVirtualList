class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as any;

// Mock layout metrics for jsdom
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 400 });
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 800 });
