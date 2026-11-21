import { getReviews } from './dataService';

export function getAverageReviewScore(): number | null {
  const scores = getReviews()
    .map((review) => review.review_score)
    .filter((score) => Number.isInteger(score) && score >= 1 && score <= 5);

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return total / scores.length;
}