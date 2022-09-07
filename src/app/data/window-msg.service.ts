import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WindowMsgService {
  private sourceOrigin: string;
  private allowedSourceOrigins: string[];

  constructor() {
    this.sourceOrigin = '';
    this.allowedSourceOrigins = environment.sourceOrigins;
  }

  public isValidSourceOrigin(event: any): boolean {
    const origin = event?.origin ?? '';

    if (this.sourceOrigin === '*') {
      const isValid = this.allowedSourceOrigins.some((x) => origin.startsWith(this.sourceOrigin));
      if (isValid) {
        this.sourceOrigin = origin;
      }
      return isValid;
    }

    return origin.startsWith(this.sourceOrigin);
  }

  public getSourceOrigin(path?: string): string {
    if (!this.sourceOrigin) {
      return '*';
    }
    return `${this.sourceOrigin}${path}`;
  }

  public postMsg(action: string, data?: any): void {
    parent.postMessage(
      {
        action,
        data,
      },
      '*'
    );
  }
}
