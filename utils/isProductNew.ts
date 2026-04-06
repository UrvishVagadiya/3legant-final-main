export const isProductNew = (createdAt?: string | number | Date | null) => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return false;
  const now = new Date();

  // Calculate difference in milliseconds
  const diffInMs = now.getTime() - createdDate.getTime();

  // Convert to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // New only for the first 7 days after creation.
  return diffInDays >= 0 && diffInDays < 7;
};
