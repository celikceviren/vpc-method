import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { StaticValues } from 'src/app/data/common.model';
import { CodeValueItem } from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-checkbox-list',
  templateUrl: './wp-checkbox-list.component.html',
  styleUrls: ['./wp-checkbox-list.component.scss'],
})
export class WpCheckboxListComponent implements OnInit {
  readonly defaultMsg = 'En az bir seçim yapmalısınız';
  @Input() listKind: 'contractor' | 'staff' | 'worktype' | 'risk' | 'equipment' | 'ppe' | 'extrawp' | undefined;
  @Input() list: Array<CodeValueItem> = [];
  @Input() preset: Array<CodeValueItem> = [];
  @Input() addNone: boolean = true;
  @Output() itemsSelected: EventEmitter<Array<CodeValueItem>> = new EventEmitter<Array<CodeValueItem>>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  selectedItems: Array<CodeValueItem> = [];
  selectList: Array<{ selected: boolean; disabled: boolean; item: CodeValueItem }> = [];

  constructor() {}

  ngOnInit(): void {
    const isNonePreset = this.preset.some((x) => x.code == StaticValues.SELECT_OPTION_NONE_CODE);
    this.selectList = this.list.map((x) => {
      return {
        selected: this.preset.some((y) => y.code === x.code),
        disabled: isNonePreset && x.code !== StaticValues.SELECT_OPTION_NONE_CODE,
        item: x,
      };
    });

    if (this.addNone) {
      const optionNone: CodeValueItem = {
        kind: this.listKind ? this.listKind : 'contractor',
        code: StaticValues.SELECT_OPTION_NONE_CODE,
        name: StaticValues.SELECT_OPTION_NONE_VALUE,
      };
      this.selectList.push({
        item: optionNone,
        selected: this.preset.some((y) => y.code === optionNone.code),
        disabled: false,
      });
    }

    this.selectedItems = this.selectList.filter((x) => x.selected).map((x) => x.item);
  }

  onSelectionChange(event: MatSelectionListChange): void {
    const option = event.options[0];
    const { selected, value } = option;
    if (selected) {
      if (value.code === StaticValues.SELECT_OPTION_NONE_CODE) {
        this.selectedItems = [];
        this.selectList
          .filter((x) => x.item.code !== StaticValues.SELECT_OPTION_NONE_CODE)
          .forEach((option) => {
            option.disabled = true;
            option.selected = false;
          });
      }

      this.selectedItems.push(value);
      this.selectList.forEach((option) => {
        option.selected = this.selectedItems.some((x) => x.code === option.item.code);
      });
      return;
    }

    this.selectedItems = this.selectedItems.filter((x) => x.code !== value.code);
    this.selectList.forEach((option) => {
      option.selected = this.selectedItems.some((x) => x.code === option.item.code);
      option.disabled = false;
    });
  }

  get infoMsg(): string {
    if (this.selectedItems.length) {
      return `${this.selectedItems.length} seçim yaptınız.`;
    } else {
      return this.defaultMsg;
    }
  }
}
