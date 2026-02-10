import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create an account</h2>
          <p>Join the meme revolution</p>
        </div>

        <div *ngIf="errorMessage" class="server-error">
          {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="form-input"
              placeholder="John Doe"
            >
            <div *ngIf="f['name'].touched && f['name'].errors" class="error-message">
              <span *ngIf="f['name'].errors?.['required']">Name is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              placeholder="name@example.com"
            >
            <div *ngIf="f['email'].touched && f['email'].errors" class="error-message">
              <span *ngIf="f['email'].errors?.['required']">Email is required</span>
              <span *ngIf="f['email'].errors?.['email']">Enter a valid email address</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              placeholder="••••••••"
            >
            <div *ngIf="f['password'].touched && f['password'].errors" class="error-message">
              <span *ngIf="f['password'].errors?.['required']">Password is required</span>
              <span *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading" class="btn-primary">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login" class="auth-link">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.styles.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      }
    });
  }
}
