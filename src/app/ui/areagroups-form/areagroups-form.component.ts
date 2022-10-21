import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AreaGroupFormDialogData, AreaGroupListItem } from 'src/app/data/aregroups.model';

interface PageForm {
  Name: FormControl<string>;
  Facility: FormControl<string>;
}

@Component({
  selector: 'app-areagroups-form',
  templateUrl: './areagroups-form.component.html',
  styleUrls: ['./areagroups-form.component.scss'],
})
export class AreagroupsFormComponent implements OnInit {
  isEditMode!: boolean;
  item: AreaGroupListItem | null;
  form!: FormGroup<PageForm>;
  facilities!: Array<{ id: string; name: string }>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AreaGroupFormDialogData,
    public dialogRef: MatDialogRef<AreagroupsFormComponent>,
    private formBuilder: FormBuilder
  ) {
    this.isEditMode = data.isEdit ?? false;
    this.item = data.item ?? null;
    this.facilities = data.facilities ?? [];
  }

  get title(): string {
    if (this.isEditMode) {
      return 'Alan Düzenle';
    }

    return 'Yeni Alan Ekle';
  }

  ngOnInit(): void {
    this.form = this.createForm();
    if (this.isEditMode) {
      this.form.controls.Facility.disable();
    }
  }

  onSave(): void {
    if (!this.item?.id) {
      this.item = {
        id: 0,
        facilityCode: this.form.controls.Facility.value,
        facility: '',
        code: '',
        areaCount: 0,
        name: '',
      };
    }

    this.item.name = this.form.controls.Name.value ?? '';
    this.dialogRef.close(this.item);
  }

  private createForm(): FormGroup<PageForm> {
    const name = this.item?.name ?? '';
    const facility = this.item?.facilityCode ?? '';

    const fg = {
      Name: new FormControl<string | null>(name, { validators: [Validators.required, Validators.maxLength(200)] }),
      Facility: new FormControl<string | null>(facility, { validators: [Validators.required] }),
    } as PageForm;
    return this.formBuilder.group(fg);
  }
}
