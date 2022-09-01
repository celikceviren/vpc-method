import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class SplashScreenService {
  splashScreenEl: any;
  player: AnimationPlayer | undefined;

  constructor(private _animationBuilder: AnimationBuilder, @Inject(DOCUMENT) private _document: any) {
    this._init();
  }

  private _init(): void {
    this.splashScreenEl = this._document.body.querySelector('#epaw-splash-screen');
  }

  show(): void {
    this.player = this._animationBuilder
      .build([
        style({
          opacity: '0',
          zIndex: '99999',
        }),
        animate('400ms ease', style({ opacity: '1' })),
      ])
      .create(this.splashScreenEl);

    setTimeout(() => {
      if (this.player) {
        this.player.play();
      }
    }, 0);
  }

  hide(): void {
    this.player = this._animationBuilder
      .build([
        style({ opacity: '1' }),
        animate(
          '400ms ease',
          style({
            opacity: '0',
            zIndex: '-10',
          })
        ),
      ])
      .create(this.splashScreenEl);

    setTimeout(() => {
      if (this.player) {
        this.player.play();
      }
    }, 0);
  }
}
