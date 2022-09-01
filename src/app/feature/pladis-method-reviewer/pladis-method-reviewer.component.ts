import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, finalize, fromEvent, interval, map, Subject, take, takeUntil, timer } from 'rxjs';
import { ConfirmDialogData, InfoDialogData } from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { MethodDoc } from 'src/app/data/method-doc.model';
import { FailureMsgData, HandshakeMsgData, KeepAliveMsgData, RejectDocMsgData } from 'src/app/data/window-msg.model';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { UiReviewRejectComponent } from 'src/app/ui/ui-review-reject/ui-review-reject.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-pladis-method-reviewer',
  templateUrl: './pladis-method-reviewer.component.html',
  styleUrls: ['./pladis-method-reviewer.component.scss'],
})
export class PladisMethodReviewerComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();
  private _keepAliveTick = new Subject<void>();
  private _sessionTerminated = new Subject<void>();
  private keepAliveErrorCount = 0;
  private readonly keepAliveInterval = 90000;

  companyCode = 'PLADIS';
  versionCode: string | undefined;
  methodDoc: MethodDoc | null = null;
  ready = false;

  constructor(
    private route: ActivatedRoute,
    private splasService: SplashScreenService,
    private windowMsgService: WindowMsgService,
    private dialogService: InfoDialogService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((params: Params) => {
      this.versionCode = params['versionCode'] ?? '';

      if (!this.versionCode) {
        this.postMsg('failed', { reason: 'INV_VERSION_CODE', reasonMsg: 'Doküman versiyon bilgisi eksik.' });
        return;
      }

      if (this.versionCode) {
        this.awaitInitialData();
        this.postMsg('ready', { companyCode: this.companyCode, versionCode: this.versionCode });
        return;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._keepAliveTick.complete();
    this._sessionTerminated.complete();
  }

  onApprove(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Onay',
      body: 'Metod dokümanını onaylamak istediğinize emin misiniz?',
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
      if (!resp || !resp?.confirmed || !this.methodDoc) {
        return;
      }

      setTimeout(() => {
        const dialogData: InfoDialogData = {
          body: 'İşlem yapılıyor...',
          isLoading: true,
        };
        this.dialogService.show(dialogData);

        this.awaitApproveResponse();
        this.postMsg('approve', { companyCode: this.companyCode, versionCode: this.versionCode ?? '' });
      }, 100);
    });
  }

  onReject(): void {
    const dialogRef = this.dialog.open(UiReviewRejectComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp?.reason) {
          return;
        }

        setTimeout(() => {
          const dialogData: InfoDialogData = {
            body: 'İşlem yapılıyor...',
            isLoading: true,
          };
          this.dialogService.show(dialogData);

          this.awaitApproveResponse();
          this.postMsg('reject', {
            companyCode: this.companyCode,
            versionCode: this.versionCode ?? '',
            reason: resp.reason,
          });
        }, 100);
      });
  }

  private awaitInitialData(): void {
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(timer(15000)),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }

          return e?.data?.action === 'data' && e.data?.data?.VersionCode === this.versionCode;
        }),
        take(1),
        map((e: any) => e.data.data as MethodDoc),
        finalize(() => {
          setTimeout(() => {
            if (!this.methodDoc) {
              this.splasService.hide();
              this.dialogService.show({
                heading: 'Hata',
                title: 'Veriler alınamadı.',
                body: 'Sayfayı yenileyerek tekrar deneyiniz.<br/><small><i>Ref: awaitInitialData:001',
              });
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        console.log('awaitInitialData => received =>', e);
        this.methodDoc = e;
        this.initKeepAlive();
        setTimeout(() => {
          this.ready = true;
          this.splasService.hide();
        }, 500);
      });
  }

  private initKeepAlive(): void {
    interval(this.keepAliveInterval)
      .pipe(takeUntil(this._unsubscribeAll), takeUntil(this._sessionTerminated))
      .subscribe(() => {
        this._keepAliveTick.next();
        setTimeout(() => {
          this.awaitKeepAliveData();
          this.postMsg('keepAlive', {
            companyCode: this.companyCode,
            versionCode: this.versionCode ?? '',
            type: 'viewMethodDoc',
          });
        });
      });
  }

  private awaitKeepAliveData(): void {
    let success = false;
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._keepAliveTick),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }
          return e?.data?.action === 'keepAlive';
        }),
        take(1),
        map((e: any) => e.data.data),
        finalize(() => {
          setTimeout(() => {
            if (!success) {
              this.keepAliveErrorCount++;
              if (this.keepAliveErrorCount > 2) {
                this.dialogService.show({
                  heading: 'Hata',
                  title: '',
                  body: 'Uzun süredir işlem yapmadığınız için oturumunuz sona erdi.<br/><small><i>Ref: awaitKeepAliveData:001',
                });
                this._sessionTerminated.next();
              }
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        if (e.result) {
          success = true;
          this.keepAliveErrorCount = 0;
        }
      });
  }

  private awaitApproveResponse(): void {
    let success = false;
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(timer(15000)),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }
          return e?.data?.action === 'approve';
        }),
        take(1),
        map((e: any) => e.data.data),
        finalize(() => {
          setTimeout(() => {
            if (!success) {
              this.dialogService.show({
                heading: 'İşlem başarısız',
                body: 'Lütfen daha sonra tekrar deneyin.<br/><small><i>Ref: awaitApproveResponse:001',
                dismissable: true,
              });
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        success = true;
        if (!e.result) {
          const reasonCode = e.reasonCode ?? '-';
          const reason = e.reason ?? 'awaitApproveResponse:002';
          this.dialogService.show({
            heading: 'İşlem başarısız',
            body: `Hata: ${reasonCode}<br/><small><i>Ref: ${reason}`,
            dismissable: true,
          });
        }
      });
  }

  private postMsg(msg: string, data?: FailureMsgData | HandshakeMsgData | KeepAliveMsgData | RejectDocMsgData): void {
    const targetOrigin = `${this.windowMsgService.getSourceOrigin('/project/methodDocs')}`;
    parent.postMessage(
      {
        action: msg,
        data,
      },
      targetOrigin
    );
  }
}
