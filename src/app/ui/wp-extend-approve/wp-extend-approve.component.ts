import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-wp-extend-approve',
  templateUrl: './wp-extend-approve.component.html',
  styleUrls: ['./wp-extend-approve.component.scss'],
})
export class WpExtendApproveComponent {
  @Input() dtEnd: Date | undefined;
  @Input() extension: number = 2;
  @Output() approve: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  get extensionMsg(): string {
    if (!this.dtEnd || !this.extension) {
      return '';
    }

    const newDateStr = moment(this.dtEnd).add(this.extension, 'hours').format('DD.MM.YYYY HH:mm');

    const msg = `Çalışmanın süresi <b>${this.extension}</b> saat uzatılacaktır.<br/> Onayınız sonrası çalışmanın bitiş zamanı <b>${newDateStr}</b> olarak güncellenecektir.`;
    return msg;
  }
}
