import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, take, tap, timer } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { InfoDialogData } from './common.model';
import { InfoDialogService } from './info-dialog.service';
import { PaginatedListResult, WpListItem, WpStatus } from './workpermit-main.model';
import { ServiceError, ServiceItemResult, WorkPermitItem } from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class WpMainService {
  constructor(private api: WpApiService, private dialogService: InfoDialogService) {}

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
    project?: string,
    page?: number,
    size?: number
  ): Observable<PaginatedListResult<WpListItem>> {
    const currentPage = page ?? 1;
    const currentSize = currentPage && (size ?? 10);
    return this.api.getWpListByStatus(status as number, scope, areaGroup, project, currentPage, currentSize).pipe(
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
          item: undefined,
        } as ServiceItemResult<WorkPermitItem>);
      })
    );
  }

  public getWorkPermitItemPdf(id: number): Observable<boolean> {
    const dialogData: InfoDialogData = {
      body: 'Veriler alınıyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);

    return this.api.getWorkPermitItemPdf(id).pipe(
      take(1),
      tap(() => this.dialogService.hide()),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L105';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitItemPdf'),
          error: err,
        };

        const dialogData: InfoDialogData = {
          title: 'İşlem başarısız',
          body: `${error.message}<br /><small>${error.details}</small>`,
          dismissable: true,
        };

        setTimeout(() => {
          this.dialogService.show(dialogData);
        }, 500);

        return of(null);
      }),
      map((result) => {
        if (!result) {
          return false;
        }

        const contentDisposition = result.headers.get('Content-Disposition');
        let filename = new Date().getUTCMilliseconds().toString() + '.pdf';
        if (contentDisposition && contentDisposition.split('=').length === 2) {
          filename = `${contentDisposition.split('=')[1]}`;
        }
        var blob = new Blob([result.body], { type: 'application/pdf' });

        const data = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );

        setTimeout(function () {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
          link.remove();
        }, 100);

        return true;
      })
    );
  }

  public getStatusText(status: string): string {
    switch (status) {
      case WpStatus.ACTIVE.toString():
        return 'AKTİF';
      case WpStatus.PENDING.toString():
        return 'ONAY BEKLİYOR';
      case WpStatus.CLOSED.toString():
        return 'KAPALI';
      case WpStatus.REJECTED.toString():
        return 'ONAYLANMADI';
    }
    return status;
  }
}
