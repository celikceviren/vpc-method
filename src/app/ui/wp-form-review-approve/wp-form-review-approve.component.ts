import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  CodeValueItem,
  ControlQuestions,
  Project,
  WorkAreaInfo,
  WpFormStep,
  WpFormStepData,
} from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-form-review-approve',
  templateUrl: './wp-form-review-approve.component.html',
  styleUrls: ['./wp-form-review-approve.component.scss'],
})
export class WpFormReviewApproveComponent {
  @Input() values!: WpFormStepData;

  @Output() approve: EventEmitter<void> = new EventEmitter<void>();
  @Output() goBack: EventEmitter<WpFormStep> = new EventEmitter<WpFormStep>();

  steps = WpFormStep;

  constructor() {}

  get location(): WorkAreaInfo | undefined {
    return this.values?.selectedLocation;
  }

  get contractor(): CodeValueItem | undefined {
    return this.values?.wpItem?.contractor;
  }

  get staffList(): CodeValueItem[] | undefined {
    return this.values?.wpItem?.staff;
  }

  get questions(): ControlQuestions | undefined {
    return this.values?.controlQuestions;
  }

  get dtStart(): Date | undefined {
    return this.values?.selectedWp?.dtStart;
  }

  get dtEnd(): Date | undefined {
    return this.values?.selectedWp?.dtEnd;
  }
}
