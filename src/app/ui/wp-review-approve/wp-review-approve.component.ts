import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CodeValueItem,
  ControlQuestions,
  GasMeasurement,
  Project,
  WorkAreaInfo,
  WorkDetails,
  WPNewStep,
  WPNewStepsData,
} from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-review-approve',
  templateUrl: './wp-review-approve.component.html',
  styleUrls: ['./wp-review-approve.component.scss'],
})
export class WpReviewApproveComponent {
  @Input() values!: WPNewStepsData;

  @Output() appreove: EventEmitter<void> = new EventEmitter<void>();
  @Output() goBack: EventEmitter<WPNewStep> = new EventEmitter<WPNewStep>();

  steps = WPNewStep;

  constructor() {}

  get location(): WorkAreaInfo | undefined {
    return this.values?.selectedLocation;
  }

  get project(): Project | undefined {
    return this.values?.selectedProject;
  }

  get contractor(): CodeValueItem | undefined {
    return this.values?.selectedContractor;
  }

  get staffList(): CodeValueItem[] | undefined {
    return this.values?.selectedStaff;
  }

  get workDescription(): WorkDetails | undefined {
    return this.values?.workDescription;
  }

  get workTypes(): CodeValueItem[] | undefined {
    return this.values?.selectedWorkTypes;
  }

  get risks(): CodeValueItem[] | undefined {
    return this.values?.selectedRisks;
  }

  get equipments(): CodeValueItem[] | undefined {
    return this.values?.selectedEquipments;
  }

  get ppe(): CodeValueItem[] | undefined {
    return this.values?.selectedPpe;
  }

  get permissions(): CodeValueItem[] | undefined {
    return this.values?.selectedExtraPermissions;
  }

  get questions(): ControlQuestions | undefined {
    return this.values?.controlQuestions;
  }

  get gasMeasurements(): GasMeasurement[] | undefined {
    return this.values?.gasMeasurements;
  }
}
