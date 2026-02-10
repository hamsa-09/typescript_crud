import { Component } from '@angular/core';

@Component({
  selector: 'app-user-info',
  standalone: true,
  template: `
    <div class="info-card">
      <h2>Welcome to your profile</h2>
      <p>Here you can view your activity and saved items.</p>
    </div>
  `,
  styles: [`
    .info-card {
      background-color: #1e293b;
      padding: 2rem;
      border-radius: 8px;
      color: #cbd5e1;
    }
  `]
})
export class UserInfoComponent {}
