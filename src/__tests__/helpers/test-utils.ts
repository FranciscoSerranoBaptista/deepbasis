import { Request, Response } from 'express';

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
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as Partial<Response>;
  return res as Response;
}
