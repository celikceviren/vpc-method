import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CodeValueSelectItem } from 'src/app/data/common.model';
import { CodeValueItem, MethodDoc } from 'src/app/data/method-doc.model';

interface PageForm {
  ContractorOfficial: FormControl<string | null>;
  ContractorOfficialPhone: FormControl<string | null>;
  WorkDefinition: FormControl<string | null>;
  WorkAreas: FormControl<CodeValueItem[] | null>;
}

@Component({
  selector: 'app-ui-work-info',
  templateUrl: './ui-work-info.component.html',
  styleUrls: ['./ui-work-info.component.scss'],
})
export class UiWorkInfoComponent implements OnInit {
  private _unsubscribeAll = new Subject<void>();

  @Input() data: MethodDoc | null = null;
  @Output() dataChange: EventEmitter<MethodDoc | null> = new EventEmitter<MethodDoc | null>();
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();

  dtStart: Date | undefined;
  form!: FormGroup<PageForm>;
  workAreasList: CodeValueSelectItem[] = [];

  constructor(private formBuilder: FormBuilder) {}

  get selectedWorkAreaName(): string {
    if (this.form?.controls.WorkAreas.value !== null && (this.form?.controls.WorkAreas.value ?? []).length) {
      const values = this.form.controls.WorkAreas.value;
      const val = values.length === 1 ? this.form.controls.WorkAreas.value[0].Value : `${values.length} Alan seçildi`;
      return val;
    }
    return '';
  }

  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    this.workAreasList =
      (this.data.RefData.WorkAreas ?? []).map((x: CodeValueItem) => {
        const isChecked = (this.data?.WorkAreas ?? []).findIndex((y) => y.Code === x.Code) >= 0;
        return { item: x, selected: isChecked };
      }) ?? [];

    this.form = this.createForm();

    this.form.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      if (this.data) {
        this.data.ContractorOfficial = this.form.controls.ContractorOfficial.value ?? '';
        this.data.ContractorOfficialPhone = this.form.controls.ContractorOfficialPhone.value ?? '';
        this.data.WorkDefinition = this.form.controls.WorkDefinition.value ?? '';
        this.data.WorkAreas = this.form.controls.WorkAreas.value ?? [];
      }
      this.dataChange.emit(this.data);
      this.valid.emit(this.form.valid);
    });

    setTimeout(() => {
      const patchValues = {
        ContractorOfficial: this.data?.ContractorOfficial ?? '',
        ContractorOfficialPhone: this.data?.ContractorOfficialPhone ?? '',
        WorkDefinition: this.data?.WorkDefinition ?? '',
        WorkAreas: this.workAreasList.filter((x) => x.selected).map((x) => x.item),
      };
      this.form.patchValue(patchValues);
    }, 0);
  }

  private createForm(): FormGroup<any> {
    return this.formBuilder.group({
      ContractorOfficial: [null, Validators.required],
      ContractorOfficialPhone: [null, Validators.required],
      WorkDefinition: [null, Validators.required],
      WorkAreas: [null, [Validators.required]],
    });
  }
}
