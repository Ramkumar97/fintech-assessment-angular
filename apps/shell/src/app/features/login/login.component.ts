import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" [(ngModel)]="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" [(ngModel)]="password" name="password" required>
          </div>
          <button type="submit" [disabled]="loading">Login</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: var(--color-surface);
    }
    .login-card {
      background: var(--color-background);
      padding: var(--spacing-xl);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 300px;
    }
    .form-group {
      margin-bottom: var(--spacing-md);
    }
    label {
      display: block;
      margin-bottom: var(--spacing-xs);
    }
    input {
      width: 100%;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-text-secondary);
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: var(--spacing-sm);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
  email = 'test@example.com';
  password = 'password';
  loading = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onLogin(): void {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
      }
    });
  }
}

