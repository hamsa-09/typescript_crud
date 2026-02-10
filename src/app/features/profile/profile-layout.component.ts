import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="profile-container">
      <div class="sidebar">
        <div class="user-card" *ngIf="authService.currentUserValue as user">
          <div class="avatar-placeholder">{{ user.name.charAt(0).toUpperCase() }}</div>
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <span class="role-badge">{{ user.role }}</span>
        </div>

        <nav class="profile-nav">
          <a routerLink="profile" routerLinkActive="active" class="nav-item">
            👤 Profile Info
          </a>
          <a routerLink="liked" routerLinkActive="active" class="nav-item">
            ❤️ Liked Posts
          </a>
          <a routerLink="saved" routerLinkActive="active" class="nav-item">
            🔖 Saved Posts
          </a>
          <button (click)="authService.logout()" class="logout-btn">
            🚪 Logout
          </button>
        </nav>
      </div>

      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .sidebar {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .user-card {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #334155;
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      background-color: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 auto 1rem auto;
    }

    .user-card h3 {
      color: #f8fafc;
      margin: 0.5rem 0;
    }

    .user-card p {
      color: #94a3b8;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
    }

    .role-badge {
      background-color: #334155;
      color: #cbd5e1;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .profile-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.15s;
    }

    .nav-item:hover {
      background-color: #334155;
      color: #f8fafc;
    }

    .nav-item.active {
      background-color: #2563eb;
      color: white;
    }

    .logout-btn {
      margin-top: 1rem;
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      background: none;
      border: 1px solid #ef4444;
      color: #ef4444;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .logout-btn:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class ProfileLayoutComponent {
  public authService = inject(AuthService);
}
