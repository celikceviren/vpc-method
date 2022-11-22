import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin, map, Subject, take, takeUntil } from 'rxjs';
import { CtrMainTableDataSource } from 'src/app/data/ctr-main-table-source';
import {
  CtrReviewFormParamType,
  CtrReviewItem,
  CtrReviewListScope,
  CtrReviewStatsItem,
  CtrReviewStatus,
} from 'src/app/data/ctr-main.model';
import { CtrMainService } from 'src/app/data/ctr-main.service';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { CtrApiService } from 'src/_services/api/ctr-api.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-common-ctreview-main',
  templateUrl: './common-ctreview-main.component.html',
  styleUrls: ['./common-ctreview-main.component.scss'],
})
export class CommonCtreviewMainComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();
  companyCode!: string;
  hideDashboard!: boolean;
  scope!: CtrReviewListScope;
  project!: string;
  contractor!: string;
  dashboardLoading: boolean = true;
  stats!: CtrReviewStatsItem;
  tableDs!: CtrMainTableDataSource;
  currentPage: number = 1;
  pageSize: number = 10;
  mobileViewBreak: number = 960;
  isMobileView!: boolean;
  showStatus!: CtrReviewStatus[];
  visibleStatus!: CtrReviewStatus;
  columns: string[] = ['id', 'dtCreate', 'contractor', 'project', 'reviewer', 'rating', 'action'];
  mobileColumns: string[] = ['mobiledata'];
  statuses = CtrReviewStatus;
  scopes = CtrReviewListScope;
  detailsView!: boolean;
  detailsItem!: CtrReviewItem | undefined;

  @ViewChild('focus', { read: ElementRef }) tableInput!: ElementRef;

  get pendingTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === CtrReviewStatus.PENDING) >= 0;
  }

  get completedTab(): boolean {
    return (this.showStatus ?? []).findIndex((x) => x === CtrReviewStatus.COMPLETED) >= 0;
  }

  get singleTab(): boolean {
    return (this.showStatus ?? []).length < 2;
  }

  get dateHeader(): string {
    return this.visibleStatus === CtrReviewStatus.PENDING ? 'Kayıt Tarihi' : 'Değerlendirme Tarihi';
  }

  constructor(
    private splashService: SplashScreenService,
    private service: CtrMainService,
    private windowService: WindowMsgService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: InfoDialogService,
    private api: CtrApiService,
    private host: ElementRef
  ) {}

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
        const status = queryMap.get('status') ?? '0,1';
        this.showStatus = status.split(',').map((x) => parseInt(x, 10));
        const scope = queryMap.get('scope') ?? CtrReviewListScope.USER;
        if ((<any>Object).values(CtrReviewListScope).includes(scope)) {
          this.scope = scope as CtrReviewListScope;
        } else {
          this.scope = CtrReviewListScope.USER;
        }
        this.contractor = queryMap.get('contractor') ?? '';
        this.project = queryMap.get('project') ?? '';
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
    this.awaitHeightChange();
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (this.scope !== CtrReviewListScope.USER) {
      if (event.index === 0) {
        this.visibleStatus = CtrReviewStatus.COMPLETED;
      } else {
        this.visibleStatus = CtrReviewStatus.PENDING;
      }
    } else {
      if (event.index === 0) {
        this.visibleStatus = CtrReviewStatus.PENDING;
      } else {
        this.visibleStatus = CtrReviewStatus.COMPLETED;
      }
    }

    this.initTable(this.visibleStatus);
  }

  onPaginatorChanged(event: PageEvent): void {
    this.tableDs.changePage(event.pageIndex + 1, event.pageSize);
    setTimeout(() => this.tableInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  onViewCompletedReview(id: number): void {
    if (!this.tableDs) {
      return;
    }
    const item = this.tableDs.findItem(id);
    if (!item || this.detailsView) {
      return;
    }

    this.detailsView = true;
    this.detailsItem = item;
  }

  onCloseDetails(): void {
    this.detailsView = false;
    this.detailsItem = undefined;
  }

  onAddReview(id: number): void {
    this.router.navigate(['/', 'ctreview', 'form', this.companyCode, CtrReviewFormParamType.REVIEW, id]);
    return;
  }

  getRatingValueText(value: number): string {
    return this.service.getReviewFormValueTextForCompany(this.companyCode, value);
  }

  private init(): void {
    this.splashService.hide();
    if (this.scope !== CtrReviewListScope.USER && this.showStatus.some((x) => x === CtrReviewStatus.COMPLETED)) {
      this.visibleStatus = CtrReviewStatus.COMPLETED;
    } else {
      this.visibleStatus = this.showStatus[0];
    }
    this.initTable(this.visibleStatus);

    if (!this.hideDashboard) {
      this.service
        .loadStats(this.scope, this.project ?? '', this.contractor ?? '')
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((stats) => {
          this.stats = stats.item ?? ({ pending: 0, completed: 0 } as CtrReviewStatsItem);
          setTimeout(() => {
            this.dashboardLoading = false;
          }, 0);
        });
    }
  }

  private initTable(status: CtrReviewStatus): void {
    this.tableDs = new CtrMainTableDataSource(this.service, status, this.scope, this.project, this.contractor);
  }

  private awaitHeightChange(): void {
    this.height$.pipe(distinctUntilChanged(), debounceTime(200)).subscribe((newHeight) => {
      if (this.scope === CtrReviewListScope.PROJECT && this.project) {
        this.windowService.postMsg('newheight', { height: newHeight });
      }
      if (this.scope === CtrReviewListScope.CONTRACTOR && this.contractor) {
        this.windowService.postMsg('newheight', { height: newHeight });
      }
      if (this.detailsView) {
        this.windowService.postMsg('newheight', { height: newHeight });
      }
    });

    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      this.height$.next(height);
    });

    observer.observe(this.host.nativeElement);
  }
}
