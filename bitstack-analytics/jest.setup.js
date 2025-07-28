import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Stacks Connect
jest.mock('@stacks/connect', () => ({
  AppConfig: jest.fn(),
  UserSession: jest.fn(() => ({
    isUserSignedIn: jest.fn(() => false),
    isSignInPending: jest.fn(() => false),
  })),
  showConnect: jest.fn(),
}))

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
}
global.localStorage = localStorageMock