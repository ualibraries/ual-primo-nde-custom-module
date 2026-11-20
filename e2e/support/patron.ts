/** Where auth.setup.ts saves the logged-in patron session (gitignored). */
export const AUTH_FILE = 'playwright/.auth/patron.json';

/** True when a sandbox test patron is configured in .env. */
export function hasPatronCredentials(): boolean {
  return Boolean(process.env['NDE_PATRON_USER'] && process.env['NDE_PATRON_PASSWORD']);
}
