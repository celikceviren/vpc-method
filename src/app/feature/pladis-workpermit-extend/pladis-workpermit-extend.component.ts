import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmDialogData } from 'src/app/data/common.model';
import { WorkPermitApproveService } from 'src/app/data/workpermit-approve.service';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import { WorkpermitNewService } from 'src/app/data/workpermit-new.service';
import {
  CodeValueItem,
  PageState,
  Project,
  ServiceError,
  WpApproveStep,
  WpApproveStepData,
  WpListSelectItem,
  WpPageState,
} from 'src/app/data/workpermit.model';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-pladis-workpermit-extend',
  templateUrl: './pladis-workpermit-extend.component.html',
  styleUrls: ['./pladis-workpermit-extend.component.scss'],
})
export class PladisWorkpermitExtendComponent implements OnInit, OnDestroy {
  private unsubscribeAll = new Subject<void>();
  companyCode = 'PLADIS';
  title = 'İş İzni Süre Uzatma';
  steps = WpApproveStep;
  states = PageState;
  currentStep: WpApproveStep = WpApproveStep.SelectLocation;
  stepTitle: string | undefined;
  stepData: WpApproveStepData = new WpApproveStepData();
  pageState: WpPageState = {
    state: PageState.ready,
  };
  inProgressMsg = 'Yükleniyor...';
  retryProcessFn!: Function | undefined;

  constructor(
    private splashService: SplashScreenService,
    private service: WorkPermitApproveService,
    private wpNewService: WorkpermitNewService,
    private wpMainService: WpMainService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.stepTitle = this.service.getExtendStepTitle(this.currentStep);
      this.splashService.hide();
    }, 0);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  onRetryFailedStep(): void {
    if (this.pageState.state !== PageState.failed || !this.retryProcessFn) {
      return;
    }

    this.retryProcessFn();
  }

  onPreviousStep(): void {
    if (this.currentStep === WpApproveStep.SelectLocation) {
      return;
    }

    this.backToStep(this.currentStep);
  }

  onScanSuccess(qrCode: string): void {
    if (this.currentStep !== WpApproveStep.SelectLocation) {
      return;
    }

    this.retryProcessFn = this.onResetPageState.bind(this);
    this.inProgressMsg = 'Barkod okundu, bilgiler alınıyor...';
    this.onNewPageState(PageState.inprogress);

    this.wpNewService
      .searchWorkAreaByQrCode(qrCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result || !response?.item) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message:
                  response?.result && !response.item
                    ? 'Okutulan koda ait bir çalışma alanı bulunamadı'
                    : 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L73', 'searchWorkAreaByQrCode'),
              } as ServiceError)
          );
          return;
        }

        this.stepData.qrCode = qrCode;
        this.stepData.selectedLocation = response.item;
        this.onNewPageState(PageState.done);
      });
  }

  onLocationApprove(approved: boolean): void {
    if (!approved) {
      this.onResetPageState();
      this.stepData.clearSelectedLocation();
      return;
    }
    this.moveToStep(WpApproveStep.SelectWorkPermit);
    this.loadStep();
  }

  onWorkPermitSelected(item: Project | CodeValueItem | WpListSelectItem): void {
    if (item.kind !== 'workpermit') {
      return;
    }

    this.stepData.selectedWp = item.self;
    this.moveToStep(WpApproveStep.WorkPermitReview);
    this.loadStep();
  }

  onConfirmWpDetails(): void {
    this.moveToStep(WpApproveStep.Approval);
    this.loadStep();
  }

  onExtendApproved(): void {
    this.onNewPageState(PageState.inprogress);
    this.service
      .sendExtendApprove({ id: this.stepData.wpItem?.id ?? 0 })
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Bilgiler kaydedilemedi',
                details: this.service.formatErrorDetails('L173', 'onExtendApproved:sendExtendApprove'),
              } as ServiceError)
          );
          return;
        }
      });
  }

  onConfirmReset(): void {
    const dialogData: ConfirmDialogData = {
      title: 'İş Süresi Uzat - Vazgeç',
      body: 'Girilen veriler silinecek ve en başa döneceksiniz, emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Hayır',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed) {
        return;
      }

      this.stepData = new WpApproveStepData();
      this.moveToStep(WpApproveStep.SelectLocation);
      this.onResetPageState();
    });
  }

  private getWorkPermitsToExtend(): void {
    const { companyCode, facilityCode, areaCode } = this.stepData.selectedLocation;
    this.service
      .getWorkPermitsToExtendForArea(areaCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L171', 'getWorkPermitsToExtend'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen çalışma alanında süresini uzatabileceğiniz iş izni yok.',
            details: this.service.formatErrorDetails('L116', `${companyCode}:${facilityCode}:${areaCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.wpList = response.items;
        this.stepData.selectedWp = undefined;
        this.onNewPageState(PageState.done);
      });
  }

  private getWorkPermitItem(): void {
    if (!this.stepData.selectedWp) {
      return;
    }
    this.wpMainService
      .getWorkPermitItem(this.stepData.selectedWp.id)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L205', 'getWorkPermitItem'),
              } as ServiceError)
          );
          return;
        }
        this.stepData.wpItem = response.item;
        this.onNewPageState(PageState.done);
      });
  }

  private backToStep(step: WpApproveStep): void {
    switch (step) {
      case WpApproveStep.SelectWorkPermit:
        this.moveToStep(WpApproveStep.SelectLocation);
        this.stepData.clearSelectedLocation();
        this.onResetPageState();
        break;
      case WpApproveStep.WorkPermitReview:
        this.moveToStep(WpApproveStep.SelectWorkPermit);
        this.stepData.selectedWp = undefined;
        this.loadStep();
        break;
      case WpApproveStep.Approval:
        this.moveToStep(WpApproveStep.WorkPermitReview);
        this.loadStep();
        break;
    }
  }

  private moveToStep(newStep: WpApproveStep): void {
    this.currentStep = newStep;
    this.stepTitle = this.service.getExtendStepTitle(newStep);
  }

  private loadStep(): void {
    switch (this.currentStep) {
      case WpApproveStep.SelectWorkPermit:
        this.inProgressMsg = 'İş izinleri alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkPermitsToExtend();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WpApproveStep.WorkPermitReview:
        this.inProgressMsg = 'İş izni bilgileri alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkPermitItem();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WpApproveStep.Approval:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.done);
        this.retryProcessFn = this.loadStep.bind(this);
        break;
    }
  }

  private onNewPageState(newState: PageState, error?: ServiceError): void {
    this.pageState = {
      state: newState,
      error: error,
    };
  }

  private onResetPageState(): void {
    this.pageState = {
      state: PageState.ready,
      error: undefined,
    };
  }
}
