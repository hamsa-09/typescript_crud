import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MemeService, Post } from '../../core/services/meme.service';
import { AuthService } from '../../core/services/auth.service';
import { UiButtonComponent } from '../../shared/ui/button/button.component';
import { UiTagComponent } from '../../shared/ui/tag/tag.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiTagComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private memeService = inject(MemeService);
  private authService = inject(AuthService);

  post = signal<Post | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Spoiler state
  revealedSpoilers = signal<Set<number>>(new Set());

  // Computed properties
  isAuthor = computed(() => {
    const p = this.post();
    const currentUser = this.authService.currentUserValue;
    return p && currentUser && p.userId === currentUser.id;
  });

  isAdmin = computed(() => this.authService.isAdmin());

  parsedBody = computed(() => {
    const content = this.post()?.content || '';
    if (!content) return [];

    // Simplistic spoiler parsing logic matching original
    const parts: { text: string, isSpoiler: boolean }[] = [];
    const regex = /\|\|(.*?)\|\|/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: content.substring(lastIndex, match.index), isSpoiler: false });
      }
      parts.push({ text: match[1], isSpoiler: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ text: content.substring(lastIndex), isSpoiler: false });
    }

    // If no matches, return whole text
    if (parts.length === 0 && content.length > 0) {
      return [{ text: content, isSpoiler: false }];
    }

    return parts;
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPost(+id);
      }
    });
  }

  loadPost(id: number) {
    this.isLoading.set(true);
    this.error.set(null);
    this.memeService.getPost(id).subscribe({
      next: (post) => {
        this.post.set(post);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load post');
        this.isLoading.set(false);
      }
    });
  }

  isRevealed(index: number) {
    return this.revealedSpoilers().has(index);
  }

  toggleSpoiler(index: number) {
    this.revealedSpoilers.update(set => {
      const newSet = new Set(set);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }

  toggleLike() {
    const p = this.post();
    if (p) {
      this.memeService.toggleLike(p.id).subscribe(() => {
        // Refresh post to get updated likes count correctly or manually update local signal
        // Simple manual update for now
        this.post.update(current => {
            if (!current) return null;
            const newIsLiked = !current.isLiked;
            return {
                ...current,
                isLiked: newIsLiked,
                likesCount: (current.likesCount || 0) + (newIsLiked ? 1 : -1)
            };
        });
      });
    }
  }

  toggleBookmark() {
    const p = this.post();
    if (p) {
      this.memeService.toggleBookmark(p.id).subscribe(() => {
        this.post.update(current => {
            if (!current) return null;
            return {
                ...current,
                isBookmarked: !current.isBookmarked
            };
        });
      });
    }
  }

  onDelete() {
    const p = this.post();
    if (p && confirm('Delete this meme?')) {
      this.memeService.deletePost(p.id).subscribe({
          next: () => this.router.navigate(['/feed']),
          error: () => alert('Failed to delete post')
      });
    }
  }

  onEdit() {
    const p = this.post();
    if (p) this.router.navigate(['/edit', p.id]);
  }

  onReport() {
    const p = this.post();
    if (!p) return;

    const reason = prompt('Why are you reporting this post?');
    if (reason) {
      this.memeService.reportPost(p.id, reason).subscribe({
        next: () => alert('Post reported to admins.'),
        error: () => alert('Failed to report post.')
      });
    }
  }

  goBack() {
      this.router.navigate(['/feed']);
  }
}
