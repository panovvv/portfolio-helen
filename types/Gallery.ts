export type LightboxOptions = {
  touchNavigation?: boolean;
  loop?: boolean;
  openEffect?: string;
  closeEffect?: string;
  slideEffect?: string;
  closeButton?: boolean;
  closeOnOutsideClick?: boolean;
  zoomable?: boolean;
  preload?: boolean;
};

export type GalleryDescriptionPosition = "bottom" | "top" | "left" | "right";

export type GalleryImage = {
  href: string;
  title?: string;
  description?: string;
  descPosition?: GalleryDescriptionPosition;
  alt?: string;
};
