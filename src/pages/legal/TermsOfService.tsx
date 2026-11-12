import termsOfService from '@/content/legal/terms-of-service.md?raw';

import { LegalPage } from './LegalPage';

export function TermsOfService() {
  return <LegalPage title="Terms of Service" content={termsOfService} />;
}
