import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  // Default route - redirect to login if not authenticated
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Public routes (auth pages)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Protected routes (require authentication)
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'compose',
    loadComponent: () => import('./features/post-composer/post-composer.component').then(m => m.PostComposerComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./features/post-composer/post-composer.component').then(m => m.PostComposerComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./features/post-detail/post-detail.component').then(m => m.PostDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'me',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile-layout.component').then(m => m.ProfileLayoutComponent),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('./features/profile/user-info/user-info.component').then(m => m.UserInfoComponent) },
      { path: 'liked', loadComponent: () => import('./features/profile/liked-posts/liked-posts.component').then(m => m.LikedPostsComponent) },
      { path: 'saved', loadComponent: () => import('./features/profile/saved-posts/saved-posts.component').then(m => m.SavedPostsComponent) }
    ]
  },
  {
    path: 'admin/moderation',
    loadComponent: () => import('./features/admin/moderation.component').then(m => m.ModerationComponent),
    canActivate: [adminGuard]
  },

  // Fallback - redirect to login
  { path: '**', redirectTo: 'auth/login' }
];
