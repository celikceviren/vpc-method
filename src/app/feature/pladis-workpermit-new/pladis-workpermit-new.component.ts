import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmDialogData } from 'src/app/data/common.model';
import { WorkpermitNewService } from 'src/app/data/workpermit-new.service';
import {
  CodeValueItem,
  PageState,
  Project,
  ServiceError,
  WorkDetails,
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
      .searchWorkAreaByQrCode(qrCode, this.companyCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result || !response?.item) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
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

    switch (this.currentStep) {
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
    }
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

  onProjectSelected(item: Project | CodeValueItem): void {
    if (item.kind !== 'project') {
      return;
    }

    this.stepData.selectedProject = item;
    this.moveToStep(WPNewStep.SelectContractor);
    this.loadStep();
  }

  onContractorSelected(item: Project | CodeValueItem): void {
    if (item.kind !== 'contractor') {
      return;
    }

    this.stepData.selectedContractor = item;
    this.moveToStep(WPNewStep.SelectStaff);
    this.loadStep();
  }

  onStaffSelected(items: Array<Project | CodeValueItem>): void {
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

  private getActiveProjects(): void {
    const { companyCode, facilityCode, workAreaCode } = this.stepData.selectedLocation;
    this.service
      .getActiveProjectsForLocation(companyCode, facilityCode, workAreaCode)
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
            details: this.service.formatErrorDetails('L119', `${facilityCode}:${workAreaCode}`),
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
      .getContractorsOfProject(companyCode, facilityCode, code)
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
            details: this.service.formatErrorDetails('L187', `${facilityCode}:${code}`),
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
      .getStaffList(companyCode, facilityCode, projecCode, contractorCode)
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

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Seçilen yüklenici için iş çağrısında çalışacak kişi kaydı bulunamadı.',
            details: this.service.formatErrorDetails('L187', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.staffList = response.items;
        this.stepData.selectedStaff = [];
        this.onNewPageState(PageState.done);
      });
  }

  private getWorkInfo(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getWorkInfo(companyCode, facilityCode, projecCode, contractorCode)
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

        this.stepData.workDescription = {
          description: response?.item?.description ?? '',
          dtStart: response?.item?.dtStart ?? new Date(),
        };
        this.onNewPageState(PageState.done);
      });
  }

  private getWorkTypes(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getWorkTypes(companyCode, facilityCode, projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L353', 'getWorkTypes'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'İş türleri listesinde kayıt bulunamadı.',
            details: this.service.formatErrorDetails('L362', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.workTypeList = response.items;
        this.onNewPageState(PageState.done);
      });
  }

  private getRisks(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getRisks(companyCode, facilityCode, projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L402', 'getRisks'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Tehlike ve kaza riskleri listesinde kayıt bulunamadı.',
            details: this.service.formatErrorDetails('L411', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.riskList = response.items;
        this.onNewPageState(PageState.done);
      });
  }

  private getEquipments(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getEquipments(companyCode, facilityCode, projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L450', 'getEquipments'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Ekipmanlar listesinde kayıt bulunamadı.',
            details: this.service.formatErrorDetails('L459', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.equipmentList = response.items;
        this.onNewPageState(PageState.done);
      });
  }

  private getPpe(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getPpe(companyCode, facilityCode, projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L488', 'getPpe'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Kişisel koruyucu donanımlar listesinde kayıt bulunamadı.',
            details: this.service.formatErrorDetails('L497', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.ppeList = response.items;
        this.onNewPageState(PageState.done);
      });
  }

  private getExtraPermissions(): void {
    if (!this.stepData.selectedProject?.code || !this.stepData.selectedContractor?.code) {
      return;
    }

    const { companyCode, facilityCode } = this.stepData.selectedLocation;
    const { code: projecCode } = this.stepData.selectedProject;
    const { code: contractorCode } = this.stepData.selectedContractor;
    this.service
      .getExtraPermissions(companyCode, facilityCode, projecCode, contractorCode)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this.onNewPageState(
            PageState.failed,
            response?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L526', 'getExtraPermissions'),
              } as ServiceError)
          );
          return;
        }

        if (!response.items?.length) {
          this.onNewPageState(PageState.failed, {
            message: 'Özel iş izinleri listesinde kayıt bulunamadı.',
            details: this.service.formatErrorDetails('L535', `${facilityCode}:${projecCode}:${contractorCode}`),
          } as ServiceError);
          return;
        }

        this.stepData.extraPermissionList = response.items;
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
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkInfo();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.WorkType:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getWorkTypes();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.Risks:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getRisks();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.Equipments:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getEquipments();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.Ppe:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getPpe();
        this.retryProcessFn = this.loadStep.bind(this);
        break;
      case WPNewStep.ExtraPermissions:
        this.inProgressMsg = 'Veriler alınıyor...';
        this.onNewPageState(PageState.inprogress);
        this.getExtraPermissions();
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
