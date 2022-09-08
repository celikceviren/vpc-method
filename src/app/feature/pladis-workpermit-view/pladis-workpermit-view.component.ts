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
  item!: WorkPermitItem;

  constructor(
    private service: WpMainService,
    private dialogService: InfoDialogService,
    private splashService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private location: Location
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
        this.ready = true;
      });
  }
}
