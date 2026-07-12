/**
 * Global configurations for public asset paths and unsplash placeholder media.
 */
export const ASSETS = {
  // Brand Assets
  BRAND_LOGO: '/assets/logo.svg',
  BRAND_FAVICON: '/favicon.ico',
  
  // User Profile Avatars
  USER_AVATAR_MALE: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  USER_AVATAR_FEMALE: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  DEFAULT_AVATAR: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  
  // Asset Image Placeholders for UI cards
  PLACEHOLDER_LAPTOP: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&h=250&q=80',
  PLACEHOLDER_MOBILE: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=250&q=80',
  PLACEHOLDER_DEVICE: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&h=250&q=80',
  
  // System Categories icons lookup
  CATEGORY_ICON_MAP: {
    IT_EQUIPMENT: 'laptop',
    OFFICE_FURNITURE: 'sofa',
    VEHICLES: 'car',
    LAB_GEAR: 'microscope'
  }
};

export default ASSETS;
