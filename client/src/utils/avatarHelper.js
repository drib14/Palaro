export const getAvatarUrl = (user) => {
  if (user?.avatar && user.avatar !== 'https://bit.ly/broken-link') {
    return user.avatar;
  }
  // Fallback to generated profile images based on gender
  if (user?.gender === 'female') {
    return '/default_female_avatar.png';
  }
  return '/default_male_avatar.png';
};
