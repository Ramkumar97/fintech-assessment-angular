import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip auth for login/register endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }
  
  // Get token from service
  const token = authService.getToken();
  
  if (token) {
    // Clone request and add Authorization header
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401) {
          // Try to refresh token
          if (authService.canRefreshToken()) {
            return authService.refreshToken().pipe(
              switchMap((newToken: string) => {
                // Retry with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }),
              catchError(() => {
                // Refresh failed, redirect to login
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => error);
              })
            );
          } else {
            // No refresh possible, logout
            authService.logout();
            router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};

