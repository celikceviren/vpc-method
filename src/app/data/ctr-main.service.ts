import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, take, tap, timer } from 'rxjs';
import { CtrApiService } from 'src/_services/api/ctr-api.service';
import {
  CtrReviewForm,
  CtrReviewFormAnswerItem,
  CtrReviewItem,
  CtrReviewLegendItem,
  CtrReviewListScope,
  CtrReviewStatsItem,
  CtrReviewStatus,
} from './ctr-main.model';
import { InfoDialogService } from './info-dialog.service';
import { PaginatedListResult } from './workpermit-main.model';
import { ServiceError, ServiceItemResult } from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class CtrMainService {
  constructor(private api: CtrApiService, private dialogService: InfoDialogService) {}

  getDefaultErrorMsg(reason?: string): string {
    return `İşlem başarısız. ${reason ?? ''}`;
  }

  formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }

  public loadStats(
    scope: CtrReviewListScope,
    projectCode: string = '',
    contractorCode: string = ''
  ): Observable<ServiceItemResult<CtrReviewStatsItem>> {
    const getLoader = (scope: CtrReviewListScope): Observable<ServiceItemResult<CtrReviewStatsItem>> => {
      if (scope === CtrReviewListScope.PROJECT) {
        return this.api.getProjectStats(projectCode);
      } else if (scope === CtrReviewListScope.CONTRACTOR) {
        return this.api.getContractorStats(contractorCode);
      } else {
        return this.api.getUserStats();
      }
    };

    return getLoader(scope).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L47';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'loadStats'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: { pending: 0, completed: 0 },
        } as ServiceItemResult<CtrReviewStatsItem>);
      })
    );
  }

  public loadTablePage(
    status: CtrReviewStatus,
    scope: CtrReviewListScope,
    projectCode?: string,
    contractorCode?: string,
    page?: number,
    size?: number
  ): Observable<PaginatedListResult<CtrReviewItem>> {
    const currentPage = page ?? 1;
    const currentSize = currentPage && (size ?? 10);

    const handleError = (err: any): Observable<PaginatedListResult<CtrReviewItem>> => {
      const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L47';
      const error: ServiceError = {
        message:
          err instanceof HttpErrorResponse
            ? err.status === HttpStatusCode.Unauthorized
              ? 'Yetkisiz erişim'
              : err.error?.Message ?? err.status.toString()
            : err.message ?? 'Bilinmeyen hata.',
        details: this.formatErrorDetails(errorCode, 'loadTablePage'),
        error: err,
      };
      return of({
        result: false,
        error,
        items: [],
        page: 0,
        size: 0,
        total: 0,
      } as PaginatedListResult<CtrReviewItem>);
    };

    if (scope === CtrReviewListScope.PROJECT) {
      return this.api.getProjectReviewsListByStatus(projectCode ?? '', status, currentPage, currentSize).pipe(
        catchError((err) => {
          return handleError(err);
        })
      );
    } else if (scope === CtrReviewListScope.CONTRACTOR) {
      return this.api.getContractorReviewsListByStatus(contractorCode ?? '', status, currentPage, currentSize).pipe(
        catchError((err) => {
          return handleError(err);
        })
      );
    } else {
      return this.api.getReviewsListByStatus(status, currentPage, currentSize).pipe(
        catchError((err) => {
          return handleError(err);
        })
      );
    }
  }

  public loadReviewFormForReview(id: number): Observable<ServiceItemResult<CtrReviewForm>> {
    return this.api.getFormForReview(id).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L106';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'loadReviewFormForReview'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: {},
        } as ServiceItemResult<CtrReviewForm>);
      })
    );
  }

  public loadReviewFormsForProject(projectCode: string): Observable<ServiceItemResult<CtrReviewForm[]>> {
    return this.api.getOwnerFormsForProject(projectCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L129';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'loadReviewFormsForProject'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: {},
        } as ServiceItemResult<CtrReviewForm[]>);
      })
    );
  }

  public getReviewPointsInfoForCompany(companyCode: string): Array<CtrReviewLegendItem> {
    const items: Array<CtrReviewLegendItem> = [];
    switch (companyCode) {
      case 'PLADIS':
        items.push({
          min: 0,
          max: 25,
          name: 'Uygulanamaz',
          desc: 'Tedarikçi sözleşmede yer alan şartları fazlasıyla yerine getirdi. Alınan hizmet ve servis başarılıydı.',
        });
        items.push({
          min: 26,
          max: 50,
          name: 'Yetersiz',
          desc: 'Tedarikçi sözleşmede yer alan şartları yerine getirmedi.',
        });
        items.push({
          min: 51,
          max: 70,
          name: 'Orta',
          desc: 'Tedarikçi sözleşmede yer alan şartları planlanan zaman diliminde yerine getirmedi. İşlem gecikmeyle tamamlandı.',
        });
        items.push({
          min: 71,
          max: 85,
          name: 'İyi',
          desc: 'Tedarikçi sadece sözleşmede yer alan şartları yerine getirdi.',
        });
        items.push({
          min: 86,
          max: 100,
          name: 'Çok iyi',
          desc: 'Tedarikçi sözleşmede yer alan şartları fazlasıyla yerine getirdi. Alınan hizmet ve servis başarılıydı.',
        });
        break;
    }

    return items;
  }

  public getReviewFormValueTextForCompany(companyCode: string, value: number): string {
    switch (companyCode) {
      case 'PLADIS':
        const pladisItems = this.getReviewPointsInfoForCompany(companyCode);
        const item = pladisItems.find((x) => x.min <= value && x.max >= value);
        return item?.name ?? '';
    }

    return '';
  }

  public saveReview(reviewId: number, data: CtrReviewFormAnswerItem[]): Observable<ServiceItemResult<void>> {
    return this.api.saveReview(reviewId, data).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L211';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'saveReview'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }
}
