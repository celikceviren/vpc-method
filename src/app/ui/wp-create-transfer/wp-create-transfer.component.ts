import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CodeValueItem } from 'src/app/data/workpermit.model';

interface PageForm {
  selectedUser: FormControl<string | null>;
}

@Component({
  selector: 'app-wp-create-transfer',
  templateUrl: './wp-create-transfer.component.html',
  styleUrls: ['./wp-create-transfer.component.scss'],
})
export class WpCreateTransferComponent implements OnInit {
  form!: FormGroup<PageForm>;
  usersList!: CodeValueItem[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CodeValueItem[],
    public dialogRef: MatDialogRef<WpCreateTransferComponent>,
    public formBuilder: FormBuilder
  ) {
    this.usersList = data;
  }

  ngOnInit(): void {
    this.form = this.createForm();
  }

  onSelectTransferUser(): void {
    const user = this.usersList.find((x) => x.code === this.form.controls.selectedUser.value);
    this.dialogRef.close(user);
  }

  private createForm(): FormGroup<PageForm> {
    return this.formBuilder.group({
      selectedUser: ['', Validators.required],
    });
  }
}
