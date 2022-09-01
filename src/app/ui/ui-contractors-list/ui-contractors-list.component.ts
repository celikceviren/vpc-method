import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MethodDoc, SubContractorItem } from 'src/app/data/method-doc.model';

@Component({
  selector: 'app-ui-contractors-list',
  templateUrl: './ui-contractors-list.component.html',
  styleUrls: ['./ui-contractors-list.component.scss'],
})
export class UiContractorsListComponent {
  @Input() data: MethodDoc | null = null;
  @Input() contractors: SubContractorItem[] = [];
  @Output() dataChange: EventEmitter<MethodDoc | null> = new EventEmitter<MethodDoc | null>();
  @Output() contractorsChange: EventEmitter<SubContractorItem[]> = new EventEmitter<SubContractorItem[]>();
  @Output() addContractor: EventEmitter<void> = new EventEmitter<void>();
  @Output() editContractor: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteContractor: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  get noSubContractors(): boolean {
    return this.data?.NoSubContractors ?? false;
  }

  set noSubContractors(value: boolean) {
    if (!this.data) {
      return;
    }
    this.data.NoSubContractors = value;
    if (this.data.NoSubContractors) {
      this.contractors = [];
      this.contractorsChange.emit([]);
    }
    this.dataChange.emit(this.data);
  }

  get list(): SubContractorItem[] {
    return this.contractors;
  }

  trackItemsBy(ix: number, item: SubContractorItem): any {
    return item.Id;
  }
}
