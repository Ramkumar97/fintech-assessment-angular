import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isDevMode } from '@angular/core';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  // Only log in development mode
  if (!isDevMode()) {
    return next(req);
  }
  
  console.log(`[HTTP Request] ${req.method} ${req.url}`, {
    headers: req.headers.keys(),
    body: req.body
  });
  
  return next(req).pipe(
    tap({
      next: (response) => {
        const duration = Date.now() - startTime;
        console.log(`[HTTP Response] ${req.method} ${req.url}`, {
          status: response.status,
          duration: `${duration}ms`
        });
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP Error] ${req.method} ${req.url}`, {
          status: error.status,
          duration: `${duration}ms`,
          error: error.error
        });
      }
    })
  );
};

