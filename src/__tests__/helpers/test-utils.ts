import { Request, Response } from 'express';
import { vi } from 'vitest';

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  } as Request;
  return req;
}

export function createMockResponse(): Response {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn()
  } as Partial<Response>;
  return res as Response;
}
