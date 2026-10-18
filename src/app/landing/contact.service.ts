import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

/** Configure a JSON POST endpoint in app.config.ts when the contact API is available. */
export const CONTACT_ENDPOINT = new InjectionToken<string | null>(
  'CONTACT_ENDPOINT',
  {
    providedIn: 'root',
    factory: () => null,
  },
);

export interface ContactRequest {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  challenge: string;
  service: string | null;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  readonly endpoint = inject(CONTACT_ENDPOINT);

  send(request: ContactRequest): Observable<unknown> {
    if (!this.endpoint) throw new Error('Contact endpoint is not configured.');
    return this.http.post(this.endpoint, request).pipe(timeout(15000));
  }
}
