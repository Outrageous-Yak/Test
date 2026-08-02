/** Core game dimensions — landscape reference resolution */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Application version shown in menu and credits */
export const GAME_VERSION = '0.1.0';

/** Minimum touch target size (Apple HIG recommendation) */
export const MIN_TOUCH_TARGET = 48;

/** UI colours — tropical arcade palette */
export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  BACKGROUND_TOP: 0x2d6a9f,
  BACKGROUND_BOTTOM: 0x4ecdc4,
  MANGO: 0xffd700,
  MANGO_ORANGE: 0xff6b35,
  RUBY: 0xe63946,
  LEAF_GREEN: 0x4caf50,
  SKY_BLUE: 0x4ecdc4,
  TEXT_PRIMARY: 0xffffff,
  TEXT_SECONDARY: 0xcccccc,
  BUTTON_NORMAL: 0xff6b35,
  BUTTON_HOVER: 0xff8c5a,
  BUTTON_PRESSED: 0xcc5529,
  BUTTON_SECONDARY: 0x4caf50,
  BUTTON_SECONDARY_HOVER: 0x66bb6a,
  BUTTON_SECONDARY_PRESSED: 0x388e3c,
  PANEL_BG: 0x1e2a3a,
} as const;

/** Scene keys */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  CHARACTER_SELECT: 'CharacterSelectScene',
} as const;

/** Font families */
export const FONTS = {
  PRIMARY: 'Arial, Helvetica, sans-serif',
} as const;

/** UI layout constants */
export const UI = {
  TITLE_FONT_SIZE: 56,
  SUBTITLE_FONT_SIZE: 24,
  BUTTON_FONT_SIZE: 30,
  PANEL_TITLE_FONT_SIZE: 36,
  PANEL_BODY_FONT_SIZE: 22,
  MENU_BUTTON_WIDTH: 300,
  MENU_BUTTON_HEIGHT: 56,
  MENU_BUTTON_GAP: 14,
  BUTTON_PADDING: 16,
} as const;

/** Asset loading paths — add real assets here in future phases */
export const ASSET_PATHS = {
  IMAGES: 'assets/images/',
  AUDIO: 'assets/audio/',
  FONTS: 'assets/fonts/',
} as const;
