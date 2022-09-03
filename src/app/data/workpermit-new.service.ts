import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, switchMap, throwError } from 'rxjs';
import { StaticValues } from './common.model';
import {
  CodeValueItem,
  Project,
  ServiceError,
  ServiceItemResult,
  ServiceListResult,
  WorkAreaInfo,
  WorkDetails,
  WPNewStep,
} from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class WorkpermitNewService {
  mockErrorRetry: number = 0;
  constructor() {}

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
      default:
        return `Adım ${step.toString()}`;
    }
  }

  searchWorkAreaByQrCode(qrCode: string, companyCode: string): Observable<ServiceItemResult<WorkAreaInfo>> {
    const item$ = of({
      result: true,
      item: {
        companyCode: companyCode,
        companyName: 'Pladis Global',
        facilityCode: '123123123123',
        faiclityName: 'Ülker Çamlıca Kampüsü',
        workAreaCode: 'WA_PLADIS_000001',
        workAreaName: 'Çamlıca - Çalışma Alanı #1',
      },
    } as ServiceItemResult<WorkAreaInfo>);

    return item$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L47';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
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

  getActiveProjectsForLocation(
    companyCode: string,
    facilityCode: string,
    workAreaCode: string
  ): Observable<ServiceListResult<Project>> {
    const mockProjects = [];
    for (let i = 1; i < 4; i++) {
      const item = {
        code: `PRJ_000_${i}`,
        name: `İş Çağrısı #${i}`,
        desc: 'İş çağrısı açıklamaları',
        owner: 'Ali Düztaban',
        dtStart: new Date('2022-08-24'),
        dtEnd: new Date('2022-09-14'),
        kind: 'project',
      } as Project;
      mockProjects.push(item);
    }
    const items$ = of({
      result: true,
      items: mockProjects,
    } as ServiceListResult<Project>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L116';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
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

  getContractorsOfProject(
    companyCode: string,
    facilityCode: string,
    projectCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockContractors = [];
    for (let i = 1; i < 3; i++) {
      const item = {
        code: `CONTRACTOR_${i}`,
        name: `Mock Yüklenici #${i} Ltd. Şti.`,
        kind: 'contractor',
      } as CodeValueItem;
      mockContractors.push(item);
    }
    const items$ = of({
      result: true,
      items: mockContractors,
    } as ServiceListResult<CodeValueItem>);
    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L134';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getContractorsOfProject'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getStaffList(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockStaffList = [];
    for (let i = 1; i < 7; i++) {
      const item = {
        code: `STAFF_${i}`,
        name: `Çalışan İsmi #${i}`,
        kind: 'staff',
      } as CodeValueItem;
      mockStaffList.push(item);
    }
    const items$ = of({
      result: true,
      items: mockStaffList,
    } as ServiceListResult<CodeValueItem>);
    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L134';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getStaffList'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getWorkInfo(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceItemResult<WorkDetails>> {
    const item$ = of({
      result: true,
      item: {
        description: 'Çalışma açıklamaları burada yer alacak',
        dtStart: new Date(),
      },
    } as ServiceItemResult<{ description: string; dtStart: Date }>);

    return item$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L223';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkInfo'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceItemResult<WorkDetails>);
      })
    );
  }

  getWorkTypes(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockList = [];
    for (let i = 1; i < 18; i++) {
      const item = {
        code: `WORKTYPE_${i}`,
        name: `İş Türü #${i}`,
        kind: 'worktype',
      } as CodeValueItem;
      mockList.push(item);
    }

    mockList.push({
      code: StaticValues.SELECT_OPTION_NONE_CODE,
      name: StaticValues.SELECT_OPTION_NONE_VALUE,
      kind: 'worktype',
    });

    const items$ = of({
      result: true,
      items: mockList,
    } as ServiceListResult<CodeValueItem>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L261';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkTypes'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getRisks(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockList = [];
    for (let i = 1; i < 6; i++) {
      const item = {
        code: `RISK_${i}`,
        name: `Tehlike veya kaza riski #${i}`,
        kind: 'risk',
      } as CodeValueItem;
      mockList.push(item);
    }

    mockList.push({
      code: StaticValues.SELECT_OPTION_NONE_CODE,
      name: StaticValues.SELECT_OPTION_NONE_VALUE,
      kind: 'risk',
    });

    const items$ = of({
      result: true,
      items: mockList,
    } as ServiceListResult<CodeValueItem>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L326';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getRisks'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getEquipments(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockList = [];
    for (let i = 1; i < 6; i++) {
      const item = {
        code: `EQUIPMENT_${i}`,
        name: `Makine veya ekipman #${i}`,
        kind: 'equipment',
      } as CodeValueItem;
      mockList.push(item);
    }

    mockList.push({
      code: StaticValues.SELECT_OPTION_NONE_CODE,
      name: StaticValues.SELECT_OPTION_NONE_VALUE,
      kind: 'equipment',
    });

    const items$ = of({
      result: true,
      items: mockList,
    } as ServiceListResult<CodeValueItem>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L355';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getEquipments'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getPpe(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockList = [];
    for (let i = 1; i < 6; i++) {
      const item = {
        code: `PPE_${i}`,
        name: `Kişisel koruyucu donanım #${i}`,
        kind: 'ppe',
      } as CodeValueItem;
      mockList.push(item);
    }

    mockList.push({
      code: StaticValues.SELECT_OPTION_NONE_CODE,
      name: StaticValues.SELECT_OPTION_NONE_VALUE,
      kind: 'ppe',
    });

    const items$ = of({
      result: true,
      items: mockList,
    } as ServiceListResult<CodeValueItem>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L400';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getPpe'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }

  getExtraPermissions(
    companyCode: string,
    facilityCode: string,
    projectCode: string,
    contractorCode: string
  ): Observable<ServiceListResult<CodeValueItem>> {
    const mockList = [];
    for (let i = 1; i < 6; i++) {
      const item = {
        code: `WORK_PERMIT_${i}`,
        name: `Özel iş izni #${i}`,
        kind: 'extrawp',
      } as CodeValueItem;
      mockList.push(item);
    }

    mockList.push({
      code: StaticValues.SELECT_OPTION_NONE_CODE,
      name: StaticValues.SELECT_OPTION_NONE_VALUE,
      kind: 'extrawp',
    });

    const items$ = of({
      result: true,
      items: mockList,
    } as ServiceListResult<CodeValueItem>);

    return items$.pipe(
      delay(500),
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L445';
        const error: ServiceError = {
          message: err.error?.message ?? err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getExtraPermissions'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceListResult<CodeValueItem>);
      })
    );
  }
}
