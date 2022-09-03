import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CodeValueItem, Project } from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-item-selector',
  templateUrl: './wp-item-selector.component.html',
  styleUrls: ['./wp-item-selector.component.scss'],
})
export class WpItemSelectorComponent implements OnInit {
  @Input() listKind: 'project' | 'contractor' | 'staff' | undefined;
  @Input() list: Array<Project | CodeValueItem> = [];
  @Input() multiselect: boolean = false;
  @Output() itemsSelected: EventEmitter<Array<Project | CodeValueItem>> = new EventEmitter<
    Array<Project | CodeValueItem>
  >();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  selectedItems: Array<Project | CodeValueItem> = [];
  selectList: Array<{ selected: boolean; item: Project | CodeValueItem }> = [];

  constructor() {}

  ngOnInit(): void {
    this.selectList = this.list.map((x) => {
      return {
        selected: false,
        item: x,
      };
    });
  }

  onSelect(item: Project | CodeValueItem): void {
    if (this.selectedItems.find((x) => x.code === item.code)) {
      this.selectedItems = this.selectedItems.filter((x) => x.code !== item.code);
    } else {
      if (!this.multiselect) {
        this.selectedItems = [];
      }
      this.selectedItems.push(item);
    }

    this.selectList.forEach((option) => {
      option.selected = this.selectedItems.some((x) => x.code === option.item.code);
    });
  }
}
