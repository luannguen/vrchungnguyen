// Setup file cho Jest với React Testing Library
import '@testing-library/jest-dom';

// Thiết lập các mocks toàn cục nếu cần thiết
// Ví dụ: window.matchMedia, IntersectionObserver, ResizeObserver, v.v.

// Mock cho matchMedia (thường được sử dụng bởi nhiều thư viện UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Thiết lập cleanup tự động sau mỗi test
afterEach(() => {
  jest.clearAllMocks();
});
