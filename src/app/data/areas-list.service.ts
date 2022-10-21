import { Injectable } from '@angular/core';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { InfoDialogService } from './info-dialog.service';
import { catchError, map, Observable, of, take, tap, timer } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ServiceError, ServiceItemResult, ServiceListResult } from './workpermit.model';
import { AreaGroupListItem } from './aregroups.model';

@Injectable({
  providedIn: 'root',
})
export class AreasListService {
  constructor(private api: WpApiService, private dialogService: InfoDialogService) {}

  getDefaultErrorMsg(reason?: string): string {
    return `İşlem başarısız. ${reason ?? ''}`;
  }

  formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }

  public getFacilities(): Observable<ServiceListResult<{ id: string; name: string }>> {
    return this.api.getFacilities().pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L25';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getFacilities'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: [],
        } as ServiceListResult<{ id: string; name: string }>);
      })
    );
  }

  public getAllAreaGroups(): Observable<ServiceListResult<AreaGroupListItem>> {
    return this.api.getAreaGroupsList(1, 300).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L48';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getAllAreaGroups'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: [],
        } as ServiceListResult<AreaGroupListItem>);
      }),
      map((resp) => {
        return {
          result: false,
          error: resp?.error,
          items: resp?.items ?? [],
        } as ServiceListResult<AreaGroupListItem>;
      })
    );
  }

  public createArea(name: string, facilityCode: string, areaGroupCode: string): Observable<ServiceItemResult<void>> {
    return this.api.createArea(name, facilityCode, areaGroupCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L79';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'createAreaGroup'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }

  public updateArea(id: number, name: string): Observable<ServiceItemResult<void>> {
    return this.api.updateArea(id, name).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L108';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'updateAreaGroup'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }

  public deleteArea(id: number): Observable<ServiceItemResult<void>> {
    return this.api.deleteArea(id).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L127';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'deleteArea'),
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
