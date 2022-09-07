import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timer } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { PaginatedListResult, WpListItem, WpStatus } from './workpermit-main.model';
import { ServiceError } from './workpermit.model';

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
}
