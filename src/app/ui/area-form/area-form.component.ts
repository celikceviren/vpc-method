import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AreaFormDialogData, AreaGroupListItem, AreaListItem } from 'src/app/data/aregroups.model';

interface PageForm {
  Name: FormControl<string>;
  Facility: FormControl<string>;
  AreaGroup: FormControl<string>;
}

@Component({
  selector: 'app-area-form',
  templateUrl: './area-form.component.html',
  styleUrls: ['./area-form.component.scss'],
})
export class AreaFormComponent implements OnInit {
  isEditMode!: boolean;
  item: AreaListItem | null;
  form!: FormGroup<PageForm>;
  facilities!: Array<{ id: string; name: string }>;
  areaGroups!: Array<AreaGroupListItem>;
  filteredAreaGroups!: Array<AreaGroupListItem>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AreaFormDialogData,
    public dialogRef: MatDialogRef<AreaFormComponent>,
    private formBuilder: FormBuilder
  ) {
    this.isEditMode = data.isEdit ?? false;
    this.item = data.item ?? null;
    this.facilities = data.facilities ?? [];
    this.areaGroups = data.areaGroups ?? [];
    this.filteredAreaGroups = this.isEditMode
      ? this.areaGroups.filter((x) => x.facilityCode === this.item?.facilityCode)
      : data.areaGroups ?? [];
  }

  get title(): string {
    if (this.isEditMode) {
      return 'Çalışma Yeri Düzenle';
    }

    return 'Yeni Çalışma Yeri Ekle';
  }

  ngOnInit(): void {
    this.form = this.createForm();
    if (this.isEditMode) {
      this.form.controls.Facility.disable();
      this.form.controls.AreaGroup.disable();
    }
    this.form.controls.Facility.valueChanges.subscribe(() => {
      this.filteredAreaGroups = this.areaGroups.filter((x) => x.facilityCode === this.form.controls.Facility.value);
      this.form.controls.AreaGroup.setValue('');
    });
  }

  onSave(): void {
    if (!this.item?.id) {
      this.item = {
        id: 0,
        facilityCode: this.form.controls.Facility.value,
        facility: '',
        code: '',
        areaGroup: '',
        areaGroupCode: this.form.controls.AreaGroup.value,
        name: '',
        qrCode: '',
      };
    }

    this.item.name = this.form.controls.Name.value ?? '';
    this.dialogRef.close(this.item);
  }

  private createForm(): FormGroup<PageForm> {
    const name = this.item?.name ?? '';
    const facility = this.item?.facilityCode ?? '';
    const areaGroup = this.item?.areaGroupCode ?? '';

    const fg = {
      Name: new FormControl<string | null>(name, { validators: [Validators.required, Validators.maxLength(200)] }),
      Facility: new FormControl<string | null>(facility, { validators: [Validators.required] }),
      AreaGroup: new FormControl<string | null>(areaGroup, { validators: [Validators.required] }),
    } as PageForm;
    return this.formBuilder.group(fg);
  }
}
