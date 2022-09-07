import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { PaginatedListResult, WpListItem, WpStatus } from './workpermit-main.model';

@Injectable({
  providedIn: 'root',
})
export class WpMainService {
  private mockList: WpListItem[] = [];
  private mockListData(status: WpStatus): WpListItem[] {
    const list: WpListItem[] = [];
    for (var i = 0; i < 36; i++) {
      const wp: WpListItem = {
        id: i + 1,
        project: `İş Çağrısı #${i}`,
        projectOwner: `İş Sahibi #${i}`,
        owner: `İzin Oluşturan #${i}`,
        ownerCode: '',
        status,
        workArea: `Alan #${i}`,
        workAreaGroup: `Bölge #${i}`,
        permissions: ['Genel', 'Yüksekte Çalışma'],
        staff: ['John Doe', 'Alissa Martin', 'Anton Hirsch'],
        dtCreate: new Date(),
        dtStart: new Date(),
        dtEnd: new Date(),
        isgApproved: true,
        areaApproved: true,
      };
      list.push(wp);
    }
    return list;
  }

  public loadTablePage(status: WpStatus, page?: number, size?: number): Observable<PaginatedListResult<WpListItem>> {
    const currentPage = page ?? 1;
    const currentSize = currentPage && (size ?? 10);
    this.mockList = this.mockListData(status);
    return timer(1500).pipe(
      map(() => {
        const sliceStart = (currentPage - 1) * currentSize;
        const sliceEnd =
          sliceStart + currentSize > this.mockList.length ? this.mockList.length : sliceStart + currentSize;
        const item: PaginatedListResult<WpListItem> = {
          result: true,
          page: currentPage,
          size: currentSize,
          total: this.mockList.length,
          items: this.mockList.slice(sliceStart, sliceEnd),
        };
        return item;
      })
    );
  }
}
