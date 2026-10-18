import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ContactComponent } from './contact.component';
import { CONTACT_ENDPOINT } from './contact.service';

describe('Contact form', () => {
  const values = {
    name: ' Maria ',
    company: ' Empresa ',
    email: 'maria@example.com',
    whatsapp: '(11) 99999-1234',
    challenge: ' Integrar o estoque. ',
  };

  function setup(endpoint: string | null = '/api/contact') {
    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CONTACT_ENDPOINT, useValue: endpoint },
      ],
    });
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    return {
      component: fixture.componentInstance,
      fixture,
      http: TestBed.inject(HttpTestingController),
    };
  }

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('rejects empty fields and invalid email without sending', async () => {
    const { component, http } = setup();
    await component.submit();
    expect(component.form.controls.name.touched).toBeTrue();
    component.form.setValue({ ...values, email: 'invalid' });
    await component.submit();
    expect(component.invalid('email')).toBeTrue();
    http.expectNone('/api/contact');
  });

  it('validates email domains and Brazilian WhatsApp numbers', () => {
    const { component } = setup();
    const email = component.form.controls.email;
    const whatsapp = component.form.controls.whatsapp;

    for (const value of [
      'maria@empresa',
      'maria@-empresa.com',
      'maria..silva@empresa.com',
    ]) {
      email.setValue(value);
      expect(email.invalid).withContext(value).toBeTrue();
    }

    for (const value of [
      '(11 99999-1234',
      '(11) 3333-4444',
      '00 99999-1234',
      '11 9999-1234',
    ]) {
      whatsapp.setValue(value);
      expect(whatsapp.invalid).withContext(value).toBeTrue();
    }
  });

  it('does not claim success when the endpoint is not configured', async () => {
    const { component, http } = setup(null);
    component.form.setValue(values);
    await component.submit();
    expect(component.sent()).toBeFalse();
    expect(component.message()).toContain('não foram enviados');
    expect(component.form.getRawValue()).toEqual(values);
    http.expectNone('/api/contact');
  });

  it('locks the form while sending, prevents duplicate requests and resets only after success', async () => {
    const { component, fixture, http } = setup();
    component.form.setValue(values);
    component.selectService('Integrações');
    const sending = component.submit();
    await component.submit();
    const request = http.expectOne('/api/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Maria',
      company: 'Empresa',
      email: values.email,
      whatsapp: '11999991234',
      challenge: 'Integrar o estoque.',
      service: 'Integrações',
    });
    expect(component.pending()).toBeTrue();
    expect(component.form.controls.challenge.disabled).toBeTrue();
    fixture.detectChanges();
    expect(
      (
        fixture.nativeElement.querySelector(
          '#contact-challenge',
        ) as HTMLTextAreaElement
      ).disabled,
    ).toBeTrue();
    expect(
      (
        fixture.nativeElement.querySelector(
          '.service-selection button',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeTrue();
    component.selectService('Software sob medida');
    expect(component.selectedService()).toBe('Integrações');
    request.flush({});
    await sending;
    expect(component.sent()).toBeTrue();
    expect(component.pending()).toBeFalse();
    expect(component.form.controls.challenge.enabled).toBeTrue();
    expect(component.form.controls.name.value).toBe('');
    expect(component.selectedService()).toBeNull();
  });

  it('preserves the message and allows retry after a server failure', async () => {
    const { component, http } = setup();
    component.form.setValue(values);
    const sending = component.submit();
    http
      .expectOne('/api/contact')
      .flush({}, { status: 500, statusText: 'Server error' });
    await sending;
    expect(component.form.getRawValue()).toEqual(values);
    expect(component.sent()).toBeFalse();
    expect(component.pending()).toBeFalse();
    expect(component.form.controls.challenge.enabled).toBeTrue();
    const retry = component.submit();
    http.expectOne('/api/contact').flush({});
    await retry;
    expect(component.sent()).toBeTrue();
  });
});
