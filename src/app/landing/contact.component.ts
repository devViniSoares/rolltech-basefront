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
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
    whatsapp: [
      '',
      [
        Validators.pattern(
          /^(?:\+?55\s*)?\(?[1-9][0-9]\)?\s*9?[0-9]{4}[-\s]?[0-9]{4}$/,
        ),
      ],
    ],
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

  selectService(service: string): void {
    this.selectedService.set(service);
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
    this.pending.set(true);
    const values = this.form.getRawValue();
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
      this.pending.set(false);
    }
  }
}
