import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>

        <div *ngIf="errorMessage" class="server-error">
          {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
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
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn-primary">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account?
          <a routerLink="/auth/register" class="auth-link">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.styles.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl: string;

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/feed';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      }
    });
  }
}
