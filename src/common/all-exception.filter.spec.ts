import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exception.filter';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseExceptionFilter } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';

describe('AllExceptionsFilter', () => {
  let service: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({}).compile();

    const app = module.createNestApplication();

    service = new AllExceptionsFilter(app.getHttpAdapter());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call catch', () => {
    jest.mock('@nestjs/core');
    jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation((exception: HttpException) => ({
        statusCode: exception.getStatus(),
        message: exception.getResponse(),
      }));
    expect(
      service.catch(
        new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR),
        createMock<ArgumentsHost>(),
      ),
    ).toBeUndefined();
  });
});
