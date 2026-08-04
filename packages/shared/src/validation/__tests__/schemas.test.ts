import { describe, it, expect } from 'vitest';
import { loginSchema, createUserSchema, createWorkRecordSchema } from '../index';

describe('loginSchema', () => {
  it('validates correct input', () => {
    const result = loginSchema.safeParse({
      email: 'admin@evidence.local',
      password: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'admin',
    });
    expect(result.success).toBe(false);
  });
});

describe('createUserSchema', () => {
  it('rejects password shorter than 8 chars', () => {
    const result = createUserSchema.safeParse({
      email: 'test@evidence.local',
      password: 'short',
      fullName: 'Test User',
      roleId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(false);
  });
});

describe('createWorkRecordSchema', () => {
  it('validates correct work record', () => {
    const result = createWorkRecordSchema.safeParse({
      machineId: '550e8400-e29b-41d4-a716-446655440000',
      lineId: '550e8400-e29b-41d4-a716-446655440001',
      category: 'failure',
      date: '2026-08-03',
      startTime: '08:00',
      description: 'Test porucha',
      priority: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createWorkRecordSchema.safeParse({
      machineId: '550e8400-e29b-41d4-a716-446655440000',
      lineId: '550e8400-e29b-41d4-a716-446655440001',
      category: 'invalid_category',
      date: '2026-08-03',
      startTime: '08:00',
      description: 'Test',
    });
    expect(result.success).toBe(false);
  });
});
