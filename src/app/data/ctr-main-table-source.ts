import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { CtrReviewItem, CtrReviewListScope, CtrReviewStatus } from './ctr-main.model';
import { CtrMainService } from './ctr-main.service';

export class CtrMainTableDataSource implements DataSource<CtrReviewItem> {
  private _items = new BehaviorSubject<CtrReviewItem[]>([]);
  private unsubscribe = new Subject<void>();
  private _total!: number;
  private _page!: number;
  private _size!: number;
  private _loading!: boolean;
  private _failed!: boolean;

  constructor(
    private service: CtrMainService,
    private status: CtrReviewStatus,
    private scope: CtrReviewListScope,
    private projectCode: string = '',
    private contractorCode: string = ''
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

  get items(): Observable<CtrReviewItem[]> {
    return this._items.asObservable();
  }

  connect(): Observable<CtrReviewItem[]> {
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

  findItem(id: number): CtrReviewItem | undefined {
    const items = this._items.getValue();
    return items.find((x) => x.id === id);
  }

  private load(): void {
    this._loading = true;
    this._failed = false;
    this.service
      .loadTablePage(this.status, this.scope, this.projectCode, this.contractorCode, this.page, this.size)
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
