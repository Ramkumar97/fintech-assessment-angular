import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() footerActions: ModalAction[] = [];
  @Input() closable: boolean = true;
  
  @Output() close = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  
  // Methods
  closeModal(): void {
    if (this.closable) {
      this.isOpen = false;
      this.close.emit();
      this.closed.emit();
    }
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  onActionClick(action: string): void {
    this.actionClick.emit(action);
  }
  
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen && this.closable) {
      this.closeModal();
    }
  }
  
  getSizeClass(): string {
    return `modal-${this.size}`;
  }
}

