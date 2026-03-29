import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  public create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x120f14);
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0x1d1820, 0.94).setStrokeStyle(2, 0xff6b35, 0.8);
    this.add.rectangle(width / 2, height * 0.24, width - 180, 90, 0xf94144, 0.18).setAngle(-3);
    this.add.rectangle(width / 2, height * 0.74, width - 220, 74, 0xe9c46a, 0.12).setAngle(2);

    this.add
      .text(width / 2, 120, 'A.B. COLLECTIVE', {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '32px',
        color: '#f5efe7',
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 212, 'NEON NOCTURNE', {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '88px',
        color: '#ff6b35',
        stroke: '#140f16',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setRotation(-0.02);

    this.add
      .text(
        width / 2,
        332,
        'Push through three hostile blocks, build Hype, and shut down the promoter holding the venue hostage.',
        {
          fontFamily: 'Trebuchet MS, Verdana, sans-serif',
          fontSize: '24px',
          color: '#f5efe7',
          align: 'center',
          wordWrap: { width: 880 },
        },
      )
      .setOrigin(0.5);

    const startButton = this.add
      .text(width / 2, 470, 'START THE STRIP', {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '34px',
        color: '#140f16',
        backgroundColor: '#e9c46a',
        padding: { left: 28, right: 28, top: 16, bottom: 16 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const footer = this.add
      .text(width / 2, 602, 'Controls: Move A/D/W/S  |  J light  |  K heavy  |  Space flying kick  |  L crowd surge  |  Shift dodge', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '20px',
        color: '#f5efe7',
        align: 'center',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startButton, footer],
      alpha: { from: 0.6, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const begin = () => {
      this.scene.start('battle');
    };

    startButton.on('pointerdown', begin);
    this.input.keyboard?.once('keydown-ENTER', begin);
    this.input.keyboard?.once('keydown-SPACE', begin);
  }
}
