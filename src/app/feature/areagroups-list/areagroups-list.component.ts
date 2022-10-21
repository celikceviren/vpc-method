import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject, take, takeUntil, catchError, of } from 'rxjs';
import { AreGroupsTableSource } from 'src/app/data/aregroups-table-source';
import { AreaGroupFormDialogData, AreaGroupListItem } from 'src/app/data/aregroups.model';
import { ConfirmDialogData, InfoDialogData } from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { ServiceError, ServiceItemResult } from 'src/app/data/workpermit.model';
import { AreagroupsFormComponent } from 'src/app/ui/areagroups-form/areagroups-form.component';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-areagroups-list',
  templateUrl: './areagroups-list.component.html',
  styleUrls: ['./areagroups-list.component.scss'],
})
export class AreagroupsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();

  mobileViewBreak: number = 960;
  isMobileView!: boolean;
  tableDs!: AreGroupsTableSource;
  columns: string[] = ['id', 'facility', 'name', 'areaCount', 'action'];
  facilities: { id: string; name: string }[] = [];

  constructor(
    private splashService: SplashScreenService,
    private api: WpApiService,
    private windowService: WindowMsgService,
    private host: ElementRef,
    private dialog: MatDialog,
    private dialogService: InfoDialogService
  ) {}

  @ViewChild('focus', { read: ElementRef }) tableInput!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobileView = window.innerWidth < this.mobileViewBreak;
  }

  ngOnInit(): void {
    this.splashService.hide();
    this.tableDs = new AreGroupsTableSource(this.api);
    this.getFaciilities();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit() {
    this.isMobileView = window.innerWidth < this.mobileViewBreak;
    this.awaitHeightChange();
  }

  onPaginatorChanged(event: PageEvent): void {
    this.tableDs.changePage(event.pageIndex + 1, event.pageSize);
    setTimeout(() => this.tableInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  onNewAreaClick(): void {
    const dialogData: AreaGroupFormDialogData = {
      isEdit: false,
      facilities: this.facilities,
    };
    const dialogRef = this.dialog.open(AreagroupsFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((resp) => {
        if (!resp) {
          return;
        }
        const newItem = resp as AreaGroupListItem;
        const dialogData: InfoDialogData = {
          body: 'Kaydediliyor...',
          isLoading: true,
        };
        this.dialogService.show(dialogData);
        this.api
          .createAreaGroup(newItem.name, newItem.facilityCode)
          .pipe(
            takeUntil(this.unsubscribeAll),
            take(1),
            catchError((err) => {
              const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L100';
              const error: ServiceError = {
                message:
                  err instanceof HttpErrorResponse
                    ? err.status === HttpStatusCode.Unauthorized
                      ? 'Yetkisiz erişim'
                      : err.error?.ErrorMessage ?? err.status.toString()
                    : err.message ?? 'Bilinmeyen hata.',
                details: this.formatErrorDetails(errorCode, 'createAreaGroup'),
                error: err,
              };
              return of({
                result: false,
                error,
              } as ServiceItemResult<void>);
            })
          )
          .subscribe((response) => {
            this.dialogService.hide();
            setTimeout(() => {
              if (response?.error) {
                const msg =
                  response.error ??
                  ({
                    message: 'Alan kaydedilemedi.',
                    details: this.formatErrorDetails('L125', 'createAreaGroup'),
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
      });
  }

  onEditClick(item: AreaGroupListItem): void {
    const dialogData: AreaGroupFormDialogData = {
      isEdit: true,
      item,
      facilities: this.facilities,
    };
    const dialogRef = this.dialog.open(AreagroupsFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((resp) => {
        if (!resp) {
          return;
        }
        const updateItem = resp as AreaGroupListItem;
        const dialogData: InfoDialogData = {
          body: 'Kaydediliyor...',
          isLoading: true,
        };
        this.dialogService.show(dialogData);
        this.api
          .updateAreaGroup(updateItem.id, updateItem.name)
          .pipe(
            takeUntil(this.unsubscribeAll),
            take(1),
            catchError((err) => {
              const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L179';
              const error: ServiceError = {
                message:
                  err instanceof HttpErrorResponse
                    ? err.status === HttpStatusCode.Unauthorized
                      ? 'Yetkisiz erişim'
                      : err.error?.ErrorMessage ?? err.status.toString()
                    : err.message ?? 'Bilinmeyen hata.',
                details: this.formatErrorDetails(errorCode, 'updateAreaGroup'),
                error: err,
              };
              return of({
                result: false,
                error,
              } as ServiceItemResult<void>);
            })
          )
          .subscribe((response) => {
            this.dialogService.hide();
            setTimeout(() => {
              if (response?.error) {
                const msg =
                  response.error ??
                  ({
                    message: 'Alan kaydedilemedi.',
                    details: this.formatErrorDetails('L204', 'updateAreaGroup'),
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
      });
  }

  onDeleteClick(item: AreaGroupListItem): void {
    const dialogData: ConfirmDialogData = {
      title: '',
      body: '"' + item.name + '"<br/><br/>Bu alanı silmek istediğinize emin misiniz?',
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

      this.api
        .deleteAreaGroup(item.id)
        .pipe(
          takeUntil(this.unsubscribeAll),
          take(1),
          catchError((err) => {
            const errorCode = err instanceof HttpErrorResponse ? err.statusText : 'L250';
            const error: ServiceError = {
              message:
                err instanceof HttpErrorResponse
                  ? err.status === HttpStatusCode.Unauthorized
                    ? 'Yetkisiz erişim'
                    : err.error?.ErrorMessage ?? err.status.toString()
                  : err.message ?? 'Bilinmeyen hata.',
              details: this.formatErrorDetails(errorCode, 'deleteAreaGroup'),
              error: err,
            };
            return of({
              result: false,
              error,
            } as ServiceItemResult<void>);
          })
        )
        .subscribe((response) => {
          this.dialogService.hide();
          setTimeout(() => {
            if (response?.error) {
              const msg =
                response.error ??
                ({
                  message: 'Alan kaydedilemedi.',
                  details: this.formatErrorDetails('L275', 'deleteAreaGroup'),
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
    });
  }

  private awaitHeightChange(): void {
    this.height$.pipe(distinctUntilChanged(), debounceTime(200)).subscribe((newHeight) => {
      this.windowService.postMsg('newheight', { height: newHeight });
    });

    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      this.height$.next(height);
    });

    observer.observe(this.host.nativeElement);
  }

  private getFaciilities(): void {
    this.api
      .getFacilities()
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((resp) => {
        this.facilities = resp.items ?? [];
      });
  }

  private formatErrorDetails(errorCode: string, errorDesc: string): string {
    return `[${errorCode}] - ${errorDesc}`;
  }
}
