import { Component, OnInit, ElementRef } from '@angular/core';
import { ConfirmDialogData, InfoDialogData } from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import { debounceTime, Subject, take, takeUntil, tap, distinctUntilChanged, delay } from 'rxjs';
import { ServiceError, WorkPermitItem } from 'src/app/data/workpermit.model';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';
import { ActivatedRoute } from '@angular/router';
import { WpRole } from 'src/app/data/workpermit-main.model';
import { Location } from '@angular/common';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pladis-workpermit-view',
  templateUrl: './pladis-workpermit-view.component.html',
  styleUrls: ['./pladis-workpermit-view.component.scss'],
})
export class PladisWorkpermitViewComponent implements OnInit {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();
  private companyCode = 'PLADIS';

  id!: number;
  role!: WpRole;
  ready!: boolean;
  item!: WorkPermitItem;

  constructor(
    private service: WpMainService,
    private windowService: WindowMsgService,
    private dialogService: InfoDialogService,
    private splashService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private location: Location,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe((paramMap) => {
      this.id = parseInt(paramMap.get('id') ?? '0');
      const role = paramMap.get('role') ?? WpRole.VIEWER;
      if ((<any>Object).values(WpRole).includes(role)) {
        this.role = role as WpRole;
      } else {
        this.role = WpRole.VIEWER;
      }
      this.splashService.hide();
      this.init();
    });
  }

  onBackClick(): void {
    this.location.back();
  }

  onDownloadAsPdf(): void {
    this.service
      .getWorkPermitItemPdf(this.id)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe(() => {});
    return;
  }

  onConfirmTransferComplete(isApprove: boolean): void {
    const dialogData: ConfirmDialogData = {
      title: 'İş İzni Devir',
      body: isApprove
        ? 'Devir işlemini onaylıyorsunuz, emin misiniz?'
        : 'Devir işlemini onaylamıyorsunuz, emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((resp) => {
      const dialogData: InfoDialogData = {
        body: 'Kaydediliyor...',
        isLoading: true,
      };
      this.dialogService.show(dialogData);

      if (!resp || !resp?.confirmed) {
        this.cancelTransfer();
        return;
      }

      this.approveTransfer();
    });
  }

  private approveTransfer(): void {
    this.service
      .approveTransfer(this.item.id)
      .pipe(
        takeUntil(this.unsubscribeAll),
        take(1),
        tap(() => this.dialogService.hide())
      )
      .subscribe((resp) => {
        if (!resp?.result) {
          const msg =
            resp?.error ??
            ({
              message: 'Veriler alınamadı',
              details: this.service.formatErrorDetails('L116', 'approveTransfer'),
            } as ServiceError);

          const dialogData: InfoDialogData = {
            title: 'İşlem başarısız',
            body: `${msg.message}<br /><small>${msg.details}</small>`,
            dismissable: true,
          };
          setTimeout(() => {
            this.dialogService.show(dialogData);
          }, 500);
          return;
        }
      });
  }

  private cancelTransfer(): void {
    this.service
      .cancelTransfer(this.item.id, true)
      .pipe(
        takeUntil(this.unsubscribeAll),
        take(1),
        tap(() => this.dialogService.hide())
      )
      .subscribe((resp) => {
        if (!resp?.result) {
          const msg =
            resp?.error ??
            ({
              message: 'Veriler alınamadı',
              details: this.service.formatErrorDetails('L146', 'cancelTransfer'),
            } as ServiceError);

          const dialogData: InfoDialogData = {
            title: 'İşlem başarısız',
            body: `${msg.message}<br /><small>${msg.details}</small>`,
            dismissable: true,
          };
          setTimeout(() => {
            this.dialogService.show(dialogData);
          }, 500);
          return;
        }
      });
  }

  private init(): void {
    const dialogData: InfoDialogData = {
      body: 'Veriler alınıyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);

    this.service
      .getWorkPermitItem(this.id, true)
      .pipe(
        takeUntil(this.unsubscribeAll),
        take(1),
        delay(1000),
        tap(() => this.dialogService.hide())
      )
      .subscribe((resp) => {
        if (!resp?.result || resp?.item === undefined) {
          const msg =
            resp?.error ??
            ({
              message: 'Veriler alınamadı',
              details: this.service.formatErrorDetails('L59', 'PladisWorkpermitView:init'),
            } as ServiceError);

          const dialogData: InfoDialogData = {
            title: 'İşlem başarısız',
            body: `${msg.message}<br /><small>${msg.details}</small>`,
            dismissable: true,
          };
          setTimeout(() => {
            this.dialogService.show(dialogData);
          }, 500);
          return;
        }

        this.item = resp.item;
        if (this.role === WpRole.VIEWER) {
          this.awaitHeightChange();
        }
        this.ready = true;
      });
  }

  private awaitHeightChange(): void {
    this.height$.pipe(distinctUntilChanged(), debounceTime(200)).subscribe((newHeight) => {
      this.windowService.postMsg('newheight', { height: newHeight });
    });

    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      this.height$.next(height);
    });

    observer.observe(this.host.nativeElement);
  }
}
