/**
 * Currency & Money utilities.
 * Amounts are stored as integer minor units (e.g. 150000 = $1,500.00).
 */
export function formatMinorUnits(minorUnits: number, currency = 'USD'): string {
  const amount = (minorUnits || 0) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMajorUnits(majorUnits: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(majorUnits || 0);
}

export function toMinorUnits(majorUnits: number): number {
  return Math.round((Number(majorUnits) || 0) * 100);
}

export function toMajorUnits(minorUnits: number): number {
  return (minorUnits || 0) / 100;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateFreelancerProfileCompletion(profile: any): number {
  if (!profile) return 0;
  const fields = [
    Boolean(profile.headline),
    Boolean(profile.biography && profile.biography.length >= 20),
    Boolean(profile.skills && profile.skills.length > 0),
    Boolean(profile.experienceLevel),
    Boolean(profile.hourlyRate > 0),
    Boolean(profile.location),
    Boolean(profile.portfolioUrl || profile.githubUrl || profile.linkedinUrl),
    Boolean(profile.profileImageUrl),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function calculateCompanyProfileCompletion(profile: any): number {
  if (!profile) return 0;
  const fields = [
    Boolean(profile.companyName),
    Boolean(profile.industry),
    Boolean(profile.description && profile.description.length >= 20),
    Boolean(profile.websiteUrl),
    Boolean(profile.location),
    Boolean(profile.companySize),
    Boolean(profile.contactName),
    Boolean(profile.publicEmail),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
