import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { first, switchMap, tap, map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

export interface Post {
  id: number;
  userId: number;
  title?: string;
  content: string; // db.json has 'content', old code had 'body'. I will map or rename.
  team: string;
  mood: string;
  tags: string[];
  timestamp: string; // db.json
  spoiler: boolean;
  views: number;
  isDeleted: boolean;
  // Augmented properties
  authorName?: string;
  likesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
}

export interface Bookmark {
  id: number;
  userId: number;
  postId: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  team?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals
  private allPosts = signal<Post[]>([]); // Cache all posts
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  private currentFilters: any = {};

  constructor() {
    // Initial load handled by components or effect
  }

  loadPosts(filters: any = {}) {
    // Check if we need a server-side reload
    // We reload if server-side filters changed OR if we have no cached posts
    const serverFiltersChanged =
      filters.search !== this.currentFilters.search ||
      filters.team !== this.currentFilters.team ||
      filters.mood !== this.currentFilters.mood ||
      filters.sort !== this.currentFilters.sort;

    this.currentFilters = { ...filters };

    if (!serverFiltersChanged && this.allPosts().length > 0) {
      // Just apply client-side filters on the cached data
      this.applyClientFilters();
      return;
    }

    // Otherwise, do a full reload
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams();

    // Server-side filtering parameters
    if (filters.search) {
      params = params.set('q', filters.search);
    }
    if (filters.team) {
      params = params.set('team', filters.team);
    }
    if (filters.mood) {
      params = params.set('mood', filters.mood);
    }

    if (filters.sort === 'newest') {
      params = params.set('_sort', 'timestamp').set('_order', 'desc');
    } else if (filters.sort === 'oldest') {
      params = params.set('_sort', 'timestamp').set('_order', 'asc');
    }

    // Embed related data
    params = params.set('_expand', 'user');
    params = params.append('_embed', 'likes');
    params = params.append('_embed', 'bookmarks');

    this.http.get<any[]>(`${this.apiUrl}/posts`, { params }).subscribe({
      next: (data) => {
        const currentUser = this.authService.currentUserValue;
        const currentUserId = currentUser?.id;

        const mappedPosts: Post[] = data.map(item => ({
          id: item.id,
          userId: item.userId,
          title: item.title,
          content: item.content,
          team: item.team,
          mood: item.mood,
          tags: item.tags,
          timestamp: item.timestamp,
          spoiler: item.spoiler,
          views: item.views,
          isDeleted: item.isDeleted,
          authorName: item.user?.name || 'Unknown',
          likesCount: item.likes?.length || 0,
          isLiked: currentUserId ? item.likes?.some((l: Like) => l.userId === currentUserId) : false,
          isBookmarked: currentUserId ? item.bookmarks?.some((b: Bookmark) => b.userId === currentUserId) : false
        }));

        this.allPosts.set(mappedPosts);
        this.applyClientFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching posts', err);
        this.error.set('Failed to load posts');
        this.isLoading.set(false);
      }
    });
  }

  private applyClientFilters() {
    const filters = this.currentFilters;
    let finalPosts = this.allPosts();

    // Client-side filtering for 'saved' and 'liked' since json-server can't do deep relational filtering easily
    if (filters.savedOnly) {
      finalPosts = finalPosts.filter(p => p.isBookmarked);
    }
    if (filters.likedOnly) {
      finalPosts = finalPosts.filter(p => p.isLiked);
    }

    // Hide deleted posts unless admin
    if (!this.authService.isAdmin()) {
      finalPosts = finalPosts.filter(p => !p.isDeleted);
    }

    this.posts.set(finalPosts);
  }

  toggleLike(postId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return new Observable(); // Should not happen if guarded

    // First check if liked
    return this.http.get<Like[]>(`${this.apiUrl}/likes?postId=${postId}&userId=${currentUser.id}`).pipe(
      switchMap(likes => {
        if (likes.length > 0) {
          // Unlike
          return this.http.delete(`${this.apiUrl}/likes/${likes[0].id}`).pipe(
            tap(() => this.updateLocalPostLike(postId, false))
          );
        } else {
          // Like
          return this.http.post(`${this.apiUrl}/likes`, { postId, userId: currentUser.id }).pipe(
            tap(() => this.updateLocalPostLike(postId, true))
          );
        }
      })
    );
  }

  toggleBookmark(postId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return new Observable();

    return this.http.get<Bookmark[]>(`${this.apiUrl}/bookmarks?postId=${postId}&userId=${currentUser.id}`).pipe(
      switchMap(bookmarks => {
        if (bookmarks.length > 0) {
          // Unbookmark
          return this.http.delete(`${this.apiUrl}/bookmarks/${bookmarks[0].id}`).pipe(
            tap(() => this.updateLocalPostBookmark(postId, false))
          );
        } else {
          // Bookmark
          return this.http.post(`${this.apiUrl}/bookmarks`, { postId, userId: currentUser.id }).pipe(
            tap(() => this.updateLocalPostBookmark(postId, true))
          );
        }
      })
    );
  }

  getPost(id: number): Observable<Post> {
    const params = new HttpParams()
      .set('_expand', 'user')
      .append('_embed', 'likes')
      .append('_embed', 'bookmarks');

    return this.http.get<any>(`${this.apiUrl}/posts/${id}`, { params }).pipe(
      map(data => {
        const currentUser = this.authService.currentUserValue;
        const currentUserId = currentUser?.id;

        return {
          id: data.id,
          userId: data.userId,
          title: data.title,
          content: data.content,
          team: data.team,
          mood: data.mood,
          tags: data.tags,
          timestamp: data.timestamp,
          spoiler: data.spoiler,
          views: data.views,
          isDeleted: data.isDeleted,
          authorName: data.user?.name || 'Unknown',
          likesCount: data.likes?.length || 0,
          isLiked: currentUserId ? data.likes?.some((l: Like) => l.userId === currentUserId) : false,
          isBookmarked: currentUserId ? data.bookmarks?.some((b: Bookmark) => b.userId === currentUserId) : false
        } as Post;
      })
    );
  }

  private updateLocalPostLike(postId: number, isLiked: boolean) {
    // Fetch the updated post to get accurate like count
    this.getPost(postId).subscribe({
      next: (updatedPost) => {
        this.allPosts.update(posts => posts.map(p =>
          p.id === postId ? updatedPost : p
        ));
        this.applyClientFilters();
      },
      error: (err) => {
        console.error('Failed to update post after like:', err);
        // Fallback: simple optimistic update
        this.allPosts.update(posts => posts.map(p => {
          if (p.id === postId) {
            const currentCount = p.likesCount || 0;
            return {
              ...p,
              isLiked,
              likesCount: isLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
            };
          }
          return p;
        }));
        this.applyClientFilters();
      }
    });
  }

  private updateLocalPostBookmark(postId: number, isBookmarked: boolean) {
    // Fetch the updated post to get accurate bookmark state
    this.getPost(postId).subscribe({
      next: (updatedPost) => {
        this.allPosts.update(posts => posts.map(p =>
          p.id === postId ? updatedPost : p
        ));
        this.applyClientFilters();
      },
      error: (err) => {
        console.error('Failed to update post after bookmark:', err);
        // Fallback: simple optimistic update
        this.allPosts.update(posts => posts.map(p =>
          p.id === postId ? { ...p, isBookmarked } : p
        ));
        this.applyClientFilters();
      }
    });
  }

  deletePost(postId: number) {
      // Soft delete
      return this.http.patch(`${this.apiUrl}/posts/${postId}`, { isDeleted: true }).pipe(
          tap(() => {
              this.allPosts.update(posts => posts.map(p => p.id === postId ? { ...p, isDeleted: true } : p));
              this.applyClientFilters();
          })
      );
  }

  createPost(post: Partial<Post>): Observable<Post> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return new Observable();

    const newPost = {
      ...post,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      views: 0,
      isDeleted: false
    };

    return this.http.post<Post>(`${this.apiUrl}/posts`, newPost).pipe(
      tap(created => {
        // Build a proper Post object with authorName for the cache
        const augmented: Post = {
          ...created,
          authorName: currentUser.name,
          likesCount: 0,
          isLiked: false,
          isBookmarked: false
        };
        this.allPosts.update(posts => [augmented, ...posts]);
        this.applyClientFilters();
      })
    );
  }

  updatePost(id: number, updates: Partial<Post>): Observable<Post> {
    return this.http.patch<Post>(`${this.apiUrl}/posts/${id}`, updates).pipe(
      tap(updated => {
        this.allPosts.update(posts => posts.map(p => p.id === id ? { ...p, ...updated } : p));
        this.applyClientFilters();
      })
    );
  }

  restorePost(postId: number): Observable<any> {
      return this.http.patch(`${this.apiUrl}/posts/${postId}`, { isDeleted: false }).pipe(
          tap(() => {
              this.allPosts.update(posts => posts.map(p => p.id === postId ? { ...p, isDeleted: false } : p));
              this.applyClientFilters();
          })
      );
  }

  reportPost(postId: number, reason: string): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return new Observable();

    const flag = {
      postId,
      userId: currentUser.id,
      reason,
      status: 'open',
      timestamp: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/flags`, flag);
  }

  getFlags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flags?_expand=post&_expand=user`);
  }

  resolveFlag(flagId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/flags/${flagId}`, { status: 'closed' });
  }
}
