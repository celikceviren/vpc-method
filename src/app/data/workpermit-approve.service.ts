import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { WpListItem } from './workpermit-main.model';
import {
  ControlQuestions,
  Question,
  ServiceError,
  ServiceItemResult,
  ServiceListResult,
  WpApproveStep,
  WpFormDataItem,
  WpFormResponseItem,
  WpFormStep,
  WpFormType,
  WpListSelectItem,
} from './workpermit.model';

@Injectable({
  providedIn: 'root',
})
export class WorkPermitApproveService {
  constructor(private api: WpApiService) {}

  getDefaultErrorMsg(reason?: string): string {
    return `İşlem başarısız. ${reason ?? ''}`;
  }

  formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }

  getStepTitle(step: WpApproveStep): string {
    switch (step) {
      case WpApproveStep.SelectLocation:
        return 'Adım 1: Çalışma Alanı Seçimi';
      case WpApproveStep.SelectWorkPermit:
        return 'Adım 2: İş İzni Seçimi';
      case WpApproveStep.WorkPermitReview:
        return 'Adım 3: İş İzni Bilgileri';
      case WpApproveStep.Approval:
        return 'Adım 4: Onay Sonucu';
    }
  }

  getExtendStepTitle(step: WpApproveStep): string {
    switch (step) {
      case WpApproveStep.SelectLocation:
        return 'Adım 1: Çalışma Alanı Seçimi';
      case WpApproveStep.SelectWorkPermit:
        return 'Adım 2: İş İzni Seçimi';
      case WpApproveStep.WorkPermitReview:
        return 'Adım 3: İş İzni Bilgileri';
      case WpApproveStep.Approval:
        return 'Adım 4: Süre Uzatma';
    }
  }

  getFormStepTitle(step: WpFormStep): string {
    switch (step) {
      case WpFormStep.SelectLocation:
        return 'Adım 1: Çalışma Alanı Seçimi';
      case WpFormStep.SelectWorkPermit:
        return 'Adım 2: İş İzni Seçimi';
      case WpFormStep.QuestionsList:
        return 'Adım 3: Formu Doldur';
      case WpFormStep.ReviewApprove:
        return 'Adım 4: Gözden Geçir ve Onayla';
    }
  }

  getWorkPermitsToApproveForArea(areaCode: string, kind: string): Observable<ServiceListResult<WpListSelectItem>> {
    return this.api.getWorkPermitsToApproveForArea(areaCode, kind).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L36';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitsToApproveForArea'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<WpListItem>);
      }),
      map((response) => {
        const mappedResponse = {
          result: response.result,
          error: response.error,
          items: [],
        } as ServiceListResult<WpListSelectItem>;
        const mappedItems = (response.items ?? []).map((y) => {
          const item: WpListSelectItem = {
            code: y.id.toString(),
            kind: 'workpermit',
            name: `#${y.id}`,
            self: y,
            staff: (y.staff ?? []).join(', '),
          };
          return item;
        });
        mappedResponse.items = mappedItems;
        return mappedResponse;
      })
    );
  }

  sendApproveResult(postData: { isApprove: boolean; rejectReason: string }, kind: string): Observable<any> {
    return this.api.sendApproveResult(postData, kind).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L81';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'sendApproveResult'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }

  sendExtendApprove(postData: { id: number }): Observable<any> {
    return this.api.sendExtendApprove(postData).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L122';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'sendExtendApprove'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }

  getWorkPermitsToExtendForArea(areaCode: string): Observable<ServiceListResult<WpListSelectItem>> {
    return this.api.getWorkPermitsToExtendForArea(areaCode).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L36';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitsToExtendForArea'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<WpListItem>);
      }),
      map((response) => {
        const mappedResponse = {
          result: response.result,
          error: response.error,
          items: [],
        } as ServiceListResult<WpListSelectItem>;
        const mappedItems = (response.items ?? []).map((y) => {
          const item: WpListSelectItem = {
            code: y.id.toString(),
            kind: 'workpermit',
            name: `#${y.id}`,
            self: y,
            staff: (y.staff ?? []).join(', '),
          };
          return item;
        });
        mappedResponse.items = mappedItems;
        return mappedResponse;
      })
    );
  }

  getWorkPermitsForFormType(areaCode: string, formType: number): Observable<ServiceItemResult<WpFormDataItem>> {
    return this.api.getWorkPermitsForFormType(areaCode, formType).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L36';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitsForFormType'),
          error: err,
        };
        return of({
          result: false,
          error,
          item: undefined,
        } as ServiceItemResult<WpFormResponseItem>);
      }),
      map((response) => {
        const mappedResponse = {
          result: response.result,
          error: response.error,
          item: undefined,
        } as ServiceItemResult<WpFormDataItem>;
        const mappedItems = (response.item?.wplist ?? []).map((y) => {
          const item: WpListSelectItem = {
            code: y.id.toString(),
            kind: 'workpermit',
            name: `#${y.id}`,
            self: y,
            staff: (y.staff ?? []).join(', '),
          };
          return item;
        });
        mappedResponse.item = {
          wplist: mappedItems,
          controlQuestions: { controlNotes: '', questionGroups: response.item?.questionGroups ?? [] },
        };
        return mappedResponse;
      })
    );
  }

  sendFormResult(controlQuestions: ControlQuestions, formType: WpFormType, id: number): Observable<any> {
    const answersArray = controlQuestions.questionGroups.map((groups) => {
      return groups.questions.map((question) => {
        return {
          code: question.code,
          answer: question.answer,
          answerText: question.answerText,
        };
      });
    });
    const postData = {
      notes: controlQuestions.controlNotes,
      answers: answersArray.flat(),
    };
    return this.api.sendWpForm(postData, formType, id).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L248';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'sendApproveResult'),
          error: err,
        };
        return of({
          result: false,
          error,
        } as ServiceItemResult<void>);
      })
    );
  }

  getWorkPermitsToApproveCloseForArea(areaCode: string, kind: string): Observable<ServiceListResult<WpListSelectItem>> {
    return this.api.getWorkPermitsToApproveCloseForArea(areaCode, kind).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L36';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'getWorkPermitsToApproveCloseForArea'),
          error: err,
        };
        return of({
          result: false,
          error,
          items: undefined,
        } as ServiceListResult<WpListItem>);
      }),
      map((response) => {
        const mappedResponse = {
          result: response.result,
          error: response.error,
          items: [],
        } as ServiceListResult<WpListSelectItem>;
        const mappedItems = (response.items ?? []).map((y) => {
          const item: WpListSelectItem = {
            code: y.id.toString(),
            kind: 'workpermit',
            name: `#${y.id}`,
            self: y,
            staff: (y.staff ?? []).join(', '),
          };
          return item;
        });
        mappedResponse.items = mappedItems;
        return mappedResponse;
      })
    );
  }

  sendApproveCloseResult(postData: { isApprove: boolean; rejectReason: string }, kind: string): Observable<any> {
    return this.api.sendApproveCloseResult(postData, kind).pipe(
      catchError((err) => {
        const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L81';
        const error: ServiceError = {
          message:
            err instanceof HttpErrorResponse
              ? err.status === HttpStatusCode.Unauthorized
                ? 'Yetkisiz erişim'
                : err.error?.Message ?? err.error?.ErrorMessage ?? err.status.toString()
              : err.message ?? 'Bilinmeyen hata.',
          details: this.formatErrorDetails(errorCode, 'sendApproveCloseResult'),
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
