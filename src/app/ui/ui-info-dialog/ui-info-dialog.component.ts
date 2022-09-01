import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfoDialogData } from 'src/app/data/common.model';

@Component({
  selector: 'app-ui-info-dialog',
  templateUrl: './ui-info-dialog.component.html',
  styleUrls: ['./ui-info-dialog.component.scss'],
})
export class UiInfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: InfoDialogData,
    public dialogRef: MatDialogRef<UiInfoDialogComponent>
  ) {}

  get heading(): string {
    return this.data.heading ?? '';
  }

  get title(): string {
    return this.data.title ?? '';
  }

  get body(): string {
    return this.data.body ?? '';
  }

  get dismissable(): boolean {
    return this.data.dismissable ?? false;
  }

  get dismissBtn(): string {
    return this.data.dismissText ?? 'Kapat';
  }

  get loading(): boolean {
    return this.data.isLoading ?? false;
  }
}
