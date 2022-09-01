import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractorFormDialogData } from 'src/app/data/common.model';
import { SubContractorItem } from 'src/app/data/method-doc.model';

interface PageForm {
  Name: FormControl<string>;
  TaskSteps: FormControl<string>;
}

@Component({
  selector: 'app-ui-contractor-form',
  templateUrl: './ui-contractor-form.component.html',
  styleUrls: ['./ui-contractor-form.component.scss'],
})
export class UiContractorFormComponent implements OnInit {
  isEditMode: boolean;
  item: SubContractorItem | null;
  form!: FormGroup<PageForm>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ContractorFormDialogData,
    public dialogRef: MatDialogRef<UiContractorFormComponent>,
    private formBuilder: FormBuilder
  ) {
    this.isEditMode = data.isEdit ?? false;
    this.item = data.item ?? null;
  }

  get title(): string {
    if (this.isEditMode) {
      return 'Alt Yüklenici Düzenle';
    }

    return 'Yeni Alt Yüklenici Ekle';
  }

  ngOnInit(): void {
    this.form = this.createForm();
  }

  onSave(): void {
    if (!this.item?.Id) {
      this.item = {
        Id: '',
        Priority: 0,
        Name: '',
        TaskSteps: '',
      };
    }

    this.item.Name = this.form.controls.Name.value ?? '';
    this.item.TaskSteps = this.form.controls.TaskSteps.value ?? '';
    this.dialogRef.close(this.item);
  }

  private createForm(): FormGroup<PageForm> {
    const name = this.item?.Name ?? '';
    const taskSteps = this.item?.TaskSteps ?? '';

    const fg = {
      Name: new FormControl<string | null>(name, { validators: [Validators.required, Validators.maxLength(200)] }),
      TaskSteps: new FormControl<string | null>(taskSteps, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
    } as PageForm;
    return this.formBuilder.group(fg);
  }
}
