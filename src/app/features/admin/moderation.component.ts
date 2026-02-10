import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../core/services/meme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="moderation-container">
      <h2>Moderation Dashboard</h2>

      <div class="tabs">
        <button [class.active]="activeTab === 'flags'" (click)="activeTab = 'flags'">Flags</button>
        <!-- Future: Deleted Posts tab -->
      </div>

      <div *ngIf="activeTab === 'flags'" class="flags-list">
        <div *ngIf="isLoading" class="loading">Loading flags...</div>
        <div *ngIf="!isLoading && flags.length === 0" class="empty">No pending flags.</div>

        <div *ngFor="let flag of flags" class="flag-card">
          <div class="flag-header">
            <span class="flag-reason">🚩 {{ flag.reason }}</span>
            <span class="flag-status" [class.closed]="flag.status === 'closed'">{{ flag.status }}</span>
          </div>

          <div class="flag-details">
            <p><strong>Flagged by:</strong> User #{{ flag.userId }}</p>
            <p><strong>Post:</strong> <a (click)="openPost(flag.postId)" href="javascript:void(0)">{{ flag.post?.title || 'Untitled' }}</a></p>
            <p class="post-preview">{{ flag.post?.content | slice:0:100 }}...</p>
          </div>

          <div class="flag-actions" *ngIf="flag.status !== 'closed'">
            <button (click)="resolveFlag(flag)" class="resolve-btn">✅ Resolve</button>
            <button (click)="openPost(flag.postId)" class="view-btn">👁️ View Post</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .moderation-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    h2 { color: #f8fafc; margin-bottom: 1.5rem; }
    .tabs { margin-bottom: 1.5rem; display: flex; gap: 1rem; border-bottom: 1px solid #334155; }
    .tabs button { background: none; border: none; padding: 0.75rem 1.5rem; color: #94a3b8; cursor: pointer; font-size: 1rem; border-bottom: 2px solid transparent; }
    .tabs button.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .flag-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    .flag-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .flag-reason { color: #ef4444; font-weight: bold; }
    .flag-status { background-color: #f59e0b; color: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; }
    .flag-status.closed { background-color: #10b981; }
    .flag-details { color: #cbd5e1; margin-bottom: 1rem; }
    .flag-details a { color: #3b82f6; text-decoration: none; }
    .post-preview { font-style: italic; color: #94a3b8; margin-top: 0.5rem; border-left: 2px solid #475569; padding-left: 0.5rem; }
    .flag-actions { display: flex; gap: 1rem; }
    .resolve-btn { background-color: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .view-btn { background-color: #334155; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .loading, .empty { color: #94a3b8; text-align: center; padding: 2rem; }
  `]
})
export class ModerationComponent implements OnInit {
  activeTab = 'flags';
  flags: any[] = [];
  isLoading = false;

  private memeService = inject(MemeService);
  private router = inject(Router);

  ngOnInit() {
    this.loadFlags();
  }

  loadFlags() {
    this.isLoading = true;
    this.memeService.getFlags().subscribe({
      next: (data) => {
        this.flags = data.filter(f => f.status !== 'closed'); // Show only open flags by default? Or all? "View open flags" per requirements.
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  resolveFlag(flag: any) {
    if (confirm('Mark this flag as resolved?')) {
      this.memeService.resolveFlag(flag.id).subscribe(() => {
        this.loadFlags(); // Refresh
      });
    }
  }

  openPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }
}
