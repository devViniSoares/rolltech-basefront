import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContactService } from './contact.service';

const EMAIL_PATTERN =
  /^[^\s@]+@(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}$/i;
const WHATSAPP_PATTERN =
  /^(?:\+?55[\s-]?)?(?:\([1-9]\d\)|[1-9]\d)[\s-]?9\d{4}[\s-]?\d{4}$/;

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private readonly builder = inject(FormBuilder);
  private readonly contact = inject(ContactService);
  private readonly formElement =
    viewChild<ElementRef<HTMLFormElement>>('formElement');
  readonly pending = signal(false);
  readonly message = signal('');
  readonly sent = signal(false);
  readonly selectedService = signal<string | null>(null);
  readonly form = this.builder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(120),
      ],
    ],
    company: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(160),
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(EMAIL_PATTERN),
        Validators.maxLength(254),
      ],
    ],
    whatsapp: ['', [Validators.pattern(WHATSAPP_PATTERN)]],
    challenge: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(4000),
      ],
    ],
  });

  invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  selectService(service: string | null): void {
    if (this.pending()) return;
    this.selectedService.set(service);
  }

  formatWhatsapp(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;
    const digits = raw.replace(/\D/g, '');
    const hasCountryCode =
      raw.trimStart().startsWith('+55') ||
      (raw.startsWith('55') && digits.length > 11);
    const national = (hasCountryCode ? digits.slice(2) : digits).slice(0, 11);

    let formatted = '';
    if (national) {
      formatted = `(${national.slice(0, 2)}`;
      if (national.length >= 2) formatted += ')';
      if (national.length > 2) formatted += ` ${national.slice(2, 7)}`;
      if (national.length > 7) formatted += `-${national.slice(7)}`;
    }
    if (hasCountryCode) formatted = `+55${formatted ? ` ${formatted}` : ''}`;

    this.form.controls.whatsapp.setValue(formatted);

    const digitsBeforeCursor = raw.slice(0, cursor).replace(/\D/g, '').length;
    let nextCursor = 0;
    let seenDigits = 0;
    while (nextCursor < formatted.length && seenDigits < digitsBeforeCursor) {
      if (/\d/.test(formatted[nextCursor])) seenDigits++;
      nextCursor++;
    }
    if (cursor === raw.length) nextCursor = formatted.length;
    input.setSelectionRange(nextCursor, nextCursor);
  }

  async submit(): Promise<void> {
    if (this.pending()) return;
    this.message.set('');
    this.sent.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const field = Object.keys(this.form.controls).find(
        (key) => this.form.get(key)?.invalid,
      );
      this.formElement()
        ?.nativeElement.querySelector<HTMLElement>(
          '[formControlName="' + field + '"]',
        )
        ?.focus();
      this.message.set('Confira os campos destacados antes de enviar.');
      return;
    }
    if (!this.contact.endpoint) {
      this.message.set(
        'O envio está temporariamente indisponível. Seus dados não foram enviados. Tente novamente mais tarde.',
      );
      return;
    }
    const values = this.form.getRawValue();
    this.pending.set(true);
    this.form.disable({ emitEvent: false });
    try {
      await firstValueFrom(
        this.contact.send({
          name: values.name.trim(),
          company: values.company.trim(),
          email: values.email.trim(),
          whatsapp: values.whatsapp.replace(/\D/g, ''),
          challenge: values.challenge.trim(),
          service: this.selectedService(),
        }),
      );
      this.sent.set(true);
      this.message.set(
        'Desafio enviado! A Rolltech entrará em contato com você.',
      );
      this.form.reset();
      this.selectedService.set(null);
    } catch {
      this.message.set(
        'Não foi possível enviar agora. Seus dados foram mantidos para você tentar novamente.',
      );
    } finally {
      this.form.enable({ emitEvent: false });
      this.pending.set(false);
    }
  }
}
