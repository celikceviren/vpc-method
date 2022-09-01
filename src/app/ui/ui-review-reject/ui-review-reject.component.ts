import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

interface PageForm {
  Reason: FormControl<string>;
}

@Component({
  selector: 'app-ui-review-reject',
  templateUrl: './ui-review-reject.component.html',
  styleUrls: ['./ui-review-reject.component.scss'],
})
export class UiReviewRejectComponent implements OnInit {
  form!: FormGroup<PageForm>;

  constructor(public dialogRef: MatDialogRef<UiReviewRejectComponent>, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.createForm();
  }

  onSave(): void {
    this.dialogRef.close({ reason: this.form.controls.Reason.value });
  }

  private createForm(): FormGroup<PageForm> {
    const fg = {
      Reason: new FormControl<string | null>('', { validators: [Validators.required, Validators.maxLength(200)] }),
    } as PageForm;
    return this.formBuilder.group(fg);
  }
}
