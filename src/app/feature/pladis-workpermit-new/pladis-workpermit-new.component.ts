import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmDialogData, StaticValues } from 'src/app/data/common.model';
import { WorkpermitNewService } from 'src/app/data/workpermit-new.service';
import {
  CodeValueItem,
  ControlQuestions,
  GasMeasurement,
  PageState,
  Project,
  ServiceError,
  WorkDetails,
  WpListSelectItem,
  WPNewStep,
  WPNewStepsData,
  WpPageState,
} from 'src/app/data/workpermit.model';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-pladis-workpermit-new',
  templateUrl: './pladis-workpermit-new.component.html',
  styleUrls: ['./pladis-workpermit-new.component.scss'],
})
export class PladisWorkpermitNewComponent implements OnInit, OnDestroy {
  private unsubscribeAll = new Subject<void>();
  companyCode = 'PLADIS';
  title = 'Yeni İş İzni';
  steps = WPNewStep;
  states = PageState;
  currentStep: WPNewStep = WPNewStep.SelectLocation;
  stepTitle: string | undefined;
  stepData: WPNewStepsData = new WPNewStepsData();
  pageState: WpPageState = {
    state: PageState.ready,
  };
  inProgressMsg = 'Yükleniyor...';

  retryProcessFn!: Function | undefined;

  constructor(
    private splashService: SplashScreenService,
    private service: WorkpermitNewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.stepTitle = this.service.getStepTitle(this.currentStep);
    this.splashService.hide();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  onScanSuccess(qrCode: string): void {
    if (this.currentStep !== WPNewStep.SelectLocation) {
      return;
    }

    this.retryProcessFn = this.onResetPageState.bind(this);
    this.inProgressMsg = 'Barkod okundu, bilgiler alınıyor...';
    this.onNewPageState(PageState.inprogress);

    this.service
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
                details: this.service.formatErrorDetails('L54', 'searchWorkAreaByQrCode'),
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
    this.moveToStep(WPNewStep.SelectProject);
    this.loadStep();
  }

  onRetryFailedStep(): void {
    if (this.pageState.state !== PageState.failed || !this.retryProcessFn) {
      return;
    }

    this.retryProcessFn();
  }

  onPreviousStep(): void {
    if (this.currentStep === WPNewStep.SelectLocation) {
      return;
    }

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

      this.stepData = new WPNewStepsData();
      this.moveToStep(WPNewStep.SelectLocation);
      this.onResetPageState();
    });
  }

  onProjectSelected(item: Project | CodeValueItem | WpListSelectItem): void {
    if (item.kind !== 'project') {
      return;
    }

    this.stepData.selectedProject = item;
    this.moveToStep(WPNewStep.SelectContractor);
    this.loadStep();
  }

  onContractorSelected(item: Project | CodeValueItem | WpListSelectItem): void {
    if (item.kind !== 'contractor') {
      return;
    }

    this.stepData.selectedContractor = item;
    this.moveToStep(WPNewStep.SelectStaff);
    this.loadStep();
  }

  onStaffSelected(items: Array<Project | CodeValueItem | WpListSelectItem>): void {
    this.stepData.selectedStaff = items
      .filter((x) => x.kind === 'staff')
      .map((item) => {
        return item as CodeValueItem;
      });
    this.moveToStep(WPNewStep.WorkInfo);
    this.loadStep();
  }

  onWorkDetailsUpdated(info: WorkDetails): void {
    this.stepData.workDescription = info;
    this.moveToStep(WPNewStep.WorkType);
    this.loadStep();
  }

  onWorkTypeSelected(items: Array<CodeValueItem>): void {
    this.stepData.selectedWorkTypes = items;
    this.moveToStep(WPNewStep.Risks);
    this.loadStep();
  }

  onRiskSelected(items: Array<CodeValueItem>): void {
    this.stepData.selectedRisks = items;
    this.moveToStep(WPNewStep.Equipments);
    this.loadStep();
  }

  onEquipmentSelected(items: Array<CodeValueItem>): void {
    this.stepData.selectedEquipments = items;
    this.moveToStep(WPNewStep.Ppe);
    this.loadStep();
  }

  onPpeSelected(items: Array<CodeValueItem>): void {
    this.stepData.selectedPpe = items;
    this.moveToStep(WPNewStep.ExtraPermissions);
    this.loadStep();
  }

  onExtraPermissionSelected(items: Array<CodeValueItem>): void {
    this.stepData.selectedExtraPermissions = items;
    this.moveToStep(WPNewStep.QuestionsList);
    this.loadStep();
  }

  onQuestionsAnswered(control: ControlQuestions): void {
    this.stepData.controlQuestions.questionGroups = control.questionGroups;
    this.stepData.controlQuestions.controlNotes = control.controlNotes ?? '';
    if (this.stepData.selectedExtraPermissions.findIndex((p) => p.code === 'PLADIS_WP_3') >= 0) {
      if (!this.stepData.gasMeasurements.length) {
        this.stepData.populateGasMeasurements();
      }
      this.moveToStep(WPNewStep.GasMeasurement);
    } else {
      this.moveToStep(WPNewStep.ReviewApprove);
    }
    this.loadStep();
  }

  onUpdateGasMeasurements(measurements: GasMeasurement[]): void {
    this.stepData.gasMeasurements = measurements;
    this.moveToStep(WPNewStep.ReviewApprove);
    this.loadStep();
  }

  onConfirmApprove(): void {
    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'İş izni formunu onaya göndermek istediğinize emin misiniz?',
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

      const postData = {
        project: this.stepData.selectedProject?.code,
        contractor: this.stepData.selectedContractor?.code,
        areaCode: this.stepData.selectedLocation.areaCode,
        areaGroupCode: this.stepData.selectedLocation.areaGroupCode,
        staff: this.stepData.selectedStaff.map((x) => {
          return { code: x.code, name: x.name };
        }),
        workDescription: this.stepData.workDescription.description,
        dtStart: this.stepData.workDescription.dtStart,
        workTypes: this.stepData.selectedWorkTypes.map((x) => {
          return { code: x.code, name: x.name };
        }),
        equipments: this.stepData.selectedEquipments.map((x) => {
          return { code: x.code, name: x.name };
        }),
        risks: this.stepData.selectedRisks.map((x) => {
          return { code: x.code, name: x.name };
        }),
        ppe: this.stepData.selectedPpe.map((x) => {
          return { code: x.code, name: x.name };
        }),
        workPermits: this.stepData.selectedExtraPermissions.map((x) => {
          return { code: x.code, name: x.name };
        }),
        controlNotes: this.stepData.controlQuestions.controlNotes ?? '',
        questions: this.stepData.controlQuestions.questionGroups.flatMap((x) =>
          x.questions.map((y) => {
            return { code: y.code, answer: y.answer, answerText: y.answerText };
          })
        ),
        gasMeasurements: this.stepData.gasMeasurements.map((x) => {
          return { code: x.code, value: x.value };
        }),
      };

      this.onNewPageState(PageState.inprogress);
      this.service
        .sendWorPermitToApprove(postData)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((response) => {
          if (!response?.result) {
            this.onNewPageState(
              PageState.failed,
              response?.error ??
                ({
                  message: 'Veriler alınamadı',
                  details: this.service.formatErrorDetails('L284', 'sendWorPermitToApprove'),
                } as ServiceError)
            );
            return;
          }
        });
    });
  }

  onBackToStep(step: WPNewStep): void {
    this.currentStep = step;
    this.backToStep(this.currentStep);
  }

  private backToStep(step: WPNewStep): void {
    switch (step) {
      case WPNewStep.SelectProject:
        this.moveToStep(WPNewStep.SelectLocation);
        this.stepData.clearSelectedLocation();
        this.onResetPageState();
        break;
      case WPNewStep.SelectContractor:
        this.moveToStep(WPNewStep.SelectProject);
        this.stepData.selectedProject = undefined;
        this.loadStep();
        break;
      case WPNewStep.SelectStaff:
        this.moveToStep(WPNewStep.SelectContractor);
        this.stepData.selectedContractor = undefined;
        this.loadStep();
        break;
      case WPNewStep.WorkInfo:
        this.moveToStep(WPNewStep.SelectStaff);
        this.stepData.selectedStaff = [];
        this.stepData.clearWorkDescription();
        this.loadStep();
        break;
      case WPNewStep.WorkType:
        this.moveToStep(WPNewStep.WorkInfo);
        this.loadStep();
        break;
      case WPNewStep.Risks:
        this.moveToStep(WPNewStep.WorkType);
        this.loadStep();
        break;
      case WPNewStep.Equipments:
        this.moveToStep(WPNewStep.Risks);
        this.loadStep();
        break;
      case WPNewStep.Ppe:
        this.moveToStep(WPNewStep.Equipments);
        this.loadStep();
        break;
      case WPNewStep.ExtraPermissions:
        this.moveToStep(WPNewStep.Ppe);
        this.loadStep();
        break;
      case WPNewStep.QuestionsList:
        this.moveToStep(WPNewStep.ExtraPermissions);
        this.loadStep();
        break;
      case WPNewStep.GasMeasurement:
        this.moveToStep(WPNewStep.QuestionsList);
        this.loadStep();
        break;
      case WPNewStep.ReviewApprove:
        this.moveToStep(WPNewStep.GasMeasurement);
        this.loadStep();
        break;
    }
  }

  private getActiveProjects(): void {
    const { companyCode, facilityCode, areaCode } = this.stepData.selectedLocation;
    this.service
      .getActiveProjectsForLocation(areaCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L107', 'getActiveProjects'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen çalışma alanında aktif iş çağrısı yok.',
            details: this.service.formatErrorDetails('L119', `${companyCode}:${facilityCode}:${areaCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.projectsList = response.items;
        this.stepData.selectedProject = undefined;
        this.onNewPageState(PageState.done);
      });
  }

  private getContractorsOfProject(): void {
    if (!this.stepData.selectedProject?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code } = this.stepData.selectedProject;
    this.service
      .getContractorsOfProject(code)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L178', 'getContractorsOfProject'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen iş çağrısı için kayıtlı yüklenici bulunamdı.',
            details: this.service.formatErrorDetails('L187', `${companyCode}:${facilityCode}:${code}`),
          } as ServiceError);
          return;
        }

        this.stepData.contractorsList = response.items;
        this.stepData.selectedContractor = undefined;
        this.onNewPageState(PageState.done);
      });
  }

  private getStaffList(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getStaffList(projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L230', 'getStaffList'),
              } as ServiceError)
          );
          return;
        }

        if (!response.item?.staffList?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen yüklenici için iş çağrısında çalışacak kişi kaydı bulunamadı.',
            details: this.service.formatErrorDetails(
              'L347',
              `${companyCode}:${facilityCode}:${projecCode}:${contractorCode}`
            ),
          } as ServiceError);
          return;
        }

        this.stepData.mapStaffListResponse(response.item);
        this.onNewPageState(PageState.done);
      });
  }

  private getQuestionsList(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedExtraPermissions?.length) {
      return;
    }

    const permissions =
      this.stepData.selectedExtraPermissions
        .filter((x) => x.code !== StaticValues.SELECT_OPTION_NONE_CODE)
        .map((x) => x.code) ?? [];
    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code } = this.stepData.selectedProject;
    this.service
      .getQuestionsForPermissions(permissions)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L178', 'getContractorsOfProject'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen iş izinleri için herhangi bir soru bulunamadı.',
            details: this.service.formatErrorDetails('L389', `${companyCode}:${facilityCode}:${code}`),
          } as ServiceError);
          return;
        }

        this.stepData.controlQuestions.questionGroups = response.items;
        this.onNewPageState(PageState.done);
      });
  }

  private moveToStep(newStep: WPNewStep): void {
    this.currentStep = newStep;
    this.stepTitle = this.service.getStepTitle(newStep);
  }

  private loadStep(): void {
    switch (this.currentStep) {
      case WPNewStep.SelectProject:
        this.inProgressMsg = 'İş çağrıları alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getActiveProjects();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.SelectContractor:
        this.inProgressMsg = 'Yüklenici listesi alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getContractorsOfProject();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.SelectStaff:
        this.inProgressMsg = 'İş çağrısında yer alan kişiler alnıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getStaffList();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.WorkInfo:
      case WPNewStep.WorkType:
      case WPNewStep.Risks:
      case WPNewStep.Equipments:
      case WPNewStep.Ppe:
      case WPNewStep.ExtraPermissions:
      case WPNewStep.GasMeasurement:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.done);
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.QuestionsList:
        this.onNewPageState(PageState.done);
        this.inProgressMsg = 'Veriler alınıyor...';
        if (!this.stepData.controlQuestions.questionGroups?.length) {
          this.onNewPageState(PageState.inprogress);
          this.getQuestionsList();
        } else {
          this.onNewPageState(PageState.done);
        }
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.ReviewApprove:
        this.onNewPageState(PageState.done);
        this.inProgressMsg = 'İş izni formu kaydediliyor...';
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
