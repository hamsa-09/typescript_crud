import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemeService, Post } from '../../core/services/meme.service';
import { AuthService } from '../../core/services/auth.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { CanComponentDeactivate } from '../../core/guards/unsaved-changes.guard';
import { UiButtonComponent } from '../../shared/ui/button/button.component';
import { UiInputComponent } from '../../shared/ui/input/input.component';
import { UiSelectComponent } from '../../shared/ui/select/select.component';
import { UiTagComponent } from '../../shared/ui/tag/tag.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-composer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTagComponent
  ],
  templateUrl: './post-composer.component.html',
  styleUrl: './post-composer.component.css'
})
export class PostComposerComponent implements OnInit, CanComponentDeactivate, OnDestroy {
  private fb = inject(FormBuilder);
  private memeService = inject(MemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(LocalStorageService);

  postForm: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  postId: number | null = null;
  tagInput = '';
  validationError = '';
  isSubmitted = false;

  teamOptions = [
    { label: 'Frontend', value: 'Frontend' },
    { label: 'Backend', value: 'Backend' },
    { label: 'Platform', value: 'Platform' },
    { label: 'QA', value: 'QA' },
    { label: 'Design', value: 'Design' },
    { label: 'Product', value: 'Product' }
  ];

  moodOptions = [
    { label: 'POV', value: 'POV' },
    { label: 'Relatable', value: 'Relatable' },
    { label: 'Sarcastic', value: 'Sarcastic' },
    { label: 'Dad-joke', value: 'Dad-joke' },
    { label: 'Chaos', value: 'Chaos' },
    { label: 'General', value: 'General' }
  ];

  constructor() {
    this.postForm = this.fb.group({
      title: [''],
      team: ['Frontend', Validators.required],
      content: ['', Validators.required],
      mood: ['POV', Validators.required],
      tags: [[]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.postId = +id;
        this.loadPost(this.postId);
      } else {
        this.isEditMode.set(false);
        this.restoreDraft();
      }
    });

    // Auto-save draft on value changes
    this.postForm.valueChanges.subscribe(val => {
      if (!this.isSubmitted && !this.isLoading()) {
        this.saveDraft(val);
      }
    });
  }

  ngOnDestroy() {
      // Optional: Clean up subscriptions if needed, but valueChanges is tied to component lifecycle mostly.
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.postForm.dirty && !this.isSubmitted) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }

  get draftKey(): string {
    const uid = this.authService.currentUserValue?.id;
    if (this.isEditMode() && this.postId) {
       return `draft:${uid}:post:${this.postId}`;
    } else {
       return `draft:${uid}:new`;
    }
  }

  loadPost(id: number) {
    this.isLoading.set(true);
    this.memeService.getPost(id).subscribe({
      next: (post) => {
        // Check ownership
        const currentUser = this.authService.currentUserValue;
        if (!currentUser || (post.userId !== currentUser.id && !this.authService.isAdmin())) {
          alert('Access Denied: You cannot edit this post.');
          this.router.navigate(['/feed']);
          return;
        }

        // Restore draft if exists, else use post data
        const draft = this.storage.getItem<any>(this.draftKey);
        if (draft && confirm('Restore unsaved draft for this post?')) {
            this.postForm.patchValue(draft);
        } else {
            this.postForm.patchValue({
                title: post.title,
                team: post.team,
                content: post.content,
                mood: post.mood,
                tags: post.tags || []
            });
        }
        this.isLoading.set(false);
      },
      error: () => {
        alert('Failed to load post');
        this.router.navigate(['/feed']);
      }
    });
  }

  restoreDraft() {
    const draft = this.storage.getItem<any>(this.draftKey);
    if (draft && confirm('Restore unsaved draft?')) {
      this.postForm.patchValue(draft);
      this.postForm.markAsDirty(); // Mark as dirty so guard triggers
    }
  }

  saveDraft(val: any) {
    this.storage.setItem(this.draftKey, val);
  }

  addTag(event: Event) {
    event.preventDefault();
    const val = this.tagInput.trim();
    const currentTags = this.postForm.get('tags')?.value as string[];

    if (val && !currentTags.includes(val)) {
      this.postForm.patchValue({ tags: [...currentTags, val] });
      this.postForm.markAsDirty();
    }
    this.tagInput = '';
  }

  removeTag(tag: string) {
    const currentTags = this.postForm.get('tags')?.value as string[];
    this.postForm.patchValue({ tags: currentTags.filter(t => t !== tag) });
    this.postForm.markAsDirty();
  }

  cancel() {
    // Navigate away - guard will trigger if dirty
    // If user explicitly cancels and confirms logic in guard, or we can force clear draft.
    // Usually 'Cancel' button implies "I want to discard changes".
    // So we should maybe clear draft and navigate, and let guard handle confirmation or bypass it?
    // If I bypass guard, I must ensure draft is cleared.
    if (confirm('Discard changes?')) {
        this.storage.removeItem(this.draftKey);
        this.postForm.reset();
        this.isSubmitted = true; // Hack to bypass guard
        this.router.navigate(['/feed']);
    }
  }

  onSubmit() {
    if (this.postForm.invalid) {
      this.validationError = 'Please fill all required fields';
      return;
    }

    this.isLoading.set(true);
    const formValue = this.postForm.value;

    if (this.isEditMode() && this.postId) {
      this.memeService.updatePost(this.postId, formValue).subscribe({
        next: () => this.handleSuccess(),
        error: () => {
            this.isLoading.set(false);
            alert('Failed to update post');
        }
      });
    } else {
      this.memeService.createPost(formValue).subscribe({
        next: () => this.handleSuccess(),
        error: () => {
            this.isLoading.set(false);
            alert('Failed to create post');
        }
      });
    }
  }

  handleSuccess() {
    this.isSubmitted = true; // Bypass guard
    this.storage.removeItem(this.draftKey);
    this.isLoading.set(false);
    this.router.navigate(['/feed']);
  }
}
