import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CodeValueItem, Project, WpListSelectItem } from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-item-selector',
  templateUrl: './wp-item-selector.component.html',
  styleUrls: ['./wp-item-selector.component.scss'],
})
export class WpItemSelectorComponent implements OnInit {
  @Input() listKind: 'project' | 'contractor' | 'staff' | 'workpermit' | undefined;
  @Input() list: Array<Project | CodeValueItem | WpListSelectItem> = [];
  @Input() multiselect: boolean = false;
  @Output() itemsSelected: EventEmitter<Array<Project | CodeValueItem | WpListSelectItem>> = new EventEmitter<
    Array<Project | CodeValueItem | WpListSelectItem>
  >();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  selectedItems: Array<Project | CodeValueItem | WpListSelectItem> = [];
  selectList: Array<{ selected: boolean; item: Project | CodeValueItem | WpListSelectItem }> = [];

  constructor() {}

  ngOnInit(): void {
    this.selectList = this.list.map((x) => {
      return {
        selected: false,
        item: x,
      };
    });
  }

  onSelect(item: Project | CodeValueItem | WpListSelectItem): void {
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
