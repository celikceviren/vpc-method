import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { WpApiService } from 'src/_services/api/wp-api.service';
import { AreaGroupListItem } from './aregroups.model';

export class AreGroupsTableSource implements DataSource<AreaGroupListItem> {
  private _items = new BehaviorSubject<AreaGroupListItem[]>([]);
  private unsubscribe = new Subject<void>();
  private _total!: number;
  private _page!: number;
  private _size!: number;
  private _loading!: boolean;
  private _failed!: boolean;

  constructor(private api: WpApiService) {}

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

  get items(): Observable<AreaGroupListItem[]> {
    return this._items.asObservable();
  }

  connect(): Observable<AreaGroupListItem[]> {
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

  reloadPage(): void {
    this.load();
  }

  private load(): void {
    this._loading = true;
    this._failed = false;
    this.api
      .getAreaGroupsList(this.page, this.size)
      .pipe(takeUntil(this.unsubscribe), take(1))
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
