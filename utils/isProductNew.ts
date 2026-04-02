export const isProductNew = (createdAt?: string | number | Date | null) => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffInMs = now.getTime() - createdDate.getTime();
  
  // Convert to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  // Return true if the product is less than 7 days old
  return diffInDays <= 7;
};
