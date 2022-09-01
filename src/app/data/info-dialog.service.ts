import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UiInfoDialogComponent } from '../ui/ui-info-dialog/ui-info-dialog.component';
import { InfoDialogData } from './common.model';

@Injectable({
  providedIn: 'root',
})
export class InfoDialogService {
  private dialogRef: MatDialogRef<UiInfoDialogComponent> | undefined;

  constructor(private dialog: MatDialog) {}

  public show(msg: InfoDialogData): void {
    this.hide();
    this.dialogRef = this.dialog.open(UiInfoDialogComponent, {
      width: '300px',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: msg,
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = undefined;
    });
  }

  public hide(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
