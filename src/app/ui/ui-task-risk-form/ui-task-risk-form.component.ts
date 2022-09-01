import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  NestleIntensityValues,
  NestleProbabiltyValues,
  NestleRiskValues,
  PladisIntensityValues,
  PladisProbabilityValues,
  PladisRiskValues,
  TaskRiskFormDialogData,
} from 'src/app/data/common.model';
import { TaskRisk } from 'src/app/data/method-doc.model';

interface PageForm {
  Name: FormControl<string>;
  Probability: FormControl<number>;
  Intensity: FormControl<number>;
  ParentTaskId: FormControl<string>;
}

@Component({
  selector: 'app-ui-task-risk-form',
  templateUrl: './ui-task-risk-form.component.html',
  styleUrls: ['./ui-task-risk-form.component.scss'],
})
export class UiTaskRiskFormComponent implements OnInit {
  isEditMode: boolean;
  type: 'risk' | 'precaution';
  taskId: string;
  item: TaskRisk | null;
  form!: FormGroup<PageForm>;
  probabiltyList: Array<{ value: number; label: string; tooltip?: string }>;
  intensityList: Array<{ value: number; label: string; tooltip?: string }>;
  riskValueNames: Array<{ key: string; value: string; color: string }>;
  riskValue: string | undefined;
  riskValueColor: string | undefined;
  parents: TaskRisk[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskRiskFormDialogData,
    public dialogRef: MatDialogRef<UiTaskRiskFormComponent>,
    private formBuilder: FormBuilder,
    private decimalPipe: DecimalPipe
  ) {
    this.isEditMode = data.isEdit ?? false;
    this.type = data.type;
    this.taskId = data.taskId;
    this.item = data.item ?? null;
    this.parents = data.parents ?? [];
    if (data.companyCode === 'PLADIS') {
      this.probabiltyList = PladisProbabilityValues;
      this.intensityList = PladisIntensityValues;
      this.riskValueNames = PladisRiskValues;
    } else {
      this.probabiltyList = NestleProbabiltyValues;
      this.intensityList = NestleIntensityValues;
      this.riskValueNames = NestleRiskValues;
    }
  }

  get title(): string {
    const itemName = this.type === 'risk' ? '«Tehlike / Tehdit / Kaza»' : '«Alınacak Önlem»';
    const actionName = this.isEditMode ? 'Düzenle' : 'Ekle';
    return `${itemName} ${actionName}`;
  }

  get namePlaceholder(): string {
    const itemName = this.type === 'risk' ? 'Tehlike / Tehdit / Kaza' : 'Alınacak Önlem';
    return itemName;
  }

  get parentPlaceholder(): string {
    const itemName = this.type === 'precaution' ? 'Tehlike / Tehdit / Kaza' : '';
    return itemName;
  }

  ngOnInit(): void {
    this.form = this.createForm();

    this.form.valueChanges.subscribe(() => {
      const probability = this.form.controls.Probability.value as number;
      const intensity = this.form.controls.Intensity.value as number;
      if (!probability || !intensity) {
        this.riskValue = undefined;
        this.riskValueColor = undefined;
      } else {
        this.calculateRiskValue(probability, intensity);
      }
    });
  }

  onSave(): void {
    let newItem = {
      Id: '',
      Priority: 0,
      Name: '',
      ParentId: '',
      Rating: {
        Intensity: 0,
        IntensityName: '',
        Probability: 0,
        ProbabilityName: '',
        RiskValue: 0,
        RiskValueName: '',
      },
    } as TaskRisk;

    if (this.item?.Id) {
      newItem = JSON.parse(JSON.stringify(this.item));
    }

    newItem.Name = this.form.controls.Name.value ?? '';
    newItem.ParentId = this.form.controls.ParentTaskId.value ?? '';
    newItem.Rating.Probability = this.form.controls.Probability.value ?? 0;
    newItem.Rating.Intensity = this.form.controls.Intensity.value ?? 0;
    newItem.Rating.RiskValue = newItem.Rating.Intensity * newItem.Rating.Probability;
    newItem.Rating.ProbabilityName = this.getProbabiltyName(newItem.Rating.Probability);
    newItem.Rating.IntensityName = this.getIntensityName(newItem.Rating.Intensity);
    newItem.Rating.RiskValueName = this.riskValue ?? '';
    this.dialogRef.close({ taskId: this.taskId, item: newItem });
  }

  private createForm(): FormGroup<PageForm> {
    const name = this.item?.Name ?? '';
    const probability = this.item?.Rating.Probability ?? 0;
    const intensity = this.item?.Rating.Intensity ?? 0;
    const parentId = this.item?.ParentId ?? '';
    if (probability && intensity) {
      this.calculateRiskValue(probability, intensity);
    }

    const controls = {
      Name: new FormControl<string | null>(name, { validators: [Validators.required, Validators.maxLength(500)] }),
      Probability: new FormControl<number>(probability, { validators: [Validators.required, Validators.min(1)] }),
      Intensity: new FormControl<number>(intensity, { validators: [Validators.required, Validators.min(1)] }),
      ParentTaskId: new FormControl<string | null>(parentId, this.type === 'precaution' ? [Validators.required] : null),
    } as PageForm;

    return this.formBuilder.group(controls);
  }

  private getProbabiltyName(value: number): string {
    return this.probabiltyList.find((x) => x.value === value)?.label ?? value.toString();
  }

  private getIntensityName(value: number): string {
    return this.intensityList.find((x) => x.value === value)?.label ?? value.toString();
  }

  private calculateRiskValue(probability: number, intensity: number): void {
    const key = `${this.decimalPipe.transform(probability, '2.0')}${this.decimalPipe.transform(intensity, '2.0')}`;
    this.riskValue = this.riskValueNames.find((x) => x.key === key)?.value ?? '';
    this.riskValueColor = this.riskValueNames.find((x) => x.key === key)?.color ?? '';
  }
}
