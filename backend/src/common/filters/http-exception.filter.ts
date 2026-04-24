import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCodes } from '../constants/error-codes.constant';
import { CpfAlreadyExistsException } from '../exceptions/cpf-already-exists.exception';
import { EmailAlreadyExistsException } from '../exceptions/email-already-exists.exception';
import { PersonNotFoundException } from '../exceptions/person-not-found.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.resolve(exception);

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details: unknown[];
  } {
    if (exception instanceof PersonNotFoundException) {
      return {
        status: HttpStatus.NOT_FOUND,
        code: ErrorCodes.PERSON_NOT_FOUND,
        message: exception.message,
        details: [],
      };
    }

    if (exception instanceof CpfAlreadyExistsException) {
      return {
        status: HttpStatus.CONFLICT,
        code: ErrorCodes.CPF_ALREADY_EXISTS,
        message: exception.message,
        details: [],
      };
    }

    if (exception instanceof EmailAlreadyExistsException) {
      return {
        status: HttpStatus.CONFLICT,
        code: ErrorCodes.EMAIL_ALREADY_EXISTS,
        message: exception.message,
        details: [],
      };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const isValidationError =
        typeof body === 'object' && body !== null && 'message' in body && Array.isArray((body as Record<string, unknown>).message);

      return {
        status: exception.getStatus(),
        code: isValidationError ? ErrorCodes.VALIDATION_ERROR : ErrorCodes.INTERNAL_ERROR,
        message: isValidationError ? 'Erro de validação' : exception.message,
        details: isValidationError ? ((body as Record<string, unknown>).message as unknown[]) : [],
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      details: [],
    };
  }
}
