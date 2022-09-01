import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from 'src/app/data/common.model';

@Component({
  selector: 'app-ui-confirm-dialog',
  templateUrl: './ui-confirm-dialog.component.html',
})
export class UiConfirmDialogComponent {
  title: string;
  body: string;
  hasConfirm: boolean;
  confirmBtn: string;
  closeBtn: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialogRef: MatDialogRef<UiConfirmDialogComponent>
  ) {
    this.title = data.title ?? '';
    this.body = data.body;
    this.hasConfirm = data.hasConfirmBtn ?? false;
    this.confirmBtn = data.confirmBtnText ?? 'Onayla';
    this.closeBtn = data.closeBtnText ?? 'Kapat';
  }

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true });
  }
}
