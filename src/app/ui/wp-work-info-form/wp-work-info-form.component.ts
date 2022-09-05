import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { WorkDetails, WPNewStepsData } from 'src/app/data/workpermit.model';

interface PageForm {
  facility: FormControl<string | null>;
  workArea: FormControl<string | null>;
  projectName: FormControl<string | null>;
  projectOwner: FormControl<string | null>;
  staffList: FormControl<string | null>;
  description: FormControl<string | null>;
  dtStart: FormControl<string | null>;
}

@Component({
  selector: 'app-wp-work-info-form',
  templateUrl: './wp-work-info-form.component.html',
  styleUrls: ['./wp-work-info-form.component.scss'],
})
export class WpWorkInfoFormComponent implements OnInit {
  @Input() stepData!: WPNewStepsData;
  @Input() info: WorkDetails = { description: '', dtStart: moment().tz('Europe/Istanbul').toDate() };
  @Output() update: EventEmitter<WorkDetails> = new EventEmitter<WorkDetails>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  form!: FormGroup<PageForm>;
  minDate = moment().tz('Europe/Istanbul').format('YYYY-MM-DD[T]HH:mm');
  maxDate = moment().tz('Europe/Istanbul').add(8, 'hours').format('YYYY-MM-DD[T]HH:mm');

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.createForm();
    this.form.valueChanges.subscribe(() => {
      const dtSelected = moment(this.form.controls.dtStart.value, 'YYYY-MM-DD[T]HH:mm').toDate();
      const dtMin = moment(this.minDate, 'YYYY-MM-DD[T]HH:mm').toDate();
      const dtMax = moment(this.maxDate, 'YYYY-MM-DD[T]HH:mm').toDate();
      if (dtSelected < dtMin || dtSelected > dtMax) {
        this.form.controls.dtStart.setErrors({ invalidDate: true });
      }
      this.info = {
        description: this.form.controls.description.value ?? '',
        dtStart: moment(this.form.controls.dtStart.value, 'YYYY-MM-DD[T]HH:mm').toDate(),
      };
    });
  }

  private createForm(): FormGroup<PageForm> {
    const stafflist = this.stepData.selectedStaff.map((x) => x.name).join(', ');
    const dtNow = moment().tz('Europe/Istanbul').toDate();
    let dtStart = this.info.dtStart ? this.info.dtStart : dtNow;
    if (dtStart < dtNow) {
      dtStart = dtNow;
    }
    const dtStartStr = moment(dtStart).format('YYYY-MM-DD[T]HH:mm');
    return this.formBuilder.group({
      facility: { value: this.stepData.selectedLocation?.facilityName ?? '', disabled: true },
      workArea: { value: this.stepData.selectedLocation?.areaName ?? '', disabled: true },
      projectName: { value: this.stepData.selectedProject?.name ?? '', disabled: true },
      projectOwner: { value: this.stepData.selectedProject?.owner ?? '', disabled: true },
      staffList: { value: stafflist, disabled: true },
      description: [this.info.description ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
      dtStart: [dtStartStr, [Validators.required]],
    });
  }
}
