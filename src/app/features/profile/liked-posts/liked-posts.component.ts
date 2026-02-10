import { Component, inject, OnInit } from '@angular/core';
import { PostListComponent } from '../../../shared/features/post-list/post-list.component';
import { MemeService } from '../../../core/services/meme.service';

@Component({
  selector: 'app-liked-posts',
  standalone: true,
  imports: [PostListComponent],
  template: `
    <h2>Your Liked Memes</h2>
    <app-post-list [posts]="memeService.posts()" emptyMessage="You haven't liked any memes yet!"></app-post-list>
  `,
  styles: [`
    h2 {
      margin-top: 0;
      color: #f8fafc;
      margin-bottom: 2rem;
    }
  `]
})
export class LikedPostsComponent implements OnInit {
  public memeService = inject(MemeService);

  ngOnInit() {
    this.memeService.loadPosts({ likedOnly: true });
  }
}
