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

  it('does not claim success when the endpoint is not configured', async () => {
    const { component, http } = setup(null);
    component.form.setValue(values);
    await component.submit();
    expect(component.sent()).toBeFalse();
    expect(component.message()).toContain('não foram enviados');
    expect(component.form.getRawValue()).toEqual(values);
    http.expectNone('/api/contact');
  });

  it('normalizes the payload, prevents duplicate requests and resets only after success', async () => {
    const { component, http } = setup();
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
    request.flush({});
    await sending;
    expect(component.sent()).toBeTrue();
    expect(component.pending()).toBeFalse();
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
    const retry = component.submit();
    http.expectOne('/api/contact').flush({});
    await retry;
    expect(component.sent()).toBeTrue();
  });
});
