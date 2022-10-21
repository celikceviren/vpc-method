import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AreaListItem } from 'src/app/data/aregroups.model';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-area-qr-view',
  templateUrl: './area-qr-view.component.html',
  styleUrls: ['./area-qr-view.component.scss'],
})
export class AreaQrViewComponent implements OnInit {
  item: AreaListItem;
  @ViewChild('qrContent', { static: false }) qrContentElement!: ElementRef;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AreaListItem, public dialogRef: MatDialogRef<AreaQrViewComponent>) {
    this.item = data;
  }

  ngOnInit(): void {}

  onDownloadClick(): void {
    if (this.qrContentElement) {
      html2canvas.default(this.qrContentElement.nativeElement).then((canvas) => {
        const filename = this.item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        this.canvas.nativeElement.src = canvas.toDataURL();
        this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
        this.downloadLink.nativeElement.download = filename + '_qr_code.png';
        this.downloadLink.nativeElement.click();
      });
    }
  }
}
