import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
