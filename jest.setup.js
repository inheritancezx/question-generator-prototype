import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock Ollama client
jest.mock('ollama', () => {
  const chatMock = jest.fn().mockResolvedValue({ message: { content: '' } })
  const Ollama = jest.fn().mockImplementation(() => ({
    chat: chatMock,
  }))
  // expose for tests to override
  Ollama.__chatMock = chatMock
  return { __esModule: true, default: Ollama, Ollama, __chatMock: chatMock }
})

// Mock environment variables
process.env.OLLAMA_HOST = 'http://localhost:11434'
process.env.OLLAMA_MODEL = 'llama3:instruct'

// Setup for each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  
  // Reset fetch mock
  fetch.mockClear()
})

// Cleanup after each test
afterEach(() => {
  // Clean up any side effects
  jest.restoreAllMocks()
})

// Global test timeout
jest.setTimeout(10000)

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})