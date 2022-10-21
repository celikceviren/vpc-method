import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { AreaListItem } from './aregroups.model';

export class AreasTableSource implements DataSource<AreaListItem> {
  private _items = new BehaviorSubject<AreaListItem[]>([]);
  private unsubscribe = new Subject<void>();
  private filterChanged = new Subject<void>();
  private _total!: number;
  private _page!: number;
  private _size!: number;
  private _loading!: boolean;
  private _failed!: boolean;
  private _facilityCode!: string;
  private _areaCode!: string;
  private _sort!: string;
  private _direction!: string;

  constructor(private api: WpApiService, private facilityCode: string, private areaCode: string) {
    this._facilityCode = facilityCode;
    this._areaCode = areaCode;
  }

  get total(): number {
    return this._total ?? 0;
  }

  get page(): number {
    return this._page ?? 0;
  }

  get size(): number {
    return this._size ?? 0;
  }

  get loading(): boolean {
    return this._loading ?? false;
  }

  get failed(): boolean {
    return this._failed ?? false;
  }

  get items(): Observable<AreaListItem[]> {
    return this._items.asObservable();
  }

  connect(): Observable<AreaListItem[]> {
    setTimeout(() => {
      this._page = 1;
      this._size = 10;
      this.load();
    }, 0);
    return this._items.asObservable();
  }

  disconnect(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this._items.complete();
  }

  retry(): void {
    this.load();
  }

  changePage(page: number, size?: number): void {
    this._page = page;
    this._size = size ?? 10;
    this.load();
  }

  changeFilter(facilityCode: string, areaCode: string): void {
    this._page = 1;
    this._facilityCode = facilityCode;
    this._areaCode = areaCode;
    this.load();
  }

  changeSort(sort: string, direction: string): void {
    this._page = 1;
    if (direction) {
      this._sort = sort;
      this._direction = direction;
    } else {
      this._sort = '';
      this._direction = '';
    }
    this.load();
  }

  reloadPage(): void {
    this.load();
  }

  private load(): void {
    this._loading = true;
    this._failed = false;
    this.api
      .getAreasListPage(this._facilityCode, this._areaCode, this.page, this.size, this._sort, this._direction)
      .pipe(takeUntil(this.unsubscribe), takeUntil(this.filterChanged), take(1))
      .subscribe((response) => {
        if (!response?.result) {
          this._loading = false;
          this._failed = true;
          return;
        }

        this._total = response.total;
        this._items.next(response.items ?? []);
        this._loading = false;
      });
  }
}
