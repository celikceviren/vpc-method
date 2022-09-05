import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StaticValues } from 'src/app/data/common.model';
import { GasMeasurement } from 'src/app/data/workpermit.model';

interface PageForm {
  gasO2: FormControl<string | null>;
  gasCH4: FormControl<string | null>;
  gasCO: FormControl<string | null>;
  gasH2S: FormControl<string | null>;
  gasVOC: FormControl<string | null>;
}

@Component({
  selector: 'app-wp-gas-measurement-form',
  templateUrl: './wp-gas-measurement-form.component.html',
  styleUrls: ['./wp-gas-measurement-form.component.scss'],
})
export class WpGasMeasurementFormComponent implements OnInit {
  @Input() gasMeasurements!: GasMeasurement[];
  @Output() update: EventEmitter<GasMeasurement[]> = new EventEmitter<GasMeasurement[]>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  form!: FormGroup<PageForm>;
  gasO2!: GasMeasurement | undefined;
  gasCH4!: GasMeasurement | undefined;
  gasCO!: GasMeasurement | undefined;
  gasH2S!: GasMeasurement | undefined;
  gasVOC!: GasMeasurement | undefined;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    if (!this.gasMeasurements) {
      return;
    }
    this.gasO2 = this.gasMeasurements.find((x) => x.code === StaticValues.GAS_MEASUREMENT_O2_CODE);
    this.gasCH4 = this.gasMeasurements.find((x) => x.code === StaticValues.GAS_MEASUREMENT_CH4_CODE);
    this.gasCO = this.gasMeasurements.find((x) => x.code === StaticValues.GAS_MEASUREMENT_CO_CODE);
    this.gasH2S = this.gasMeasurements.find((x) => x.code === StaticValues.GAS_MEASUREMENT_H2S_CODE);
    this.gasVOC = this.gasMeasurements.find((x) => x.code === StaticValues.GAS_MEASUREMENT_VOC_CODE);
    this.form = this.createForm();

    this.form.valueChanges.subscribe(() => {
      if (this.gasO2) {
        this.gasO2.value = this.form.controls.gasO2.value ?? '';
      }

      if (this.gasCH4) {
        this.gasCH4.value = this.form.controls.gasCH4.value ?? '';
      }

      if (this.gasCO) {
        this.gasCO.value = this.form.controls.gasCO.value ?? '';
      }

      if (this.gasH2S) {
        this.gasH2S.value = this.form.controls.gasH2S.value ?? '';
      }

      if (this.gasVOC) {
        this.gasVOC.value = this.form.controls.gasVOC.value ?? '';
      }
    });
  }

  private createForm(): FormGroup<PageForm> {
    return this.formBuilder.group({
      gasO2: [this.gasO2?.value ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
      gasCH4: [this.gasCH4?.value ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
      gasCO: [this.gasCO?.value ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
      gasH2S: [this.gasH2S?.value ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
      gasVOC: [this.gasVOC?.value ?? '', Validators.compose([Validators.required, Validators.maxLength(250)])],
    });
  }
}
