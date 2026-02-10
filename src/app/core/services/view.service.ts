import { Injectable, signal } from '@angular/core';

export type ViewType = 'FEED' | 'DETAIL' | 'CREATE' | 'EDIT';

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  currentView = signal<ViewType>('FEED');
  selectedPostId = signal<string | null>(null);

  constructor() {}

  // Navigation Actions

  goFeed() {
    this.currentView.set('FEED');
    this.selectedPostId.set(null);
  }

  openPost(postId: string) {
    this.selectedPostId.set(postId);
    this.currentView.set('DETAIL');
  }

  openCreate() {
    this.selectedPostId.set(null);
    this.currentView.set('CREATE');
  }

  openEdit(postId: string) {
    this.selectedPostId.set(postId);
    this.currentView.set('EDIT');
  }
}
