import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IGenericDataResponse } from '../models/generic-data.response';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IGenericDataResponse<T>
> {
  intercept(
    _: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IGenericDataResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: true,
        data,
      })),
    );
  }
}
