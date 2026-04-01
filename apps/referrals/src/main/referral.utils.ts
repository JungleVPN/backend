export function generateReferralCode(userId: number): string {
  return Buffer.from(userId.toString()).toString('base64url');
}

export function decodeReferralCode(code: string): number | null {
  try {
    const decoded = Buffer.from(code, 'base64url').toString('utf-8');
    const userId = Number(decoded);
    return Number.isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}
