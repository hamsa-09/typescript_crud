import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeService, Post } from '../../core/services/meme.service';
import { UiCardComponent } from '../../shared/ui/card/card.component';
import { UiButtonComponent } from '../../shared/ui/button/button.component';
import { UiInputComponent } from '../../shared/ui/input/input.component';
import { UiSelectComponent } from '../../shared/ui/select/select.component';
import { UiTagComponent } from '../../shared/ui/tag/tag.component';
import { PostListComponent } from '../../shared/features/post-list/post-list.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTagComponent,
    PostListComponent
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent {
  private router = inject(Router);
  public memeService = inject(MemeService);

  // Filter signals
  searchQuery = signal('');
  selectedTeam = signal<string>('');
  selectedMood = signal<string>('');
  showSavedOnly = signal(false);
  showLikedOnly = signal(false);
  sortOrder = signal<'newest' | 'oldest'>('newest');

  constructor() {
    // React to filter changes
    effect(() => {
      // Create a dependency on all signals
      const filters = {
        search: this.searchQuery(),
        team: this.selectedTeam(),
        mood: this.selectedMood(),
        savedOnly: this.showSavedOnly(),
        likedOnly: this.showLikedOnly(),
        sort: this.sortOrder()
      };

      // Load posts with filters
      // This will run once initially too
      this.memeService.loadPosts(filters);
    });
  }

  onSortChange(value: string) {
    this.sortOrder.set(value as 'newest' | 'oldest');
  }

  toggleLike(post: Post, event: Event) {
    event.stopPropagation();
    this.memeService.toggleLike(post.id).subscribe();
  }

  toggleBookmark(post: Post, event: Event) {
    event.stopPropagation();
    this.memeService.toggleBookmark(post.id).subscribe();
  }

  openPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }

  openCreate() {
    this.router.navigate(['/compose']);
  }

  getPreview(content: string): string {
    if (!content) return '';
    // Remove spoiler tags for preview
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
