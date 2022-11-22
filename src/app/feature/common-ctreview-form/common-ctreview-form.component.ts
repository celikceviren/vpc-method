import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
import { ConfirmDialogData } from 'src/app/data/common.model';
import {
  CtrReviewForm,
  CtrReviewFormAnswerItem,
  CtrReviewFormParamType,
  CtrReviewFormQuestionItem,
  CtrReviewLegendItem,
} from 'src/app/data/ctr-main.model';
import { CtrMainService } from 'src/app/data/ctr-main.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { ServiceError, ServiceItemResult } from 'src/app/data/workpermit.model';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-common-ctreview-form',
  templateUrl: './common-ctreview-form.component.html',
  styleUrls: ['./common-ctreview-form.component.scss'],
})
export class CommonCtreviewFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();
  loading = true;
  failed!: boolean;
  saving!: boolean;
  error!: ServiceError | undefined;
  companyCode!: string;
  type!: CtrReviewFormParamType;
  reviewId!: number;
  projectCode!: string;
  forms!: Array<CtrReviewForm>;
  activeForm!: CtrReviewForm;
  legendValues!: Array<CtrReviewLegendItem>;
  reviewFormResponse: Array<{ question: CtrReviewFormQuestionItem; answer: CtrReviewFormAnswerItem }> = [];
  max = 100;
  min = 0;
  step = 1;
  avarageValue!: number;
  avarageValueText!: string;

  constructor(
    private location: Location,
    private splashService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private service: CtrMainService,
    private windowService: WindowMsgService,
    private dialog: MatDialog,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe((paramMap) => {
      this.companyCode = paramMap.get('company') ?? '';
      const tmpType = paramMap.get('type') ?? CtrReviewFormParamType.REVIEW;
      if ((<any>Object).values(CtrReviewFormParamType).includes(tmpType)) {
        this.type = tmpType as CtrReviewFormParamType;
      } else {
        this.type = CtrReviewFormParamType.REVIEW;
      }
      const param = paramMap.get('param') ?? '';
      if (this.type === CtrReviewFormParamType.REVIEW) {
        this.reviewId = parseInt(param);
      } else {
        this.projectCode = param;
      }
      this.splashService.hide();
      this.legendValues = this.service.getReviewPointsInfoForCompany(this.companyCode);
      this.init();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
    this.height$.complete();
  }

  ngAfterViewInit() {
    this.awaitHeightChange();
  }

  onBackClick(): void {
    this.location.back();
  }

  onSliderChange(
    item: { question: CtrReviewFormQuestionItem; answer: CtrReviewFormAnswerItem },
    event: MatSliderChange
  ): void {
    item.answer.value = event.value ?? 0;
    item.answer.text = this.service.getReviewFormValueTextForCompany(this.companyCode, event.value ?? 0);

    const totalValue = this.reviewFormResponse.reduce<number>((accumulator, obj) => {
      return accumulator + obj.answer.value;
    }, 0);

    this.avarageValue = parseInt((totalValue / this.reviewFormResponse.length).toFixed(0));
    this.avarageValueText = this.service.getReviewFormValueTextForCompany(this.companyCode, this.avarageValue);
  }

  onSaveReview(): void {
    const msg = 'Yüklenici değerlendirmesini kaydetmek üzeresiniz. Emin misiniz?';
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

      const data: CtrReviewFormAnswerItem[] = this.reviewFormResponse.map((x) => x.answer);
      this.saving = true;
      this.service
        .saveReview(this.activeForm.review?.id ?? 0, data)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((response) => {
          if (!response?.result) {
            this.saving = false;
            this.failed = true;
            this.error =
              response?.error ??
              ({
                message: 'Bilgiler kaydedilemedi',
                details: this.service.formatErrorDetails('L137', 'onSaveReview:sendFormResult'),
              } as ServiceError);

            return;
          }
        });
    });
  }

  onReloadActiveForm(): void {
    this.failed = false;
    this.saving = false;
    this.loading = true;
    this.error = undefined;
    this.init();
  }

  private init(): void {
    const loaded = (resp: ServiceItemResult<CtrReviewForm> | ServiceItemResult<CtrReviewForm[]>) => {
      if (!resp?.result || !resp?.item) {
        this.loading = false;
        this.failed = true;
        this.error = {
          message: 'Değerlendirme formu bilgileri alınamadı',
          details: this.service.formatErrorDetails('L165', 'init:noresponse'),
        } as ServiceError;
        return;
      }

      if (Array.isArray(resp.item)) {
        this.forms = resp.item;
      } else {
        this.forms = [resp.item];
      }

      this.activeForm = this.forms[0];
      if (!this.activeForm.review?.id) {
        this.loading = false;
        this.failed = true;
        this.error = {
          message: 'Değerlendirme formu bilgileri alınamadı',
          details: this.service.formatErrorDetails('L182', 'init:emptyform'),
        } as ServiceError;
        return;
      }
      this.prepareForm();
      this.loading = false;
    };

    if (this.type === CtrReviewFormParamType.REVIEW) {
      this.service
        .loadReviewFormForReview(this.reviewId)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((resp) => {
          loaded(resp);
        });
    } else {
      this.service
        .loadReviewFormsForProject(this.projectCode)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((resp) => {
          loaded(resp);
        });
    }
  }

  private prepareForm(): void {
    (this.activeForm.form?.questions ?? []).forEach((item) => {
      const question = item;
      const answer: CtrReviewFormAnswerItem = {
        questionId: item.id,
        value: 0,
        text: this.service.getReviewFormValueTextForCompany(this.companyCode, 0),
      };
      this.reviewFormResponse.push({ question, answer });
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
