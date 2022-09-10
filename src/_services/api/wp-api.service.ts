import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, fromEvent, map, Observable, switchMap, take, takeUntil, timer } from 'rxjs';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { PaginatedListResult, WpListItem, WpStatus } from 'src/app/data/workpermit-main.model';
import {
  CodeValueItem,
  Project,
  QuestionGroup,
  ServiceItemResult,
  ServiceListResult,
  StaffListResponse,
  SummaryStatsItem,
  WorkAreaInfo,
  WorkPermitItem,
  WpFormResponseItem,
  WpFormType,
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

  public sendWorPermitToApprove(postData: any): Observable<ServiceItemResult<void>> {
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let _url = `${environment.apiUrl}/workpermit/form/save?token=` + token;
        return this.httpClient.post<any>(_url, postData).pipe(
          switchMap(() => {
            return this.onBackToDashboard();
          })
        );
      })
    );
  }

  public getSummaryStats(scope: string, aregroup?: string): Observable<ServiceItemResult<SummaryStatsItem>> {
    let _url = `${environment.apiUrl}/workpermit/summary/stats`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('scope', scope);
        if (aregroup?.length) {
          params = params.append('aregroup', aregroup);
        }
        params = params.append('token', token);
        return this.httpClient.get<SummaryStatsItem>(_url, { params }).pipe(
          map((response) => {
            return { result: true, item: response } as ServiceItemResult<SummaryStatsItem>;
          })
        );
      })
    );
  }

  public getWpListByStatus(
    status: WpStatus,
    scope: string,
    aregroup?: string,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedListResult<WpListItem>> {
    let _url = `${environment.apiUrl}/workpermit/list/byStatus`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('status', status.toString());
        params = params.append('scope', scope);
        params = params.append('page', page.toString());
        params = params.append('size', size.toString());
        if (aregroup?.length) {
          params = params.append('aregroup', aregroup);
        }
        params = params.append('token', token);
        return this.httpClient.get<any>(_url, { params }).pipe(
          map((response) => {
            const { page, size, total, items } = response;
            return { page, size, total, items } as PaginatedListResult<WpListItem>;
          })
        );
      }),
      map((page: any) => {
        const items = page.items ?? [];
        const list: WpListItem[] = [];
        items.forEach((item: any) => {
          const mapped: WpListItem = {
            id: item.Id,
            dtCreate: item.dtCreate,
            dtEnd: item.dtEnd,
            dtStart: item.dtStart,
            owner: item.ownerName,
            ownerCode: item.ownerCode,
            contractor: item.contractor,
            status: item.status,
            workArea: item.area,
            workAreaGroup: item.areaGroupName,
            staff: (item.staff ?? []).map((p: any) => p.name),
            permissions: (item.permissions ?? []).map((p: any) => p.name),
            project: item.project,
            projectOwner: item.projectOwner,
            areaApproved: (item.isAreaApproved ?? 0) > 0,
            isgApproved: (item.isgApproved ?? 0) > 0,
            isExtended: (item.isExtended ?? 0) > 0 || (item.isSecondExtended ?? 0) > 0,
          };
          list.push(mapped);
        });
        const result: PaginatedListResult<WpListItem> = {
          result: true,
          total: page.total,
          page: page.page,
          size: page.size,
          items: list,
        };
        return result;
      })
    );
  }

  public deleteWp(id: number): Observable<ServiceItemResult<void>> {
    let _url = `${environment.apiUrl}/workpermit/item/` + id.toString();
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.delete<any>(_url, { params }).pipe(
          map(() => {
            return { result: true } as ServiceItemResult<void>;
          })
        );
      })
    );
  }

  public getWorkPermitItem(id: number): Observable<ServiceItemResult<WorkPermitItem>> {
    let _url = `${environment.apiUrl}/workpermit/itemget/` + id;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        return this.httpClient.get<WorkPermitItem>(_url, { params }).pipe(
          map((item) => {
            return { result: true, item } as ServiceItemResult<WorkPermitItem>;
          })
        );
      })
    );
  }

  public getWorkPermitItemPdf(id: number): Observable<any> {
    let _url = `${environment.apiUrl}/workpermit/itempdf/` + id;

    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('token', token);
        const options = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
          params,
          observe: 'response' as 'body',
          responseType: 'blob' as 'json',
        };
        return this.httpClient.get<any>(_url, options);
      })
    );
  }

  public getWorkPermitsToApproveForArea(areaCode: string, kind: string): Observable<ServiceListResult<WpListItem>> {
    let _url = `${environment.apiUrl}/workpermit/approve/items`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('areacode', areaCode);
        params = params.append('kind', kind);
        params = params.append('token', token);
        return this.httpClient.get<WpListItem[]>(_url, { params }).pipe(
          map((items) => {
            const list: WpListItem[] = [];
            items.forEach((item: any) => {
              const mapped: WpListItem = {
                id: item.Id,
                dtCreate: item.dtCreate,
                dtEnd: item.dtEnd,
                dtStart: item.dtStart,
                owner: item.ownerName,
                ownerCode: item.ownerCode,
                contractor: item.contractor,
                status: item.status,
                workArea: item.area,
                workAreaGroup: item.areaGroupName,
                staff: (item.staff ?? []).map((p: any) => p.name),
                permissions: (item.permissions ?? []).map((p: any) => p.name),
                project: item.project,
                projectOwner: item.projectOwner,
                areaApproved: (item.isAreaApproved ?? 0) > 0,
                isgApproved: (item.isgApproved ?? 0) > 0,
              };
              list.push(mapped);
            });
            return { result: true, items: list } as ServiceListResult<WpListItem>;
          })
        );
      })
    );
  }

  public getWorkPermitsToExtendForArea(areaCode: string): Observable<ServiceListResult<WpListItem>> {
    let _url = `${environment.apiUrl}/workpermit/extend/items`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('areacode', areaCode);
        params = params.append('token', token);
        return this.httpClient.get<WpListItem[]>(_url, { params }).pipe(
          map((items) => {
            const list: WpListItem[] = [];
            items.forEach((item: any) => {
              const mapped: WpListItem = {
                id: item.Id,
                dtCreate: item.dtCreate,
                dtEnd: item.dtEnd,
                dtStart: item.dtStart,
                owner: item.ownerName,
                ownerCode: item.ownerCode,
                contractor: item.contractor,
                status: item.status,
                workArea: item.area,
                workAreaGroup: item.areaGroupName,
                staff: (item.staff ?? []).map((p: any) => p.name),
                permissions: (item.permissions ?? []).map((p: any) => p.name),
                project: item.project,
                projectOwner: item.projectOwner,
                areaApproved: (item.isAreaApproved ?? 0) > 0,
                isgApproved: (item.isgApproved ?? 0) > 0,
                isExtended: (item.isExtended ?? 0) > 0 || (item.isSecondExtended ?? 0) > 0,
              };
              list.push(mapped);
            });
            return { result: true, items: list } as ServiceListResult<WpListItem>;
          })
        );
      })
    );
  }

  public sendApproveResult(postData: any, kind: string): Observable<ServiceItemResult<void>> {
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let _url = `${environment.apiUrl}/workpermit/item/${postData.id}/approve/${kind}?token=` + token;
        return this.httpClient.post<any>(_url, postData).pipe(
          switchMap(() => {
            return this.onBackToDashboard();
          })
        );
      })
    );
  }

  public sendExtendApprove(postData: any): Observable<ServiceItemResult<void>> {
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let _url = `${environment.apiUrl}/workpermit/item/${postData.id}/extend?token=` + token;
        return this.httpClient.post<any>(_url, postData).pipe(
          switchMap(() => {
            return this.onBackToDashboard();
          })
        );
      })
    );
  }

  public sendWpForm(postData: any, formType: WpFormType, id: number): Observable<ServiceItemResult<void>> {
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let _url = `${environment.apiUrl}/workpermit/formType/${formType}/workpermit/${id}?token=` + token;
        return this.httpClient.post<any>(_url, postData).pipe(
          switchMap(() => {
            return this.onBackToDashboard();
          })
        );
      })
    );
  }

  public getWorkPermitsForFormType(
    areaCode: string,
    formType: number
  ): Observable<ServiceItemResult<WpFormResponseItem>> {
    let _url = `${environment.apiUrl}/workpermit/formType/${formType}/workpermits`;
    return this.refreshAccessToken().pipe(
      switchMap((token) => {
        let params: HttpParams = new HttpParams();
        params = params.append('areacode', areaCode);
        params = params.append('token', token);
        return this.httpClient.get<WpFormResponseItem>(_url, { params }).pipe(
          map((response) => {
            const list: WpListItem[] = [];
            const items = response.wplist;
            items.forEach((item: any) => {
              const mapped: WpListItem = {
                id: item.Id,
                dtCreate: item.dtCreate,
                dtEnd: item.dtEnd,
                dtStart: item.dtStart,
                owner: item.ownerName,
                ownerCode: item.ownerCode,
                contractor: item.contractor,
                status: item.status,
                workArea: item.area,
                workAreaGroup: item.areaGroupName,
                staff: (item.staff ?? []).map((p: any) => p.name),
                permissions: (item.permissions ?? []).map((p: any) => p.name),
                project: item.project,
                projectOwner: item.projectOwner,
                areaApproved: (item.isAreaApproved ?? 0) > 0,
                isgApproved: (item.isgApproved ?? 0) > 0,
              };
              list.push(mapped);
            });
            const item: WpFormResponseItem = {
              wplist: list,
              questionGroups: response.questionGroups,
            };
            return { result: true, item } as ServiceItemResult<WpFormResponseItem>;
          })
        );
      })
    );
  }

  private onBackToDashboard(): Observable<ServiceItemResult<void>> {
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
