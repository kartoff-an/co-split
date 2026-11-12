import privacyPolicy from '@/content/legal/privacy-policy.md?raw';

import { LegalPage } from './LegalPage';

export function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy" content={privacyPolicy} />;
}
