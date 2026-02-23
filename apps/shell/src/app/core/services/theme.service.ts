import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

interface ThemeTokens {
  [key: string]: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>('light');
  readonly theme = this.themeSignal.asReadonly();
  
  private lightTokens: ThemeTokens = {
    'color-primary': '#0066cc',
    'color-secondary': '#6c757d',
    'color-background': '#ffffff',
    'color-surface': '#f8f9fa',
    'color-text': '#212529',
    'color-text-secondary': '#6c757d',
    'color-success': '#28a745',
    'color-danger': '#dc3545',
    'color-warning': '#ffc107',
  };
  
  private darkTokens: ThemeTokens = {
    'color-primary': '#4d9fff',
    'color-secondary': '#8e9aaf',
    'color-background': '#1a1a1a',
    'color-surface': '#2d2d2d',
    'color-text': '#ffffff',
    'color-text-secondary': '#b0b0b0',
    'color-success': '#4caf50',
    'color-danger': '#f44336',
    'color-warning': '#ff9800',
  };
  
  constructor() {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme('light');
    }
  }
  
  applyTheme(theme: Theme): void {
    const tokens = theme === 'light' ? this.lightTokens : this.darkTokens;
    const root = document.documentElement;
    
    // Apply CSS variables to root
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Set data attribute for theme
    root.setAttribute('data-theme', theme);
    
    // Update signal
    this.themeSignal.set(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }
  
  toggleTheme(): void {
    const currentTheme = this.themeSignal();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
  
  private getThemeTokens(theme: Theme): ThemeTokens {
    return theme === 'light' ? this.lightTokens : this.darkTokens;
  }
}

