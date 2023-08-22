import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class {
      canActivate(): void {
        return null;
      }
    };
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = createMock<Reflector>();
    guard = new JwtAuthGuard(reflector);
  });

  it('should return true if the request is public', () => {
    const context = createMock<ExecutionContext>();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should call super.canActivate if the request is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMock<ExecutionContext>();
    const result = guard.canActivate(context);
    expect(result).toBeNull();
  });
});
