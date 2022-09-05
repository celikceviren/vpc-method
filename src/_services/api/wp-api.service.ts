import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, filter, fromEvent, map, Observable, of, switchMap, take, takeUntil, timer } from 'rxjs';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import {
  CodeValueItem,
  Project,
  QuestionGroup,
  ServiceItemResult,
  ServiceListResult,
  StaffListResponse,
  WorkAreaInfo,
} from 'src/app/data/workpermit.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WpApiService {
  constructor(private httpClient: HttpClient, private windowMsgService: WindowMsgService) {}

  public searchArea(qrcode: string): Observable<ServiceItemResult<WorkAreaInfo>> {
    let _url = `${environment.apiUrl}/workpermit/workarea/search`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('qrcode', qrcode);
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const item: WorkAreaInfo = { ...response };
            return { result: true, item };
          })
        );
      })
    );
  }

  public getActiveProjectsForArea(areaCode: string): Observable<ServiceListResult<Project>> {
    let _url = `${environment.apiUrl}/workpermit/projects/searchByArea`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('areacode', areaCode);
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const items = response.map((x: any) => {
              const item = { ...x, kind: 'project' } as Project;
              return item;
            });
            return { result: true, items } as ServiceListResult<Project>;
          })
        );
      })
    );
  }

  public getContractorsOfProject(projectCode: string): Observable<ServiceListResult<CodeValueItem>> {
    let _url = `${environment.apiUrl}/workpermit/contractors/searchByProject`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('prjcode', projectCode);
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const items = response.map((x: any) => {
              const item = { ...x, kind: 'contractor' } as CodeValueItem;
              return item;
            });
            return { result: true, items } as ServiceListResult<CodeValueItem>;
          })
        );
      })
    );
  }

  public getStaffList(projectCode: string, contractorCode: string): Observable<ServiceItemResult<StaffListResponse>> {
    let _url = `${environment.apiUrl}/workpermit/staff/searchByProjectAndContractor`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('prjcode', projectCode);
        params = params.append('contractor', contractorCode);
        params = params.append('token', token);
        return this.httpClient.get<StaffListResponse>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<StaffListResponse>;
          })
        );
      })
    );
  }

  public getQuestionsForPermissions(permissions: string[]): Observable<ServiceListResult<QuestionGroup>> {
    let _url = `${environment.apiUrl}/workpermit/questionGroups/searchByPermissions`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        if (permissions?.length) {
          params = params.append('permissions', permissions.join(','));
        }
        params = params.append('token', token);
        return this.httpClient.get<QuestionGroup[]>(_url, { params }).pipe(
          map((response) => {
            return { result: true, items: response } as ServiceListResult<QuestionGroup>;
          })
        );
      })
    );
  }

  public sendWorPermitToApprove(postData: any): Observable<ServiceListResult<void>> {
    console.log('sendWorPermitToApprove => postData =>', postData);
    return of(true).pipe(
      delay(5000),
      switchMap(() => {
        return this.onBackToDashboard();
      })
    );
  }

  private onBackToDashboard(): Observable<any> {
    this.postMsg('backtodashboard');
    return fromEvent(window, 'message').pipe(
      takeUntil(timer(45000)),
      filter((e: any) => {
        const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
        if (!isValidSource) {
          return false;
        }
        return e?.data?.action === 'backtodashboard';
      }),
      take(1),
      map((e: any) => (e?.data?.action ?? '') as string)
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
