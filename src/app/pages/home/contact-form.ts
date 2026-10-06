import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { PortfolioApi } from '../../core/api/portfolio-api';
import { Lang } from '../../core/i18n/languages';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'rate-limited';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form class="card form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="form__row">
        <div class="field">
          <label for="c-name">{{ 'contact.name' | transloco }}</label>
          <input id="c-name" type="text" formControlName="name" autocomplete="name" maxlength="100"
                 [attr.aria-invalid]="invalid('name')" aria-describedby="c-name-err" />
          @if (invalid('name')) {
            <span id="c-name-err" class="field__error">{{ 'contact.required' | transloco }}</span>
          }
        </div>
        <div class="field">
          <label for="c-email">{{ 'contact.email' | transloco }}</label>
          <input id="c-email" type="email" formControlName="email" autocomplete="email" maxlength="200"
                 [attr.aria-invalid]="invalid('email')" aria-describedby="c-email-err" />
          @if (invalid('email')) {
            <span id="c-email-err" class="field__error">{{ 'contact.invalidEmail' | transloco }}</span>
          }
        </div>
      </div>

      <div class="field">
        <label for="c-msg">{{ 'contact.message' | transloco }}</label>
        <textarea id="c-msg" rows="5" formControlName="message" maxlength="4000"
                  [attr.aria-invalid]="invalid('message')" aria-describedby="c-msg-err"></textarea>
        @if (invalid('message')) {
          <span id="c-msg-err" class="field__error">{{ 'contact.tooShort' | transloco }}</span>
        }
      </div>

      <!-- Honeypot: hidden from people and screen readers, bots fill it. -->
      <div class="visually-hidden" aria-hidden="true">
        <label for="c-website">Website</label>
        <input id="c-website" type="text" formControlName="website" tabindex="-1" autocomplete="off" />
      </div>

      <div class="form__footer">
        <span class="mono hint">{{ 'contact.delivered' | transloco }}</span>
        <button class="btn btn--primary" type="submit" [disabled]="status() === 'sending'">
          {{ (status() === 'sending' ? 'contact.sending' : 'contact.send') | transloco }}
        </button>
      </div>

      <p class="form__status" role="status" aria-live="polite">
        @switch (status()) {
          @case ('sent') { <span class="ok">{{ 'contact.sent' | transloco }}</span> }
          @case ('error') { <span class="err">{{ 'contact.error' | transloco }}</span> }
          @case ('rate-limited') { <span class="err">{{ 'contact.tooMany' | transloco }}</span> }
        }
      </p>
    </form>
  `,
  styles: `
    .form { display: flex; flex-direction: column; gap: 18px; }
    .form__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; color: var(--text); }
    input, textarea {
      min-height: 48px; padding: 12px 14px; border-radius: 10px;
      border: 1px solid #2a2f3a; background: var(--bg); color: var(--text-strong);
      font: inherit; font-size: 15px; resize: vertical;
    }
    input:focus, textarea:focus { border-color: var(--accent-strong); outline: none; }
    [aria-invalid='true'] { border-color: var(--danger); }
    .field__error { font-size: 13px; color: var(--danger); }
    .form__footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .hint { font-size: 12px; color: var(--muted); }
    .form__status { margin: 0; min-height: 1.6em; }
    .ok { color: var(--success); }
    .err { color: var(--danger); }
  `,
})
export class ContactForm {
  private readonly api = inject(PortfolioApi);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly lang = input.required<Lang>();
  protected readonly status = signal<Status>('idle');

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    website: [''],
  });

  protected invalid(name: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('sending');
    const v = this.form.getRawValue();

    this.api
      .sendContactMessage({
        name: v.name.trim(),
        email: v.email.trim(),
        message: v.message.trim(),
        website: v.website,
        languageCode: this.lang(),
      })
      .subscribe({
        next: () => {
          this.status.set('sent');
          this.form.reset();
        },
        error: (e: HttpErrorResponse) => this.status.set(e.status === 429 ? 'rate-limited' : 'error'),
      });
  }
}
