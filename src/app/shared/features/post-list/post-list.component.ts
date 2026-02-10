import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post, MemeService } from '../../../core/services/meme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="posts-list">
      <div *ngIf="posts.length === 0" class="empty-state">
        <p>{{ emptyMessage }}</p>
      </div>

      <div
        *ngFor="let post of posts"
        class="post-card"
        [class.deleted-post]="post.isDeleted"
        (click)="openPost(post.id)">

        <div class="post-header">
           <div class="post-meta">
            <span class="author">@{{ post.authorName }}</span>
            <span class="divider">•</span>
            <span class="team-badge">Team: {{ post.team }}</span>
            <span class="divider">•</span>
            <span class="mood-badge">Mood: {{ post.mood }}</span>
            <span class="divider">•</span>
            <span class="timestamp">{{ getRelativeTime(post.timestamp) }}</span>
            <span *ngIf="post.isDeleted" class="deleted-badge">DELETED</span>
          </div>
        </div>

        <h3 class="post-title">{{ post.title || '@' + post.authorName }}</h3>

        <div class="post-body-preview">
          {{ getPreview(post.content) }}
        </div>

        <div class="post-tags">
          <span *ngFor="let tag of post.tags" class="tag">#{{ tag }}</span>
        </div>

        <div class="post-footer" (click)="$event.stopPropagation()">
          <div class="footer-left">
            <button
              class="action-btn"
              [class.liked]="post.isLiked"
              (click)="toggleLike(post, $event)">
              {{ post.isLiked ? '❤️' : '🤍' }} {{ post.likesCount }}
            </button>

            <button
              class="action-btn"
              [class.saved]="post.isBookmarked"
              (click)="toggleBookmark(post, $event)">
              {{ post.isBookmarked ? '🔖 Saved' : '🔖 Save' }}
            </button>
          </div>

          <!-- Admin Actions -->
          <div class="footer-right" *ngIf="isAdmin()">
            <button *ngIf="!post.isDeleted" class="admin-btn delete" (click)="deletePost(post, $event)">🗑️ Delete</button>
            <button *ngIf="post.isDeleted" class="admin-btn restore" (click)="restorePost(post, $event)">♻️ Restore</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Copy existing styles and add new ones */
    .posts-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; background-color: #1e293b; border-radius: 8px; border: 1px dashed #334155; }
    .post-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; transition: all 0.2s ease-in-out; cursor: pointer; }
    .post-card:hover { border-color: #475569; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .post-header { margin-bottom: 1rem; }
    .post-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; color: #94a3b8; font-size: 0.875rem; }
    .author { color: #e2e8f0; font-weight: 600; }
    .divider { color: #475569; }
    .team-badge, .mood-badge { background-color: #334155; color: #cbd5e1; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
    .mood-badge { background-color: #312e81; color: #c7d2fe; }
    .post-title { color: #f8fafc; font-size: 1.25rem; font-weight: 700; margin: 0 0 0.75rem 0; line-height: 1.4; }
    .post-body-preview { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .tag { color: #3b82f6; font-size: 0.875rem; }
    .post-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 1rem; }
    .footer-left { display: flex; gap: 1rem; }
    .action-btn { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: 4px; transition: all 0.15s; }
    .action-btn:hover { background-color: #334155; color: #e2e8f0; }
    .action-btn.liked { color: #ef4444; }
    .action-btn.saved { color: #3b82f6; }

    /* New styles */
    .deleted-post { opacity: 0.6; border-color: #ef4444; background-color: rgba(239, 68, 68, 0.05); }
    .deleted-badge { background-color: #ef4444; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .admin-btn { background: none; border: none; cursor: pointer; font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .admin-btn.delete { color: #ef4444; }
    .admin-btn.restore { color: #10b981; }
    .admin-btn:hover { background-color: #334155; }
  `]
})
export class PostListComponent {
  @Input() posts: Post[] = [];
  @Input() emptyMessage = 'No posts found.';

  private router = inject(Router);
  private memeService = inject(MemeService);
  private authService = inject(AuthService);

  openPost(id: number) {
    this.router.navigate(['/post', id]);
  }

  isAdmin() {
      return this.authService.isAdmin();
  }

  toggleLike(post: Post, event: Event) {
    event.stopPropagation();
    this.memeService.toggleLike(post.id).subscribe();
  }

  toggleBookmark(post: Post, event: Event) {
    event.stopPropagation();
    this.memeService.toggleBookmark(post.id).subscribe();
  }

  deletePost(post: Post, event: Event) {
      event.stopPropagation();
      if(confirm('Soft delete this post?')) {
          this.memeService.deletePost(post.id).subscribe();
      }
  }

  restorePost(post: Post, event: Event) {
      event.stopPropagation();
      this.memeService.restorePost(post.id).subscribe();
  }

  getPreview(content: string): string {
    if (!content) return '';
    return content.replace(/\|\|.*?\|\|/g, '[SPOILER]');
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
