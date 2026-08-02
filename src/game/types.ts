import Phaser from 'phaser';
import { SCENE_KEYS } from './constants';

/** Scene key union type */
export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

/** Button interaction state */
export type ButtonState = 'normal' | 'hover' | 'pressed';

/** Callback for button press events */
export type ButtonCallback = () => void;

/** Phaser scene plugin reference */
export type ScenePlugin = Phaser.Scenes.ScenePlugin;
