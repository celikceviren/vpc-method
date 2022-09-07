import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map, Subject, take } from 'rxjs';
import { WpMainTableDataSource } from 'src/app/data/workpermit-main-table-source';
import { WpListItem, WpRole, WpScope, WpStatus } from 'src/app/data/workpermit-main.model';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-common-workpermit-main',
  templateUrl: './common-workpermit-main.component.html',
  styleUrls: ['./common-workpermit-main.component.scss'],
})
export class WorkpermitMainComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();

  companyCode!: string;
  hideDashboard!: boolean;
  showStatus!: WpStatus[];
  scope!: WpScope;
  role!: WpRole;
  dashboardLoading: boolean = true;
  listPage!: WpListItem[];
  tableDs!: WpMainTableDataSource;
  currentPage: number = 1;
  pageSize: number = 10;
  mobileViewBreak: number = 960;
  isMobileView!: boolean;
  columns: string[] = ['id', 'owner', 'project', 'dtWp', 'permissions', 'staff', 'action'];
  mobileColumns: string[] = ['mobiledata'];

  @ViewChild('focus', { read: ElementRef }) tableInput!: ElementRef;

  constructor(
    private splashService: SplashScreenService,
    private service: WpMainService,
    private activatedRoute: ActivatedRoute
  ) {}

  get pendingTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === WpStatus.PENDING) >= 0;
  }

  get activeTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === WpStatus.ACTIVE) >= 0;
  }

  get closedTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === WpStatus.CLOSED) >= 0;
  }

  get rejectedTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === WpStatus.REJECTED) >= 0;
  }

  get singleTab(): boolean {
    return (this.showStatus ?? []).length < 2;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobileView = window.innerWidth < this.mobileViewBreak;
  }

  ngOnInit(): void {
    const querySub = this.activatedRoute.queryParamMap.pipe(
      take(1),
      map((queryMap) => {
        const isHideValue = parseInt(queryMap.get('hide_dashboard') ?? '0');
        this.hideDashboard = isNaN(isHideValue) || isHideValue > 0;
        const status = queryMap.get('status') ?? '1,2,3,4';
        this.showStatus = status.split(',').map((x) => parseInt(x, 10));
        const scope = queryMap.get('scope') ?? WpScope.FACILITY;
        const role = queryMap.get('role') ?? WpRole.VIEWER;
        if ((<any>Object).values(WpScope).includes(scope)) {
          this.scope = scope as WpScope;
        } else {
          this.scope = WpScope.FACILITY;
        }
        if ((<any>Object).values(WpRole).includes(role)) {
          this.role = role as WpRole;
        } else {
          this.role = WpRole.VIEWER;
        }
        return true;
      })
    );

    const paramSub = this.activatedRoute.paramMap.pipe(
      take(1),
      map((paramMap) => {
        this.companyCode = paramMap.get('company') ?? '';
        return true;
      })
    );

    forkJoin([paramSub, querySub]).subscribe(() => {
      if (['PLADIS', 'NESTLE'].findIndex((x) => x === this.companyCode) < 0) {
        return;
      }
      setTimeout(() => {
        this.init();
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit() {
    this.isMobileView = window.innerWidth < this.mobileViewBreak;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.initTable(this.showStatus[event.index]);
  }

  onPaginatorChanged(event: PageEvent): void {
    this.tableDs.changePage(event.pageIndex + 1, event.pageSize);
    setTimeout(() => this.tableInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  private init(): void {
    this.splashService.hide();
    this.initTable(this.showStatus[0]);

    setTimeout(() => {
      this.dashboardLoading = false;
    }, 3000);
  }

  private initTable(status: WpStatus): void {
    this.tableDs = new WpMainTableDataSource(this.service, status);
  }
}
