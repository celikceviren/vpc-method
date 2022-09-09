import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmDialogData, StaticValues } from 'src/app/data/common.model';
import { WorkPermitApproveService } from 'src/app/data/workpermit-approve.service';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import { WorkpermitNewService } from 'src/app/data/workpermit-new.service';
import {
  CodeValueItem,
  ControlQuestions,
  PageState,
  Project,
  ServiceError,
  WpFormStep,
  WpFormStepData,
  WpFormType,
  WpListSelectItem,
  WpPageState,
} from 'src/app/data/workpermit.model';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-common-workpermit-forms',
  templateUrl: './common-workpermit-forms.component.html',
  styleUrls: ['./common-workpermit-forms.component.scss'],
})
export class CommonWorkpermitFormsComponent implements OnInit, OnDestroy {
  private unsubscribeAll = new Subject<void>();
  companyCode!: string;
  formType!: WpFormType;
  title!: string;
  steps = WpFormStep;
  states = PageState;
  currentStep: WpFormStep = WpFormStep.SelectLocation;
  stepTitle: string | undefined;
  stepData: WpFormStepData = new WpFormStepData();
  pageState: WpPageState = {
    state: PageState.ready,
  };
  inProgressMsg = 'Yükleniyor...';
  retryProcessFn!: Function | undefined;

  constructor(
    private splashService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private service: WorkPermitApproveService,
    private wpNewService: WorkpermitNewService,
    private wpMainService: WpMainService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe((paramMap) => {
      this.companyCode = paramMap.get('company') ?? '';
      const formtype = parseInt(paramMap.get('formtype') ?? '0');
      if (formtype !== WpFormType.WpCloseForm && formtype !== WpFormType.WpControlForm) {
        return;
      }

      this.formType = formtype;
      if (this.formType === WpFormType.WpCloseForm) {
        this.title = 'İş Bitirme Formu';
      } else {
        this.title = 'Ara Kontrol Formu';
      }
      this.stepData.formType = this.formType;
      this.stepTitle = this.service.getFormStepTitle(this.currentStep);
      this.splashService.hide();
    });
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
    if (this.currentStep === WpFormStep.SelectLocation) {
      return;
    }

    this.backToStep(this.currentStep);
  }

  onBackToStep(step: WpFormStep): void {
    this.currentStep = step;
    this.backToStep(this.currentStep);
  }

  onConfirmReset(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Yeni İş İzni - Vazgeç',
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

      this.stepData = new WpFormStepData();
      this.stepData.formType = this.formType;
      this.moveToStep(WpFormStep.SelectLocation);
      this.onResetPageState();
    });
  }

  onScanSuccess(qrCode: string): void {
    if (this.currentStep !== WpFormStep.SelectLocation) {
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
                details: this.service.formatErrorDetails('L131', 'searchWorkAreaByQrCode'),
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
    this.moveToStep(WpFormStep.SelectWorkPermit);
    this.loadStep();
  }

  onWorkPermitSelected(item: Project | CodeValueItem | WpListSelectItem): void {
    if (item.kind !== 'workpermit') {
      return;
    }

    this.stepData.selectedWp = item.self;
    this.moveToStep(WpFormStep.QuestionsList);
    this.loadStep();
  }

  onQuestionsAnswered(control: ControlQuestions): void {
    this.stepData.controlQuestions.questionGroups = control.questionGroups;
    this.stepData.controlQuestions.controlNotes = control.controlNotes ?? '';
    this.moveToStep(WpFormStep.ReviewApprove);
    this.loadStep();
  }

  onConfirmApprove(): void {
    const msg =
      this.stepData.formType === WpFormType.WpCloseForm
        ? 'İşi sonlandırıyorsunuz, emin misiniz?'
        : 'Kontrol formu kaydedilecek, emin misiniz?';
    const dialogData: ConfirmDialogData = {
      title: '',
      body: msg,
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed) {
        return;
      }

      this.onNewPageState(PageState.inprogress);
      this.service
        .sendFormResult(this.stepData.controlQuestions, this.stepData.formType, this.stepData.selectedWp?.id ?? 0)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((response) => {
          if (!response?.result) {
            this.onNewPageState(
              PageState.failed,
              response?.error ??
                ({
                  message: 'Bilgiler kaydedilemedi',
                  details: this.service.formatErrorDetails('L220', 'onConfirmApprove:sendFormResult'),
                } as ServiceError)
            );
            return;
          }
        });
    });
  }

  private getWorkPermitsForFormType(): void {
    const { companyCode, facilityCode, areaCode } = this.stepData.selectedLocation;
    this.service
      .getWorkPermitsForFormType(areaCode, this.stepData.formType)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L175', 'getWorkPermitsForFormType'),
              } as ServiceError)
          );
          return;
        }

        if (!response.item?.wplist?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen çalışma alanında onaylayabileceğiniz iş izni yok.',
            details: this.service.formatErrorDetails('L116', `${companyCode}:${facilityCode}:${areaCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.wpList = response.item.wplist;
        this.stepData.controlQuestions = response.item.controlQuestions;
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
                details: this.service.formatErrorDetails('L235', 'getWorkPermitItem'),
              } as ServiceError)
          );
          return;
        }
        this.stepData.wpItem = response.item;
        this.onNewPageState(PageState.done);
      });
  }

  private loadStep(): void {
    switch (this.currentStep) {
      case WpFormStep.SelectWorkPermit:
        this.inProgressMsg = 'İş izinleri alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkPermitsForFormType();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WpFormStep.QuestionsList:
        this.inProgressMsg = 'İş izni bilgileri alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkPermitItem();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WpFormStep.ReviewApprove:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.done);
        this.retryProcessFn = this.loadStep.bind(this);
        break;
    }
  }

  private backToStep(step: WpFormStep): void {
    switch (step) {
      case WpFormStep.SelectWorkPermit:
        this.moveToStep(WpFormStep.SelectLocation);
        this.stepData.clearSelectedLocation();
        this.onResetPageState();
        break;
      case WpFormStep.QuestionsList:
        this.moveToStep(WpFormStep.SelectWorkPermit);
        this.stepData.selectedWp = undefined;
        this.stepData.wpItem = undefined;
        this.loadStep();
        break;
      case WpFormStep.ReviewApprove:
        this.moveToStep(WpFormStep.QuestionsList);
        this.loadStep();
        break;
    }
  }

  private moveToStep(newStep: WpFormStep): void {
    this.currentStep = newStep;
    this.stepTitle = this.service.getFormStepTitle(newStep);
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
