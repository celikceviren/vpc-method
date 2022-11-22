import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, fromEvent, map, Observable, of, switchMap, take, takeUntil, timer } from 'rxjs';
import {
  CtrReviewForm,
  CtrReviewFormAnswerItem,
  CtrReviewFormItem,
  CtrReviewItem,
  CtrReviewStatsItem,
  CtrReviewStatus,
} from 'src/app/data/ctr-main.model';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { PaginatedListResult } from 'src/app/data/workpermit-main.model';
import { ServiceItemResult } from 'src/app/data/workpermit.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CtrApiService {
  constructor(private httpClient: HttpClient, private windowMsgService: WindowMsgService) {}

  public getUserStats(): Observable<ServiceItemResult<CtrReviewStatsItem>> {
    let _url = `${environment.apiUrl}/contractor_review/stats/byUser/current`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<CtrReviewStatsItem>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<CtrReviewStatsItem>;
          })
        );
      })
    );
  }

  public getProjectStats(projectCode: string): Observable<ServiceItemResult<CtrReviewStatsItem>> {
    let _url = `${environment.apiUrl}/contractor_review/stats/byProject/${projectCode}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<CtrReviewStatsItem>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<CtrReviewStatsItem>;
          })
        );
      })
    );
  }

  public getContractorStats(contractorCode: string): Observable<ServiceItemResult<CtrReviewStatsItem>> {
    let _url = `${environment.apiUrl}/contractor_review/stats/byContractor/${contractorCode}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<CtrReviewStatsItem>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<CtrReviewStatsItem>;
          })
        );
      })
    );
  }

  public getReviewsListByStatus(
    status: CtrReviewStatus,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedListResult<CtrReviewItem>> {
    let _url = `${environment.apiUrl}/contractor_review/list/byUser/current`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('status', status.toString());
        params = params.append('page', page.toString());
        params = params.append('size', size.toString());
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const { page, size, total, items } = response;
            return { page, size, total, items } as PaginatedListResult<CtrReviewItem>;
          })
        );
      }),
      map((resp) => {
        const result: PaginatedListResult<CtrReviewItem> = {
          result: true,
          total: resp.total,
          page: resp.page,
          size: resp.size,
          items: resp.items,
        };
        return result;
      })
    );
  }

  public getProjectReviewsListByStatus(
    projectCode: string,
    status: CtrReviewStatus,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedListResult<CtrReviewItem>> {
    let _url = `${environment.apiUrl}/contractor_review/list/byProject/${projectCode}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('status', status.toString());
        params = params.append('page', page.toString());
        params = params.append('size', size.toString());
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const { page, size, total, items } = response;
            return { page, size, total, items } as PaginatedListResult<CtrReviewItem>;
          })
        );
      }),
      map((resp) => {
        const result: PaginatedListResult<CtrReviewItem> = {
          result: true,
          total: resp.total,
          page: resp.page,
          size: resp.size,
          items: resp.items,
        };
        return result;
      })
    );
  }

  public getContractorReviewsListByStatus(
    contractorCode: string,
    status: CtrReviewStatus,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedListResult<CtrReviewItem>> {
    let _url = `${environment.apiUrl}/contractor_review/list/byContractor/${contractorCode}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('status', status.toString());
        params = params.append('page', page.toString());
        params = params.append('size', size.toString());
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const { page, size, total, items } = response;
            return { page, size, total, items } as PaginatedListResult<CtrReviewItem>;
          })
        );
      }),
      map((resp) => {
        const result: PaginatedListResult<CtrReviewItem> = {
          result: true,
          total: resp.total,
          page: resp.page,
          size: resp.size,
          items: resp.items,
        };
        return result;
      })
    );
  }

  public getFormForReview(reviewId: number): Observable<ServiceItemResult<CtrReviewForm>> {
    let _url = `${environment.apiUrl}/contractor_review/forms/byReview/${reviewId}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<CtrReviewForm>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<CtrReviewForm>;
          })
        );
      })
    );
  }

  public getOwnerFormsForProject(projectCode: string): Observable<ServiceItemResult<CtrReviewForm[]>> {
    let _url = `${environment.apiUrl}/contractor_review/forms/byProject/${projectCode}`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<CtrReviewForm[]>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<CtrReviewForm[]>;
          })
        );
      })
    );
  }

  public saveReview(reviewId: number, postData: CtrReviewFormAnswerItem[]): Observable<ServiceItemResult<void>> {
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let _url = `${environment.apiUrl}/contractor_review/forms/save/${reviewId}?token=` + token;
        return this.httpClient.post<any>(_url, { answers: postData }).pipe(
          switchMap(() => {
            return this.onBackToDashboard();
          })
        );
      })
    );
  }

  private onBackToDashboard(): Observable<ServiceItemResult<void>> {
    this.postMsg('backtoctreviewdashboard');
    return fromEvent(window, 'message').pipe(
      takeUntil(timer(45000)),
      filter((e: any) => {
        const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
        if (!isValidSource) {
          return false;
        }
        return e?.data?.action === 'backtoctreviewdashboard';
      }),
      take(1),
      map((e: any) => {
        const resp: ServiceItemResult<void> = { result: true };
        return resp;
      })
    );
  }

  private refreshAccessToken(): Observable<string> {
    this.postMsg('refreshtoken');
    return fromEvent(window, 'message').pipe(
      takeUntil(timer(5000)),
      filter((e: any) => {
        const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
        if (!isValidSource) {
          return false;
        }
        return e?.data?.action === 'refreshtoken';
      }),
      take(1),
      map((e: any) => (e?.data?.token ?? '') as string)
    );
  }

  private postMsg(msg: string, data?: any): void {
    const targetOrigin = `${this.windowMsgService.getSourceOrigin('/')}`;
    parent.postMessage(
      {
        action: msg,
        data,
      },
      targetOrigin
    );
  }
}
