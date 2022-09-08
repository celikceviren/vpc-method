import { Component, OnInit } from '@angular/core';
import { InfoDialogData, StaticValues } from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import {
  catchError,
  debounceTime,
  forkJoin,
  map,
  of,
  Subject,
  take,
  takeUntil,
  tap,
  distinctUntilChanged,
  delay,
} from 'rxjs';
import {
  CodeValueItem,
  GasMeasurement,
  QuestionGroup,
  ServiceError,
  WorkPermitItem,
} from 'src/app/data/workpermit.model';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';
import { ActivatedRoute } from '@angular/router';
import { WpRole } from 'src/app/data/workpermit-main.model';
import { Location } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-pladis-workpermit-view',
  templateUrl: './pladis-workpermit-view.component.html',
  styleUrls: ['./pladis-workpermit-view.component.scss'],
})
export class PladisWorkpermitViewComponent implements OnInit {
  private unsubscribeAll = new Subject<void>();
  private companyCode = 'PLADIS';

  id!: number;
  role!: WpRole;
  ready!: boolean;
  activeTab!: number;
  item!: WorkPermitItem;
  gasMeasurements!: GasMeasurement[];

  constructor(
    private service: WpMainService,
    private dialogService: InfoDialogService,
    private splashService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  get permissions(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.workPermits ?? []).map((x) => x.name).join(', ');
  }

  get staff(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.staff ?? []).map((x) => x.name).join(', ');
  }

  get workTypes(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.workTypes ?? []).map((x) => x.name).join(', ');
  }

  get equipments(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.equipments ?? []).map((x) => x.name).join(', ');
  }

  get ppe(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.ppe ?? []).map((x) => x.name).join(', ');
  }

  get risks(): string {
    if (!this.item) {
      return '-';
    }

    return (this.item.risks ?? []).map((x) => x.name).join(', ');
  }

  get questionGroups(): QuestionGroup[] {
    return this.item?.controlQuestions?.questionGroups ?? [];
  }

  get controlNotes(): string {
    const notes = this.item?.controlQuestions?.controlNotes ?? '-';
    if (!notes) return '-';
    return notes;
  }

  get status(): string {
    if (!this.item?.workDescription?.status) {
      return '';
    }

    return this.service.getStatusText(this.item.workDescription.status.toString());
  }

  get owner(): string {
    return this.item?.workDescription?.owner ?? '-';
  }

  get createdAt(): Date | null {
    return this.item?.workDescription?.dtCreate ?? null;
  }

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

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTab = event.index;
  }

  private init(): void {
    const dialogData: InfoDialogData = {
      body: 'Veriler alınıyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);

    this.service
      .getWorkPermitItem(this.id)
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
        this.gasMeasurements = this.prepareGasMeasurements(this.item?.gasMeasurements);
        this.activeTab = 0;
        this.ready = true;
      });
  }

  private prepareGasMeasurements(measurements: any[]): GasMeasurement[] {
    return (measurements ?? []).map((x) => {
      const { code, value } = x;
      let label = code;
      let hint = '';
      if (code === StaticValues.GAS_MEASUREMENT_CH4_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_CH4_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_CH4_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_CO_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_CO_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_CO_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_H2S_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_H2S_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_H2S_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_O2_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_O2_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_O2_HINT;
      }
      if (code === StaticValues.GAS_MEASUREMENT_VOC_CODE.toString()) {
        label = StaticValues.GAS_MEASUREMENT_VOC_TEXT;
        hint = StaticValues.GAS_MEASUREMENT_VOC_HINT;
      }
      return {
        code,
        label,
        value,
        hint,
      } as GasMeasurement;
    });
  }
}
