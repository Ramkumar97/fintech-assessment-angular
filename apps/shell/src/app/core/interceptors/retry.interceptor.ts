import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retryWhen, delay, take, concatMap, throwError } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  // Skip retry for certain endpoints
  if (req.url.includes('/auth/') || (req.method === 'POST' && req.url.includes('/transactions'))) {
    return next(req);
  }
  
  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        concatMap((error: HttpErrorResponse, index: number) => {
          // Don't retry on 4xx errors (except 408, 429)
          if (error.status >= 400 && error.status < 500 && 
              error.status !== 408 && error.status !== 429) {
            return throwError(() => error);
          }
          
          // Don't retry if max retries reached
          if (index >= maxRetries) {
            return throwError(() => error);
          }
          
          // Exponential backoff: 1s, 2s, 4s
          const delayTime = baseDelay * Math.pow(2, index);
          
          console.log(`Retrying request to ${req.url} (attempt ${index + 1}/${maxRetries}) after ${delayTime}ms`);
          
          return delay(delayTime);
        }),
        take(maxRetries + 1)
      )
    )
  );
};

