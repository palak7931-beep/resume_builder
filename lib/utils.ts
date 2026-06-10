import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeSafeFilename(value: string, fallback = 'resume-shapeshifter', maxLength = 50) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > maxLength ? normalized.slice(0, maxLength).replace(/-+$/g, '') : normalized;
}
