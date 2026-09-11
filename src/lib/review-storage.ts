const DISMISSED_REVIEWS_KEY = 'foodhub_dismissed_reviews';
const COMPLETED_REVIEWS_KEY = 'foodhub_completed_reviews';

function getStoredArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err);
    return [];
  }
}

function addToStoredArray(key: string, orderId: string): void {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const existing = getStoredArray(key);
    if (!existing.includes(orderId)) {
      existing.push(orderId);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch (err) {
    console.error(`Failed to update localStorage key "${key}":`, err);
  }
}

export function getDismissedReviewOrderIds(): string[] {
  return getStoredArray(DISMISSED_REVIEWS_KEY);
}

export function isReviewDismissed(orderId: string): boolean {
  if (!orderId) return false;
  return getDismissedReviewOrderIds().includes(orderId);
}

export function markReviewAsDismissed(orderId: string): void {
  addToStoredArray(DISMISSED_REVIEWS_KEY, orderId);
}

export function getCompletedReviewOrderIds(): string[] {
  return getStoredArray(COMPLETED_REVIEWS_KEY);
}

export function isReviewCompleted(orderId: string): boolean {
  if (!orderId) return false;
  return getCompletedReviewOrderIds().includes(orderId);
}

export function markReviewAsCompleted(orderId: string): void {
  addToStoredArray(COMPLETED_REVIEWS_KEY, orderId);
}

export function isReviewDismissedOrCompleted(orderId: string): boolean {
  if (!orderId) return false;
  return isReviewDismissed(orderId) || isReviewCompleted(orderId);
}
