import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Ensures all decimal/numeric values in API responses are serialized as strings.
 * TypeORM returns NUMERIC columns as strings by default (pg driver behaviour),
 * but this interceptor is a safety net in case any numeric type slips through.
 *
 * Traverses the response object recursively and converts any numeric primitives
 * that look like monetary values to strings.
 */
@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => this.serializeDecimals(data)),
    );
  }

  private serializeDecimals(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'number') {
      // Convert raw numbers to strings to prevent float representation issues
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeDecimals(item));
    }
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = this.serializeDecimals(value);
      }
      return result;
    }
    return obj;
  }
}
