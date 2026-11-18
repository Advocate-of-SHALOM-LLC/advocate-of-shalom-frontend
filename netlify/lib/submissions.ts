/**
 * Keeps a copy of each contact-form message in the dashboard's Form
 * Submissions inbox, so messages aren't only in someone's email.
 *
 * Posted to the dashboard's form-submissions function, which stores it in the
 * agency database through the Pipeline. The site holds no database credential:
 * the shared secret can add a submission to this client's inbox and nothing
 * else.
 *
 * Env:
 *   FORMS_INTAKE_URL      the dashboard's form-submissions function
 *   FORMS_INTAKE_SECRET   shared with the dashboard; sent as X-Forms-Secret
 */

export interface StoredField {
  label: string;
  name: string;
  value: string;
}

const INTAKE_TIMEOUT_MS = 8000;

export function storeConfigured(): boolean {
  return Boolean(process.env.FORMS_INTAKE_URL && process.env.FORMS_INTAKE_SECRET);
}

export async function storeSubmission(input: {
  formSlug: string;
  formTitle: string;
  pagePath: string;
  fields: StoredField[];
}): Promise<void> {
  const url = process.env.FORMS_INTAKE_URL;
  const secret = process.env.FORMS_INTAKE_SECRET;
  if (!url || !secret) throw new Error('Submission store is not configured');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forms-Secret': secret },
    body: JSON.stringify({ ...input, files: [] }),
    signal: AbortSignal.timeout(INTAKE_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Dashboard intake returned ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`);
  }
}
