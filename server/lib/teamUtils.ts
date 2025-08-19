/**
 * Utility functions for team management
 */

/**
 * Generate a unique invite code for teams
 * @returns A 6-character alphanumeric invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Removed similar chars: I, L, O, 0, 1
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate invite code format
 * @param code The invite code to validate
 * @returns True if the code matches expected format
 */
export function isValidInviteCode(code: string): boolean {
  return /^[A-Z2-9]{6}$/.test(code);
}