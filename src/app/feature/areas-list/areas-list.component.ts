import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
import { AreasListService } from 'src/app/data/areas-list.service';
import { AreasTableSource } from 'src/app/data/areas-table-source';
import { AreaFormDialogData, AreaGroupListItem, AreaListItem } from 'src/app/data/aregroups.model';
import { ConfirmDialogData, InfoDialogData } from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { ServiceError } from 'src/app/data/workpermit.model';
import { AreaFormComponent } from 'src/app/ui/area-form/area-form.component';
import { AreaQrViewComponent } from 'src/app/ui/area-qr-view/area-qr-view.component';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

@Component({
  selector: 'app-areas-list',
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.scss'],
})
export class AreasListComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribeAll = new Subject<void>();
  private height$ = new Subject<number>();

  mobileViewBreak: number = 960;
  isMobileView!: boolean;
  facilities!: Array<{ id: string; name: string }>;
  areaGroups!: Array<AreaGroupListItem>;
  facilityAreaGroups!: Array<AreaGroupListItem>;
  loading = true;
  filterFacility = '';
  filterAreaGroup = '';
  tableDs!: AreasTableSource;
  columns: string[] = ['id', 'facility', 'areaGroup', 'name', 'qrCode', 'action'];

  @ViewChild('focus', { read: ElementRef }) tableInput!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobileView = window.innerWidth < this.mobileViewBreak;
  }

  constructor(
    private splashService: SplashScreenService,
    private service: AreasListService,
    private api: WpApiService,
    private dialog: MatDialog,
    private dialogService: InfoDialogService,
    private windowService: WindowMsgService,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    this.splashService.hide();
    this.service
      .getFacilities()
      .pipe(takeUntil(this.unsubscribeAll), take(1))
      .subscribe((list) => {
        this.facilities = list.items ?? [];
        this.service
          .getAllAreaGroups()
          .pipe(takeUntil(this.unsubscribeAll), take(1))
          .subscribe((resp) => {
            this.areaGroups = resp.items ?? [];
            this.facilityAreaGroups = resp.items ?? [];
            this.tableDs = new AreasTableSource(this.api, this.filterFacility, this.filterAreaGroup);
            this.loading = false;
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

  onFilterFacilityChanged(e: MatSelectChange) {
    this.facilityAreaGroups = this.areaGroups.filter((p) => p.facilityCode === e.value) ?? [];
    setTimeout(() => {
      this.filterAreaGroup = '';
      this.tableDs.changeFilter(this.filterFacility, this.filterAreaGroup);
    }, 0);
  }

  onFilterAreaGroupChanged(e: MatSelectChange): void {
    setTimeout(() => {
      this.tableDs.changeFilter(this.filterFacility, this.filterAreaGroup);
    }, 0);
  }

  onPaginatorChanged(event: PageEvent): void {
    this.tableDs.changePage(event.pageIndex + 1, event.pageSize);
    setTimeout(() => this.tableInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  onSortChanged(e: any): void {
    setTimeout(() => {
      this.tableDs.changeSort(e.active, e.direction ?? '');
    }, 0);
  }

  onViewQrClick(item: AreaListItem): void {
    this.dialog.open(AreaQrViewComponent, {
      width: '600px',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: item,
    });
  }

  onNewAreaClick(): void {
    const dialogData: AreaFormDialogData = {
      isEdit: false,
      facilities: this.facilities,
      areaGroups: this.areaGroups,
    };
    const dialogRef = this.dialog.open(AreaFormComponent, {
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
        const newItem = resp as AreaListItem;
        const dialogData: InfoDialogData = {
          body: 'Kaydediliyor...',
          isLoading: true,
        };
        this.dialogService.show(dialogData);
        this.service
          .createArea(newItem.name, newItem.facilityCode, newItem.areaGroupCode)
          .pipe(takeUntil(this.unsubscribeAll), take(1))
          .subscribe((response) => {
            this.dialogService.hide();
            setTimeout(() => {
              if (response?.error) {
                const msg =
                  response.error ??
                  ({
                    message: 'Çalışma yeri kaydedilemedi.',
                    details: this.service.formatErrorDetails('L141', 'createAreaGroup'),
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

  onEditClick(item: AreaListItem): void {
    const dialogData: AreaFormDialogData = {
      isEdit: true,
      item,
      facilities: this.facilities,
      areaGroups: this.areaGroups,
    };
    const dialogRef = this.dialog.open(AreaFormComponent, {
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
        const updateItem = resp as AreaListItem;
        const dialogData: InfoDialogData = {
          body: 'Kaydediliyor...',
          isLoading: true,
        };
        this.dialogService.show(dialogData);
        this.service
          .updateArea(updateItem.id, updateItem.name)
          .pipe(takeUntil(this.unsubscribeAll), take(1))
          .subscribe((response) => {
            this.dialogService.hide();
            setTimeout(() => {
              if (response?.error) {
                const msg =
                  response.error ??
                  ({
                    message: 'Çalışma yeri güncellenemedi.',
                    details: this.service.formatErrorDetails('L211', 'updateArea'),
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

  onDeleteClick(item: AreaListItem): void {
    const dialogData: ConfirmDialogData = {
      title: '',
      body: '"' + item.name + '"<br/><br/>Bu çalışma yerini silmek istediğinize emin misiniz?',
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
        .deleteArea(item.id)
        .pipe(takeUntil(this.unsubscribeAll), take(1))
        .subscribe((response) => {
          this.dialogService.hide();
          setTimeout(() => {
            if (response?.error) {
              const msg =
                response.error ??
                ({
                  message: 'Çalışma yeri silinemedi.',
                  details: this.service.formatErrorDetails('L265', 'deleteArea'),
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
}
