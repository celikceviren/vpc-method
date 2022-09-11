import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { WpListItem, WpStatus } from './workpermit-main.model';
import { WpMainService } from './workpermit-main.service';

export class WpMainTableDataSource implements DataSource<WpListItem> {
  private _items = new BehaviorSubject<WpListItem[]>([]);
  private unsubscribe = new Subject<void>();
  private _total!: number;
  private _page!: number;
  private _size!: number;
  private _loading!: boolean;
  private _failed!: boolean;

  constructor(
    private service: WpMainService,
    private status: WpStatus,
    private scope: string,
    private areaGroup: string,
    private project: string
  ) {}

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

  get items(): Observable<WpListItem[]> {
    return this._items.asObservable();
  }

  connect(): Observable<WpListItem[]> {
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
    this.service
      .loadTablePage(this.status, this.scope, this.areaGroup, this.project, this.page, this.size)
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
