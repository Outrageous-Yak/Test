import Phaser from 'phaser';
import { SCENE_KEYS, UI, FONTS, GAME_VERSION } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { MenuPanel } from '../ui/MenuPanel';
import { GameState } from '../state/GameState';
import type { ControlStyle } from '../state/gameStateTypes';

/**
 * Main Menu Scene — polished touch-friendly menu with modal panels.
 */
export class MainMenuScene extends Phaser.Scene {
  private menuButtons: TouchButtonHandle[] = [];
  private panels: MenuPanel[] = [];
  private settingsToggleButtons: TouchButtonHandle[] = [];
  private resetCareerButton?: TouchButtonHandle;
  private resetConfirmYesButton?: TouchButtonHandle;
  private resetConfirmNoButton?: TouchButtonHandle;
  private resetConfirmText?: Phaser.GameObjects.Text;
  private isTransitioning = false;
  private keyboardEnabled = true;

  constructor() {
    super({ key: SCENE_KEYS.MAIN_MENU });
  }

  create(): void {
    this.isTransitioning = false;
    this.menuButtons = [];
    this.panels = [];
    this.settingsToggleButtons = [];

    this.drawBackground();
    this.createTitle();
    this.createMenuButtons();
    this.createPanels();
    this.createVersionLabel();
    this.setupKeyboardInput();
  }

  shutdown(): void {
    this.menuButtons.forEach((btn) => btn.destroy());
    this.settingsToggleButtons.forEach((btn) => btn.destroy());
    this.resetCareerButton?.destroy();
    this.resetConfirmYesButton?.destroy();
    this.resetConfirmNoButton?.destroy();
    this.resetConfirmText?.destroy();
    this.panels.forEach((panel) => panel.destroy());
    this.input.keyboard?.off('keydown-ENTER', this.onEnterKey, this);
  }

  private drawBackground(): void {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#000000');
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
  }

  private createTitle(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height * 0.14, 'MANGO & RUBY RACING', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }

  private createMenuButtons(): void {
    const { width, height } = this.cameras.main;
    const labels = ['PLAY', 'GARAGE', 'CAREER', 'HOW TO PLAY', 'SETTINGS', 'CREDITS'];
    const startY = height * 0.3;
    const gap = UI.MENU_BUTTON_HEIGHT + UI.MENU_BUTTON_GAP;

    labels.forEach((label, index) => {
      const button = createTouchButton(this, {
        x: width / 2,
        y: startY + index * gap,
        label,
        width: UI.MENU_BUTTON_WIDTH,
        height: UI.MENU_BUTTON_HEIGHT,
        fontSize: UI.BUTTON_FONT_SIZE,
        onPress: () => this.onMenuButtonPressed(label),
      });
      this.menuButtons.push(button);
    });
  }

  private createVersionLabel(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height - 28, `Version ${GAME_VERSION}`, {
        fontFamily: FONTS.PRIMARY,
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(0.7);
  }

  private createPanels(): void {
    this.createGaragePanel();
    this.createHowToPlayPanel();
    this.createSettingsPanel();
    this.createCreditsPanel();
  }

  private createGaragePanel(): void {
    const panel = new MenuPanel(this, {
      title: 'GARAGE',
      onClose: () => this.onPanelClosed(),
    });

    const body = this.add
      .text(0, 0, 'Cars and customisation arrive in a later phase.', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.PANEL_BODY_FONT_SIZE}px`,
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);

    panel.getContentContainer().add(body);
    this.panels.push(panel);
  }

  private createHowToPlayPanel(): void {
    const panel = new MenuPanel(this, {
      title: 'HOW TO PLAY',
      panelHeight: 520,
      onClose: () => this.onPanelClosed(),
    });

    const instructions = [
      'Steer using the on-screen controls.',
      'Use Brake to slow down and drift.',
      'Use Boost when the boost meter is ready.',
      'Complete every lap and finish first.',
    ].join('\n\n');

    const body = this.add
      .text(0, -10, instructions, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.PANEL_BODY_FONT_SIZE}px`,
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);

    panel.getContentContainer().add(body);
    this.panels.push(panel);
  }

  private createSettingsPanel(): void {
    const panel = new MenuPanel(this, {
      title: 'SETTINGS',
      panelHeight: 620,
      onClose: () => this.onSettingsPanelClosed(),
    });

    const content = panel.getContentContainer();
    const rows = [
      { key: 'musicEnabled' as const, label: 'Music' },
      { key: 'soundEnabled' as const, label: 'Sound Effects' },
      { key: 'vibrationEnabled' as const, label: 'Vibration' },
    ];

    rows.forEach((row, index) => {
      const y = -90 + index * 70;
      const settings = GameState.settings;

      const label = this.add
        .text(-180, y, row.label, {
          fontFamily: FONTS.PRIMARY,
          fontSize: '22px',
          color: '#ffffff',
        })
        .setOrigin(0, 0.5);

      const toggle = createTouchButton(this, {
        x: 120,
        y,
        label: settings[row.key] ? 'On' : 'Off',
        width: 140,
        height: 48,
        fontSize: 22,
        onPress: () => {
          const current = GameState.settings[row.key];
          GameState.updateSettings({ [row.key]: !current });
          toggle.setLabel(GameState.settings[row.key] ? 'On' : 'Off');
        },
      });

      content.add(label);
      content.add(toggle.container);
      this.settingsToggleButtons.push(toggle);
    });

    const controlLabel = this.add
      .text(-180, 130, 'Control Style', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);

    const controlToggle = createTouchButton(this, {
      x: 120,
      y: 130,
      label: this.formatControlStyle(GameState.settings.controlStyle),
      width: 180,
      height: 48,
      fontSize: 22,
      onPress: () => {
        const next: ControlStyle =
          GameState.settings.controlStyle === 'buttons' ? 'tilt' : 'buttons';
        GameState.updateSettings({ controlStyle: next });
        controlToggle.setLabel(this.formatControlStyle(next));
      },
    });

    content.add(controlLabel);
    content.add(controlToggle.container);
    this.settingsToggleButtons.push(controlToggle);

    this.resetCareerButton = createTouchButton(this, {
      x: 0,
      y: 210,
      label: 'Reset Career',
      width: 280,
      height: 48,
      fontSize: 20,
      onPress: () => this.beginResetCareerConfirm(),
    });

    this.resetConfirmText = this.add
      .text(0, 170, 'Reset all career progress?\nThis cannot be undone.', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '18px',
        color: '#ffaaaa',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.resetConfirmYesButton = createTouchButton(this, {
      x: -90,
      y: 250,
      label: 'Yes',
      width: 140,
      height: 44,
      fontSize: 20,
      onPress: () => this.confirmResetCareer(),
    });

    this.resetConfirmNoButton = createTouchButton(this, {
      x: 90,
      y: 250,
      label: 'No',
      width: 140,
      height: 44,
      fontSize: 20,
      onPress: () => this.cancelResetCareerConfirm(),
    });

    this.resetConfirmYesButton.container.setVisible(false);
    this.resetConfirmNoButton.container.setVisible(false);

    content.add(this.resetCareerButton.container);
    content.add(this.resetConfirmText);
    content.add(this.resetConfirmYesButton.container);
    content.add(this.resetConfirmNoButton.container);

    this.panels.push(panel);
  }

  private beginResetCareerConfirm(): void {
    this.resetCareerButton?.container.setVisible(false);
    this.resetConfirmText?.setVisible(true);
    this.resetConfirmYesButton?.container.setVisible(true);
    this.resetConfirmNoButton?.container.setVisible(true);
  }

  private cancelResetCareerConfirm(): void {
    this.resetCareerButton?.container.setVisible(true);
    this.resetConfirmText?.setVisible(false);
    this.resetConfirmYesButton?.container.setVisible(false);
    this.resetConfirmNoButton?.container.setVisible(false);
  }

  private confirmResetCareer(): void {
    GameState.resetCareer();
    this.cancelResetCareerConfirm();
    this.panels[2]?.close();
    this.onPanelClosed();
  }

  private onSettingsPanelClosed(): void {
    this.cancelResetCareerConfirm();
    this.onPanelClosed();
  }

  private createCreditsPanel(): void {
    const panel = new MenuPanel(this, {
      title: 'CREDITS',
      onClose: () => this.onPanelClosed(),
    });

    const body = this.add
      .text(
        0,
        -10,
        `MANGO & RUBY RACING\n\nCreated by Outrageous Yak\n\nBuilt with Phaser and TypeScript\n\nVersion ${GAME_VERSION}`,
        {
          fontFamily: FONTS.PRIMARY,
          fontSize: `${UI.PANEL_BODY_FONT_SIZE}px`,
          color: '#ffffff',
          align: 'center',
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5);

    panel.getContentContainer().add(body);
    this.panels.push(panel);
  }

  private formatControlStyle(style: ControlStyle): string {
    return style === 'buttons' ? 'Buttons' : 'Tilt';
  }

  private onMenuButtonPressed(label: string): void {
    if (this.isAnyPanelOpen() || this.isTransitioning) return;

    switch (label) {
      case 'PLAY':
        this.goToCharacterSelect();
        break;
      case 'GARAGE':
        this.openPanel(0);
        break;
      case 'CAREER':
        this.goToCareer();
        break;
      case 'HOW TO PLAY':
        this.openPanel(1);
        break;
      case 'SETTINGS':
        this.openPanel(2);
        break;
      case 'CREDITS':
        this.openPanel(3);
        break;
    }
  }

  private openPanel(index: number): void {
    this.setMenuButtonsEnabled(false);
    this.keyboardEnabled = false;
    this.panels[index].openPanel();
  }

  private onPanelClosed(): void {
    this.setMenuButtonsEnabled(true);
    this.keyboardEnabled = true;
  }

  private isAnyPanelOpen(): boolean {
    return this.panels.some((panel) => panel.isOpen());
  }

  private setMenuButtonsEnabled(enabled: boolean): void {
    this.menuButtons.forEach((button) => button.setEnabled(enabled));
  }

  private goToCharacterSelect(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.setMenuButtonsEnabled(false);
    this.scene.start(SCENE_KEYS.CHARACTER_SELECT);
  }

  private goToCareer(): void {
    if (this.isTransitioning || this.isAnyPanelOpen()) return;
    this.isTransitioning = true;
    this.setMenuButtonsEnabled(false);
    this.scene.start(SCENE_KEYS.CAREER);
  }

  private setupKeyboardInput(): void {
    if (!this.input.keyboard) return;
    this.input.keyboard.on('keydown-ENTER', this.onEnterKey, this);
  }

  private readonly onEnterKey = (): void => {
    if (!this.keyboardEnabled || this.isAnyPanelOpen() || this.isTransitioning) return;
    this.goToCharacterSelect();
  };
}
