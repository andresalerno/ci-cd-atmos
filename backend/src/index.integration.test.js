// backend/src/index.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'

/*
  Mocks must be registered before importing the application module.
  We mock 'express', 'pg', and 'mongodb' so importing src/index.js
  doesn't create real DB connections or start a real server.
*/

// Shared handlers map for the express mock
const handlers = {}

// Mock express default export: returns an app with get() and listen()
vi.mock('express', () => {
  return {
    // default export is a function that creates the app
    default: () => {
      return {
        get: (path, handler) => {
          handlers[path] = handler
        },
        listen: (port, cb) => {
          // record that listen was called, but do not start a real server
          handlers.__listen = { port }
          if (typeof cb === 'function') cb()
        }
      }
    },
    // expose handlers map so tests can access registered route handlers
    __mockHandlers: handlers
  }
})

// Mock 'pg' default export: provide an object with Pool class
class MockPool {
  constructor(cfg) {
    MockPool.instance = this
    this.cfg = cfg
  }
  async query(sql) {
    return MockPool.queryImpl(sql)
  }
  static reset() {
    MockPool.instance = null
    MockPool.queryImpl = async () => ({ rows: [] })
  }
}
MockPool.reset()

vi.mock('pg', () => {
  return {
    // default export is an object (pkg) that contains Pool
    default: { Pool: MockPool }
  }
})

// Mock MongoClient named export from 'mongodb'
class MockMongoClient {
  constructor(uri) {
    MockMongoClient.instance = this
    this.uri = uri
  }
  async connect() {
    return MockMongoClient.connectImpl()
  }
  db() {
    return {
      command: async (...args) => MockMongoClient.commandImpl(...args)
    }
  }
  static reset() {
    MockMongoClient.instance = null
    MockMongoClient.connectImpl = async () => {}
    MockMongoClient.commandImpl = async () => ({ ok: 1 })
  }
}
MockMongoClient.reset()

vi.mock('mongodb', () => {
  return {
    MongoClient: MockMongoClient
  }
})

describe('integration: /health', () => {
  beforeEach(async () => {
    // reset mock implementations before each test
    MockPool.reset()
    MockMongoClient.reset()
    // Clear any previously registered handlers
    for (const k of Object.keys(handlers)) delete handlers[k]
    // Import the app after mocks are in place so it uses the mocks.
    // Use dynamic import to ensure vi.mock calls above are registered first.
    await import('./index.js')
    // ensure handler registered
    if (!handlers['/health']) {
      throw new Error('Health handler was not registered by app (expected /health)')
    }
  })

  it('returns ok when both Postgres and Mongo are healthy', async () => {
    // Arrange: both DBs succeed
    MockPool.queryImpl = async (sql) => ({ rows: [{ result: 1 }] })
    MockMongoClient.commandImpl = async (cmd) => ({ ok: 1 })

    const handler = handlers['/health']
    const res = makeFakeRes()

    // Act
    await handler({}, res)

    // Assert
    expect(res._status).toBe(200)
    expect(res._json).toEqual({ status: 'ok' })
  })

  it('returns error when Postgres query fails', async () => {
    // Arrange: Postgres throws
    MockPool.queryImpl = async () => { throw new Error('pg connection failed') }
    MockMongoClient.commandImpl = async () => ({ ok: 1 })

    const handler = handlers['/health']
    const res = makeFakeRes()

    // Act
    await handler({}, res)

    // Assert
    expect(res._status).toBe(500)
    expect(res._json).toHaveProperty('status', 'error')
    expect(res._json).toHaveProperty('message')
    expect(String(res._json.message)).toContain('pg connection failed')
  })

  it('returns error when Mongo ping fails', async () => {
    // Arrange: Mongo throws
    MockPool.queryImpl = async () => ({ rows: [{ result: 1 }] })
    MockMongoClient.commandImpl = async () => { throw new Error('mongo ping failed') }

    const handler = handlers['/health']
    const res = makeFakeRes()

    // Act
    await handler({}, res)

    // Assert
    expect(res._status).toBe(500)
    expect(res._json).toHaveProperty('status', 'error')
    expect(String(res._json.message)).toContain('mongo ping failed')
  })
})

// Helper: simple fake response object that mimics express res.status().json()
function makeFakeRes() {
  return {
    _status: undefined,
    _json: undefined,
    status(code) {
      this._status = code
      return this
    },
    json(obj) {
      if (this._status === undefined) this._status = 200
      this._json = obj
      return this
    }
  }
}