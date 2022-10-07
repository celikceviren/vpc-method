import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, forkJoin, map, of, Subject, take, takeUntil, tap, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogData, InfoDialogData } from 'src/app/data/common.model';
import { WpMainTableDataSource } from 'src/app/data/workpermit-main-table-source';
import { PaginatedListResult, WpListItem, WpRole, WpScope, WpStatus } from 'src/app/data/workpermit-main.model';
import { WpMainService } from 'src/app/data/workpermit-main.service';
import { CodeValueItem, ServiceError, ServiceItemResult, SummaryStatsItem } from 'src/app/data/workpermit.model';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { WpCreateTransferComponent } from 'src/app/ui/wp-create-transfer/wp-create-transfer.component';

@Component({
  selector: 'app-common-workpermit-main',
  templateUrl: './common-workpermit-main.component.html',
  styleUrls: ['./common-workpermit-main.component.scss'],
})
export class WorkpermitMainComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();
  companyCode!: string;
  hideDashboard!: boolean;
  showStatus!: WpStatus[];
  scope!: WpScope;
  role!: WpRole;
  areaGroup!: string;
  project!: string;
  dashboardLoading: boolean = true;
  listPage!: WpListItem[];
  tableDs!: WpMainTableDataSource;
  currentPage: number = 1;
  pageSize: number = 10;
  mobileViewBreak: number = 960;
  isMobileView!: boolean;
  columns: string[] = ['id', 'owner', 'project', 'dtWp', 'permissions', 'staff', 'action'];
  mobileColumns: string[] = ['mobiledata'];
  stats!: SummaryStatsItem;
  pendingTransfers!: WpListItem[];
  scopes = WpScope;
  roles = WpRole;
  statuses = WpStatus;
  visibleStatus!: WpStatus;

  @ViewChild('focus', { read: ElementRef }) tableInput!: ElementRef;

  constructor(
    private splashService: SplashScreenService,
    private service: WpMainService,
    private windowService: WindowMsgService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: InfoDialogService,
    private api: WpApiService,
    private host: ElementRef
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
        this.areaGroup = queryMap.get('areaGroup') ?? '';
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
    this.visibleStatus = this.showStatus[event.index];
    this.initTable(this.visibleStatus);
  }

  onPaginatorChanged(event: PageEvent): void {
    this.tableDs.changePage(event.pageIndex + 1, event.pageSize);
    setTimeout(() => this.tableInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  onConfirmDelete(id?: number): void {
    if (id === undefined) {
      throw new Error('onConfirmDelete => id undefined');
    }
    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'Onay bekleyen iş iznini geri almak istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed) {
        return;
      }

      const dialogData: InfoDialogData = {
        body: 'Kaydediliyor...',
        isLoading: true,
      };
      this.dialogService.show(dialogData);
      this.service
        .deleteWorkPermit(id)
        .pipe(
          takeUntil(this.unsubscribeAll),
          take(1),
          tap(() => this.dialogService.hide())
        )
        .subscribe((resp) => {
          if (!resp?.result) {
            const msg =
              resp?.error ??
              ({
                message: 'Veriler alınamadı',
                details: this.service.formatErrorDetails('L175', 'onConfirmDelete'),
              } as ServiceError);

            const dialogData: InfoDialogData = {
              title: 'İşlem başarısız',
              body: `${msg.message}<br /><small>${msg.details}</small>`,
              dismissable: true,
            };
            setTimeout(() => {
              this.dialogService.show(dialogData);
            }, 500);
            return;
          }

          this.tableDs.reloadPage();
        });
    });
  }

  onStartTransfer(id: number): void {
    const dialogData: InfoDialogData = {
      body: 'Veriler alınıyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);
    this.service
      .getUsersForTransfer()
      .pipe(
        takeUntil(this.unsubscribeAll),
        take(1),
        tap(() => this.dialogService.hide())
      )
      .subscribe((resp) => {
        if (!resp?.result) {
          const msg =
            resp?.error ??
            ({
              message: 'Veriler alınamadı',
              details: this.service.formatErrorDetails('L230', 'onStartTransfer'),
            } as ServiceError);

          const dialogData: InfoDialogData = {
            title: 'İşlem başarısız',
            body: `${msg.message}<br /><small>${msg.details}</small>`,
            dismissable: true,
          };
          setTimeout(() => {
            this.dialogService.show(dialogData);
          }, 500);
          return;
        }

        setTimeout(() => {
          this.showTransferWpDialog(id, resp.items ?? []);
        }, 500);
      });
  }

  onGetWorkPermitItem(id?: number): void {
    if (!id) {
      throw new Error('onGetWorkPermitItem => id undefined');
    }

    this.splashService.show();
    setTimeout(() => {
      this.router.navigate(['/', 'workpermit', 'view', this.companyCode, id.toString(), this.role.toString()]);
    });
    return;
  }

  onGetWorkPermitItemAsPdf(id?: number): void {
    if (!id) {
      throw new Error('onGetWorkPermitItemAsPdf => id undefined');
    }

    this.service
      .getWorkPermitItemPdf(id)
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe(() => {});
    return;
  }

  onCancelTransfer(id: number): void {
    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'Onay bekleyen devir işlemini iptal etmek istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed) {
        return;
      }

      const dialogData: InfoDialogData = {
        body: 'Kaydediliyor...',
        isLoading: true,
      };
      this.dialogService.show(dialogData);
      this.service
        .cancelTransfer(id)
        .pipe(
          takeUntil(this.unsubscribeAll),
          take(1),
          tap(() => this.dialogService.hide())
        )
        .subscribe((resp) => {
          if (resp?.error) {
            const msg =
              resp.error ??
              ({
                message: 'İşlem başarısız.',
                details: this.service.formatErrorDetails('L312', 'onCancelTransfer'),
              } as ServiceError);

            const dialogData: InfoDialogData = {
              title: 'İşlem başarısız',
              body: `${msg.message}<br /><small>${msg.details}</small>`,
              dismissable: true,
            };
            setTimeout(() => {
              this.dialogService.show(dialogData);
            }, 500);
            return;
          }

          const dialogData: InfoDialogData = {
            title: 'İşlem başarılı',
            body: `İş izni devir işlemi iptal edildi`,
            dismissable: true,
          };
          setTimeout(() => {
            this.dialogService.show(dialogData);
          }, 500);

          this.tableDs.reloadPage();
        });
    });
  }

  onNavigateToWp(id: number): void {}

  private init(): void {
    this.splashService.hide();
    this.visibleStatus = this.showStatus[0];
    this.initTable(this.visibleStatus);

    if (!this.hideDashboard) {
      this.api
        .getSummaryStats(this.scope, this.areaGroup, this.project)
        .pipe(
          takeUntil(this.unsubscribeAll),
          take(1),
          catchError(() => {
            return of({
              result: true,
              item: { pending: 0, closed: 0, active: 0, rejected: 0 } as SummaryStatsItem,
            } as ServiceItemResult<SummaryStatsItem>);
          })
        )
        .subscribe((stats) => {
          this.stats = stats.item ?? ({ pending: 0, closed: 0, active: 0, rejected: 0 } as SummaryStatsItem);
          setTimeout(() => {
            this.dashboardLoading = false;
          }, 0);
        });
    }

    this.api
      .getPendingTransfers()
      .pipe(
        takeUntil(this.unsubscribeAll),
        take(1),
        catchError(() => {
          return of({
            result: true,
            items: [],
            page: 1,
            size: 0,
            total: 0,
          } as PaginatedListResult<WpListItem>);
        })
      )
      .subscribe((transfers) => {
        this.pendingTransfers = transfers.items ?? [];
      });
  }

  private initTable(status: WpStatus): void {
    this.tableDs = new WpMainTableDataSource(this.service, status, this.scope, this.areaGroup, this.project);
  }

  private showTransferWpDialog(id: number, usersList: CodeValueItem[]): void {
    const dialogRef = this.dialog.open(WpCreateTransferComponent, {
      data: usersList,
      width: '320px',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((user: CodeValueItem) => {
        if (!user) {
          return;
        }

        setTimeout(() => {
          const dialogData: InfoDialogData = {
            body: 'Devir yapılıyor...',
            isLoading: true,
          };
          this.dialogService.show(dialogData);

          this.service
            .createTransfer(id, user.code)
            .pipe(takeUntil(this.unsubscribeAll), take(1))
            .subscribe((response) => {
              this.dialogService.hide();

              if (response?.error) {
                const msg =
                  response.error ??
                  ({
                    message: 'Devir yapılamadı.',
                    details: this.service.formatErrorDetails('L424', 'showTransferWpDialog'),
                  } as ServiceError);

                const dialogData: InfoDialogData = {
                  title: 'İşlem başarısız',
                  body: `${msg.message}<br /><small>${msg.details}</small>`,
                  dismissable: true,
                };
                setTimeout(() => {
                  this.dialogService.show(dialogData);
                }, 500);
                return;
              }

              const dialogData: InfoDialogData = {
                title: 'İşlem başarılı',
                body: `İş izni devir işlemi kaydedildi.`,
                dismissable: true,
              };
              setTimeout(() => {
                this.dialogService.show(dialogData);
              }, 500);
              this.tableDs.reloadPage();
            });
        }, 500);
      });
  }

  private awaitHeightChange(): void {
    this.height$.pipe(distinctUntilChanged(), debounceTime(200)).subscribe((newHeight) => {
      if (this.scope === WpScope.PROJECT && this.project !== '') {
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
