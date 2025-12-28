import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock localStorage with actual storage behavior
// Use a module-level store that persists across mock resets
let localStorageStore: Record<string, string> = {};

// Create mock functions with spies
const getItemMock = vi.fn();
const setItemMock = vi.fn();
const removeItemMock = vi.fn();
const clearMock = vi.fn();
const keyMock = vi.fn();

const localStorageMock = {
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  clear: clearMock,
  get length() { return Object.keys(localStorageStore).length; },
  key: keyMock,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mock implementations before each test
beforeEach(() => {
  // Clear the object contents instead of reassigning to preserve reference
  for (const key in localStorageStore) {
    delete localStorageStore[key];
  }

  getItemMock.mockImplementation((key: string) => localStorageStore[key] ?? null);
  setItemMock.mockImplementation((key: string, value: string) => { localStorageStore[key] = value; });
  removeItemMock.mockImplementation((key: string) => { delete localStorageStore[key]; });
  clearMock.mockImplementation(() => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  });
  keyMock.mockImplementation((index: number) => Object.keys(localStorageStore)[index] ?? null);
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia for reduced-motion tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Silence console.error for expected errors in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress React act() warnings and expected test errors
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('act(') || args[0].includes('Warning:'))
  ) {
    return;
  }
  originalError.apply(console, args);
};
