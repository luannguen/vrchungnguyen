/**
 * Type definitions for Jest globals
 * 
 * File này cung cấp các định nghĩa kiểu cho các biến toàn cục của Jest
 * để TypeScript không báo lỗi khi sử dụng chúng trong các file .ts hoặc .tsx
 */

declare global {
  const describe: jest.Describe;
  const test: jest.It;
  const it: jest.It;
  const expect: jest.Expect;
  const beforeEach: jest.Lifecycle;
  const afterEach: jest.Lifecycle;
  const beforeAll: jest.Lifecycle;
  const afterAll: jest.Lifecycle;
}

export {};
