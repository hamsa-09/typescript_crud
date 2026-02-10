import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() clickable = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
