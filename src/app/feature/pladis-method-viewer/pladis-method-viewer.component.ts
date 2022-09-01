import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, finalize, fromEvent, interval, map, Subject, take, takeUntil, timer } from 'rxjs';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { MethodDoc } from 'src/app/data/method-doc.model';
import { FailureMsgData, HandshakeMsgData, KeepAliveMsgData, SaveDocMsgData } from 'src/app/data/window-msg.model';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-pladis-method-viewer',
  templateUrl: './pladis-method-viewer.component.html',
  styleUrls: ['./pladis-method-viewer.component.scss'],
})
export class PladisMethodViewerComponent implements OnInit, OnDestroy {
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
    private dialogService: InfoDialogService
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

  private postMsg(msg: string, data?: FailureMsgData | HandshakeMsgData | KeepAliveMsgData | SaveDocMsgData): void {
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
