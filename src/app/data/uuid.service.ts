import { Injectable } from '@angular/core';

@Injectable()
export class UUIDService {
  private generatedUuuid: string[] = [];
  constructor() {}

  UUID(): string {
    let distinct = false;
    let generatedUuid = this.getUniqueId(4);
    let checkCount = 0;
    while (!distinct && checkCount <= 50) {
      let uuid = this.getUniqueId(4);
      if (!this.generatedUuuid.find((x) => x === uuid)) {
        distinct = true;
        generatedUuid = uuid;
        this.generatedUuuid.push(generatedUuid);
      }
      checkCount++;
    }

    return generatedUuid;
  }

  private getUniqueId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }
}
