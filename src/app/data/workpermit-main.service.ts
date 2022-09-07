import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timer } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { PaginatedListResult, WpListItem, WpStatus } from './workpermit-main.model';
import { ServiceError, ServiceItemResult, WorkPermitItem } from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class WpMainService {
  constructor(private api: WpApiService) {}

  getDefaultErrorMsg(reason?: string): string {
    return `İşlem başarısız. ${reason ?? ''}`;
  }

  formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }

  public loadTablePage(
    status: WpStatus,
    scope: string,
    areaGroup?: string,
    page?: number,
    size?: number
  ): Observable<PaginatedListResult<WpListItem>> {
    const currentPage = page ?? 1;
    const currentSize = currentPage && (size ?? 10);
    return this.api.getWpListByStatus(status as number, scope, areaGroup, currentPage, currentSize).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L47';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'searchWorkAreaByQrCode'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: [],
          page: 0,
          size: 0,
          total: 0,
        } as PaginatedListResult<WpListItem>);
      })
    );
  }

  public deleteWorkPermit(id: number): Observable<ServiceItemResult<void>> {
    return this.api.deleteWp(id).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L156';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'deleteWorkPermit'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceItemResult<void>);
      })
    );
  }

  public getWorkPermitItem(id: number): Observable<ServiceItemResult<WorkPermitItem>> {
    return this.api.getWorkPermitItem(id).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L82';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitItem'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceItemResult<WorkPermitItem>);
      })
    );
  }
}
