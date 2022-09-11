import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { StaticValues } from './common.model';
import {
  CodeValueItem,
  Project,
  QuestionGroup,
  ServiceError,
  ServiceItemResult,
  ServiceListResult,
  StaffListResponse,
  WorkAreaInfo,
  WPNewStep,
} from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class WorkpermitNewService {
  mockErrorRetry: number = 0;
  constructor(private api: WpApiService) {}

  getDefaultErrorMsg(reason?: string): string {
    return `İşlem başarısız. ${reason ?? ''}`;
  }

  formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }

  getStepTitle(step: WPNewStep): string {
    switch (step) {
      case WPNewStep.SelectLocation:
        return 'Adım 1: Çalışma Alanı Seçimi';
      case WPNewStep.SelectProject:
        return 'Adım 2: İş Çağrısı Seçimi';
      case WPNewStep.SelectContractor:
        return 'Adım 3: Yüklenici Seçimi';
      case WPNewStep.SelectStaff:
        return 'Adım 4: İş İzni Verilecek Kişiler';
      case WPNewStep.WorkInfo:
        return 'Adım 5: Çalışma Bilgileri';
      case WPNewStep.WorkType:
        return 'Adım 6: Yapılacak İş Türü';
      case WPNewStep.Risks:
        return 'Adım 7: Tehlike; Kazaya veya Gıda güvenliğine sebep olabilecek potansiyel ortam ve şartlar';
      case WPNewStep.Equipments:
        return 'Adım 8: Kullanılacak Ekipmanlar';
      case WPNewStep.Ppe:
        return 'Adım 9: Çalışmada Kullanılması Gereken Kişisel Koruyucu Donanımlar';
      case WPNewStep.ExtraPermissions:
        return 'Adım 10: İş İzinleri';
      case WPNewStep.QuestionsList:
        return 'Adım 11: Kontroller';
      case WPNewStep.GasMeasurement:
        return 'Adım 12: Gaz Ölçümleri';
      case WPNewStep.ReviewApprove:
        return 'Adım 13: Gözden Geçir ve Onaya Gönder';
    }
  }

  searchWorkAreaByQrCode(qrCode: string): Observable<ServiceItemResult<WorkAreaInfo>> {
    return this.api.searchArea(qrCode).pipe(
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
          item: undefined,
        } as ServiceItemResult<WorkAreaInfo>);
      })
    );
  }

  getActiveProjectsForLocation(areaCode: string): Observable<ServiceListResult<Project>> {
    return this.api.getActiveProjectsForArea(areaCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L88';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getActiveProjectsForLocation'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<Project>);
      })
    );
  }

  getContractorsOfProject(projectCode: string): Observable<ServiceListResult<CodeValueItem>> {
    return this.api.getContractorsOfProject(projectCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L110';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getContractorsOfProject'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceItemResult<CodeValueItem>);
      })
    );
  }

  getStaffList(projectCode: string, contractorCode: string): Observable<ServiceItemResult<StaffListResponse>> {
    return this.api.getStaffList(projectCode, contractorCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L134';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getStaffList'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceItemResult<StaffListResponse>);
      }),
      map((response) => {
        if (response?.item?.preset) {
          const presetWorkPermits = response.item.preset?.selectedExtraPermissions ?? [];
          if (!presetWorkPermits.length) {
            const none: CodeValueItem = {
              kind: 'extrawp',
              code: StaticValues.SELECT_OPTION_NONE_CODE,
              name: StaticValues.SELECT_OPTION_NONE_VALUE,
            };
            presetWorkPermits.push(none);
          }

          const presetEquipments = response.item.preset?.selectedEquipments ?? [];
          if (!presetEquipments.length) {
            const none: CodeValueItem = {
              kind: 'equipment',
              code: StaticValues.SELECT_OPTION_NONE_CODE,
              name: StaticValues.SELECT_OPTION_NONE_VALUE,
            };
            presetEquipments.push(none);
          }

          const presetPpe = response.item.preset?.selectedPpe ?? [];
          if (!presetPpe.length) {
            const none: CodeValueItem = {
              kind: 'ppe',
              code: StaticValues.SELECT_OPTION_NONE_CODE,
              name: StaticValues.SELECT_OPTION_NONE_VALUE,
            };
            presetPpe.push(none);
          }

          const presetRisks = response.item.preset?.selectedRisks ?? [];
          if (!presetRisks.length) {
            const none: CodeValueItem = {
              kind: 'risk',
              code: StaticValues.SELECT_OPTION_NONE_CODE,
              name: StaticValues.SELECT_OPTION_NONE_VALUE,
            };
            presetRisks.push(none);
          }

          const presetWorkTypes = response.item.preset?.selectedWorkTypes ?? [];
          if (!presetWorkTypes.length) {
            const none: CodeValueItem = {
              kind: 'worktype',
              code: StaticValues.SELECT_OPTION_NONE_CODE,
              name: StaticValues.SELECT_OPTION_NONE_VALUE,
            };
            presetWorkTypes.push(none);
          }
        }
        return response;
      })
    );
  }

  getQuestionsForPermissions(permissions: string[]): Observable<ServiceListResult<QuestionGroup>> {
    return this.api.getQuestionsForPermissions(permissions).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L156';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getQuestionsForPermissions'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceItemResult<CodeValueItem>);
      })
    );
  }

  sendWorPermitToApprove(postData: any): Observable<any> {
    return this.api.sendWorPermitToApprove(postData).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L183';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'sendWorPermitToApprove'),
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
