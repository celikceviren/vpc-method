import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

interface PageForm {
  rejectReason: FormControl<string | null>;
  isApprove: FormControl<boolean | null>;
}

@Component({
  selector: 'app-wp-approve-form',
  templateUrl: './wp-approve-form.component.html',
  styleUrls: ['./wp-approve-form.component.scss'],
})
export class WpApproveFormComponent implements OnInit {
  @Input() id: number = 0;
  @Output() submit: EventEmitter<{ id: number; isApprove: boolean; rejectReason: string }> = new EventEmitter<{
    id: number;
    isApprove: boolean;
    rejectReason: string;
  }>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  form!: FormGroup<PageForm>;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.createForm();
    this.form.controls.isApprove.valueChanges.subscribe(() => {
      const isApprove = this.form.controls.isApprove.value ?? true;
      if (isApprove) {
        this.form.controls.rejectReason.setValue('');
        this.form.controls.rejectReason.setValidators(Validators.compose([Validators.maxLength(250)]));
        this.form.controls.rejectReason.updateValueAndValidity({ onlySelf: true });
      } else {
        this.form.controls.rejectReason.setValidators(
          Validators.compose([Validators.required, Validators.maxLength(250)])
        );
        this.form.controls.rejectReason.updateValueAndValidity();
      }
    });
  }

  onSubmitform(): void {
    const value = {
      id: this.id,
      isApprove: this.form.controls.isApprove.value ?? true,
      rejectReason: this.form.controls.rejectReason.value ?? '',
    };

    this.submit.emit(value);
  }

  private createForm(): FormGroup<PageForm> {
    return this.formBuilder.group({
      isApprove: [true],
      rejectReason: ['', Validators.compose([Validators.maxLength(250)])],
    });
  }
}
