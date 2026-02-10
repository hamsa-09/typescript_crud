import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css'
})
export class UiTagComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' = 'secondary';
  @Input() clickable = false;
  @Input() removable = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
  @Output() onRemove = new EventEmitter<MouseEvent>();
}
