import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(null);
  private userSignal = signal<User | null>(null);
  
  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = signal(false);
  
  constructor() {
    // Check for stored token
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      this.tokenSignal.set(storedToken);
      this.userSignal.set(JSON.parse(storedUser));
      this.isAuthenticated.set(true);
    }
  }
  
  login(email: string, password: string): Observable<{ token: string; user: User }> {
    // Mock login - in real app, this would call an API
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email,
        name: 'Test User',
        roles: ['user', 'admin']
      }
    }).pipe(
      delay(500), // Simulate API call
      map(response => {
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
        this.isAuthenticated.set(true);
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        
        return response;
      })
    );
  }
  
  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.isAuthenticated.set(false);
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
  
  getToken(): string | null {
    return this.tokenSignal();
  }
  
  canRefreshToken(): boolean {
    // Mock implementation
    return false;
  }
  
  refreshToken(): Observable<string> {
    // Mock implementation
    return throwError(() => new Error('Token refresh not implemented'));
  }
  
  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.roles.includes(role) ?? false;
  }
  
  hasPermission(permission: string): boolean {
    // Mock implementation
    return true;
  }
}

