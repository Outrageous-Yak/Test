/** Core game dimensions — landscape reference resolution */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Minimum touch target size (Apple HIG recommendation) */
export const MIN_TOUCH_TARGET = 48;

/** UI colours */
export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  MANGO: 0xff6b35,
  RUBY: 0xe63946,
  TEXT_PRIMARY: 0xffffff,
  TEXT_SECONDARY: 0xcccccc,
  BUTTON_NORMAL: 0xff6b35,
  BUTTON_HOVER: 0xff8c5a,
  BUTTON_PRESSED: 0xcc5529,
} as const;

/** Scene keys */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
} as const;

/** Font families */
export const FONTS = {
  PRIMARY: 'Arial, Helvetica, sans-serif',
} as const;

/** UI layout constants */
export const UI = {
  TITLE_FONT_SIZE: 64,
  SUBTITLE_FONT_SIZE: 28,
  BUTTON_FONT_SIZE: 36,
  BUTTON_WIDTH: 280,
  BUTTON_HEIGHT: 72,
  BUTTON_PADDING: 16,
} as const;

/** Asset loading paths — add real assets here in future phases */
export const ASSET_PATHS = {
  IMAGES: 'assets/images/',
  AUDIO: 'assets/audio/',
  FONTS: 'assets/fonts/',
} as const;
