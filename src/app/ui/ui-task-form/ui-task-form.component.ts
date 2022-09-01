import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CodeValueSelectItem, TaskFormDialogData } from 'src/app/data/common.model';
import { CodeValueItem, Task } from 'src/app/data/method-doc.model';

interface PageForm {
  Name: FormControl<string>;
  NoRequiredSkills: FormControl<boolean>;
  RequiredSkills: FormControl<CodeValueSelectItem[]>;
  NoWorkPermits: FormControl<boolean>;
  WorkPermits: FormControl<CodeValueSelectItem[]>;
}

@Component({
  selector: 'app-ui-task-form',
  templateUrl: './ui-task-form.component.html',
  styleUrls: ['./ui-task-form.component.scss'],
})
export class UiTaskFormComponent implements OnInit {
  workPermits: CodeValueItem[];
  workPermitSelectList: CodeValueSelectItem[] = [];
  skills: CodeValueItem[];
  skillsSelectList: CodeValueSelectItem[] = [];
  task: Task | null;
  isEditMode: boolean;
  form!: FormGroup<PageForm>;
  isValid: boolean | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskFormDialogData,
    public dialogRef: MatDialogRef<UiTaskFormComponent>,
    private formBuilder: FormBuilder
  ) {
    this.isEditMode = data.isEdit ?? false;
    this.task = data.task ?? null;
    this.skills = data.skills ?? [];
    this.workPermits = data.workPermits ?? [];
  }

  get title(): string {
    if (this.isEditMode) {
      return 'İş Adımını Düzenle';
    }

    return 'Yeni İş Adımı Ekle';
  }

  ngOnInit(): void {
    this.form = this.createForm();
    this.isValid = this.isFormValid();
    this.form.valueChanges.subscribe(() => {
      const noRequiredSkills = this.form.controls.NoRequiredSkills.value ?? false;
      if (noRequiredSkills) {
        const updatedList = (this.form.controls.RequiredSkills.value ?? []).map((x) => {
          x.selected = false;
          return x;
        });
        this.form.controls.RequiredSkills.patchValue(updatedList, { emitEvent: false });
      }
      const noWorkPermits = this.form.controls.NoWorkPermits.value ?? false;
      if (noWorkPermits) {
        const updatedList = (this.form.controls.WorkPermits.value ?? []).map((x) => {
          x.selected = false;
          return x;
        });
        this.form.controls.WorkPermits.patchValue(updatedList, { emitEvent: false });
      }
      this.isValid = this.isFormValid();
    });
  }

  onSave(): void {
    if (!this.task?.Id) {
      this.task = {
        Id: '',
        Name: '',
        Priority: 0,
        Precautions: [],
        RequiredSkills: [],
        TaskRisks: [],
        RiskCategory: 0,
        RiskCategoryName: '',
        WorkPermits: [],
      };
    }

    this.task.Name = this.form.controls.Name.value ?? '';
    this.task.NoWorkPermits = this.form.controls.NoWorkPermits.value ?? false;
    if (this.task.NoWorkPermits) {
      this.task.WorkPermits = [];
    } else {
      this.task.WorkPermits =
        (this.form.controls.WorkPermits.value ?? []).filter((x) => x.selected).map((x) => x.item) ?? [];
    }
    this.task.NoRequiredSkills = this.form.controls.NoRequiredSkills.value ?? false;
    if (this.task.NoRequiredSkills) {
      this.task.RequiredSkills = [];
    } else {
      this.task.RequiredSkills =
        (this.form.controls.RequiredSkills.value ?? []).filter((x) => x.selected).map((x) => x.item) ?? [];
    }

    this.dialogRef.close(this.task);
  }

  onWorkPermitChange(e: MatCheckboxChange): void {
    const code = e.source.value;
    const item = this.workPermitSelectList.find((x) => x.item.Code === code);
    if (item) {
      item.selected = e.checked;
      this.form.controls.WorkPermits.patchValue(this.workPermitSelectList);
    }
  }

  onRequiredSkillChange(e: MatCheckboxChange): void {
    const code = e.source.value;
    const item = this.skillsSelectList.find((x) => x.item.Code === code);
    if (item) {
      item.selected = e.checked;
      this.form.controls.RequiredSkills.patchValue(this.skillsSelectList);
    }
  }

  private createForm(): FormGroup<PageForm> {
    const name = this.task?.Name ?? '';
    const noSkills = this.task?.NoRequiredSkills ?? false;
    const noWorkPermits = this.task?.NoWorkPermits ?? false;
    const selectedWorkPermits = this.task?.WorkPermits ?? ([] as CodeValueItem[]);
    const selectedSkills = this.task?.RequiredSkills ?? ([] as CodeValueItem[]);
    this.workPermitSelectList = this.workPermits.map((x) => {
      return {
        item: x,
        selected: selectedWorkPermits.findIndex((y) => y.Code === x.Code) >= 0,
      } as CodeValueSelectItem;
    });
    this.skillsSelectList = this.skills.map((x) => {
      return {
        item: x,
        selected: selectedSkills.findIndex((y) => y.Code === x.Code) >= 0,
      } as CodeValueSelectItem;
    });
    const fg = {
      Name: new FormControl<string | null>(name, { validators: [Validators.required, Validators.maxLength(500)] }),
      NoRequiredSkills: new FormControl<boolean>(noSkills),
      RequiredSkills: new FormControl<CodeValueSelectItem[]>(this.skillsSelectList),
      NoWorkPermits: new FormControl<boolean>(noWorkPermits),
      WorkPermits: new FormControl<CodeValueSelectItem[]>(this.workPermitSelectList),
    } as PageForm;
    return this.formBuilder.group(fg);
  }

  private isFormValid(): boolean {
    if (!this.form.controls.Name.valid) {
      return false;
    }

    const noRequiredSkills = this.form.controls.NoRequiredSkills.value ?? false;
    if (!noRequiredSkills) {
      const hasRequiredSkills = (this.form.controls.RequiredSkills.value ?? []).some((x) => x.selected);
      if (!hasRequiredSkills) {
        return false;
      }
    }

    const noWorkPermits = this.form.controls.NoWorkPermits.value ?? false;
    if (!noWorkPermits) {
      const hasWorkPermits = (this.form.controls.WorkPermits.value ?? []).some((x) => x.selected);
      if (!hasWorkPermits) {
        return false;
      }
    }

    return true;
  }
}
