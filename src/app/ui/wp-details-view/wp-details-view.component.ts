import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { StaticValues } from 'src/app/data/common.model';
import { WpStatus } from 'src/app/data/workpermit-main.model';
import { GasMeasurement, QuestionGroup, WorkPermitItem } from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-details-view',
  templateUrl: './wp-details-view.component.html',
  styleUrls: ['./wp-details-view.component.scss'],
})
export class WpDetailsViewComponent implements OnInit {
  @Input() item: WorkPermitItem | undefined;
  @Input() hasTitle: boolean = false;
  @Input() hasNext: boolean = false;
  @Output() next: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  wpStatus = WpStatus;

  get permissions(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.workPermits ?? []).map((x) => x.name).join(', ');
  }

  get staff(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.staff ?? []).map((x) => x.name).join(', ');
  }

  get workTypes(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.workTypes ?? []).map((x) => x.name).join(', ');
  }

  get equipments(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.equipments ?? []).map((x) => x.name).join(', ');
  }

  get ppe(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.ppe ?? []).map((x) => x.name).join(', ');
  }

  get risks(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.risks ?? []).map((x) => x.name).join(', ');
  }

  get questionGroups(): QuestionGroup[] {
    return this.item?.controlQuestions?.questionGroups ?? [];
  }

  get controlNotes(): string {
    const notes = this.item?.controlQuestions?.controlNotes ?? '-';
    if (!notes) return '-';
    return notes;
  }

  get status(): string {
    if (!this.item?.workDescription?.status) {
      return '';
    }

    switch (this.item.workDescription.status.toString()) {
      case WpStatus.ACTIVE.toString():
        return 'AKTİF';
      case WpStatus.PENDING.toString():
        return 'ONAY BEKLİYOR';
      case WpStatus.CLOSED.toString():
        return 'KAPALI';
      case WpStatus.REJECTED.toString():
        return 'ONAYLANMADI';
    }
    return this.item.workDescription.status.toString();
  }

  get owner(): string {
    return this.item?.workDescription?.owner ?? '-';
  }

  get createdAt(): Date | null {
    return this.item?.workDescription?.dtCreate ?? null;
  }

  activeTab: number = 0;
  gasMeasurements!: GasMeasurement[];

  constructor() {}

  ngOnInit(): void {
    if (this.item === undefined) {
      return;
    }
    this.gasMeasurements = this.prepareGasMeasurements(this.item?.gasMeasurements);
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTab = event.index;
  }

  private prepareGasMeasurements(measurements: any[]): GasMeasurement[] {
    return (measurements ?? []).map((x) => {
      const { code, value } = x;
      let label = code;
      let hint = '';
      if (code === StaticValues.GAS_MEASUREMENT_CH4_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_CH4_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_CH4_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_CO_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_CO_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_CO_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_H2S_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_H2S_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_H2S_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_O2_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_O2_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_O2_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_VOC_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_VOC_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_VOC_HINT;
      }
      return {
        code,
        label,
        value,
        hint,
      } as GasMeasurement;
    });
  }
}
