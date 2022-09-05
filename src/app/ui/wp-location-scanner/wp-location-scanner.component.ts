import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { from, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-wp-location-scanner',
  templateUrl: './wp-location-scanner.component.html',
  styleUrls: ['./wp-location-scanner.component.scss'],
})
export class WpLocationScannerComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;

  @Output('scanSuccess') scanSuccess: EventEmitter<string> = new EventEmitter<string>();

  scannerEnabled = false;
  hasWarning = false;
  warningMsg!: string;
  devices: MediaDeviceInfo[] = [];
  activeDevice: FormControl<MediaDeviceInfo | null> = new FormControl<MediaDeviceInfo | null>(null);
  availableFormats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.askCameraPermission();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  onCamerasFound(event: MediaDeviceInfo[]): void {
    if (event?.length) {
      this.devices = event;
      const activeDevice = this.devices[0];
      this.activeDevice = new FormControl<MediaDeviceInfo>({ value: activeDevice, disabled: false });

      /*
      Note: Mock QR Scan
      setTimeout(() => {
        this.scanSuccess.emit('UExBRElTOjEwMjAwMDk3UDE6UExBRElTXzFfMg==');
      }, 3000);
      */
    }
  }

  onCamerasNotFound(event: any): void {
    this.warningMsg = 'Çalışma alanı seçimi için kullanılabilecek bir kamera yok!';
    this.hasWarning = true;
  }

  onScanSuccess(event: string): void {
    this.scannerEnabled = false;
    this.scanSuccess.emit(event);
  }

  private askCameraPermission(): void {
    from(this.scanner.askForPermission())
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((response) => {
        if (!response) {
          this.warningMsg = 'Çalışma alanı seçimi için tarayıcınızın kamera erişimine izin vermeniz gerekmektedir.';
          this.hasWarning = true;
          setTimeout(() => {
            this.askCameraPermission();
          }, 5000);
        } else {
          this.hasWarning = false;
          setTimeout(() => {
            this.scannerEnabled = true;
          }, 500);
        }
      });
  }
}
