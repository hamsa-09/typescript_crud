import { Component, inject, OnInit } from '@angular/core';
import { PostListComponent } from '../../../shared/features/post-list/post-list.component';
import { MemeService } from '../../../core/services/meme.service';

@Component({
  selector: 'app-saved-posts',
  standalone: true,
  imports: [PostListComponent],
  template: `
    <h2>Your Saved Collection</h2>
    <app-post-list [posts]="memeService.posts()" emptyMessage="You haven't saved any memes yet!"></app-post-list>
  `,
  styles: [`
    h2 {
      margin-top: 0;
      color: #f8fafc;
      margin-bottom: 2rem;
    }
  `]
})
export class SavedPostsComponent implements OnInit {
  public memeService = inject(MemeService);

  ngOnInit() {
    this.memeService.loadPosts({ savedOnly: true });
  }
}
