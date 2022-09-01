import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CodeValueSelectItem, StaticValues } from 'src/app/data/common.model';

@Component({
  selector: 'app-ui-checkbox-list',
  templateUrl: './ui-checkbox-list.component.html',
  styleUrls: ['./ui-checkbox-list.component.scss'],
})
export class UiCheckboxListComponent implements OnInit {
  @Input() list: CodeValueSelectItem[] = [];
  @Output() listChange: EventEmitter<CodeValueSelectItem[]> = new EventEmitter<CodeValueSelectItem[]>();

  listData: Array<{ name: string; value: string }> = [];
  isNoneSelected: boolean = false;
  codeNone: string = StaticValues.SELECT_OPTION_NONE_CODE;

  ngOnInit(): void {
    this.listData = this.list.map((x) => {
      return { name: x.item.Value, value: x.item.Code };
    });
    this.isNoneSelected = this.list.some((x) => x.selected && x.item.Code === StaticValues.SELECT_OPTION_NONE_CODE);
  }

  onChange(e: MatCheckboxChange): void {
    if (e.source.value === StaticValues.SELECT_OPTION_NONE_CODE) {
      if (e.checked) {
        this.list.filter((x) => x.item.Code !== StaticValues.SELECT_OPTION_NONE_CODE).map((x) => (x.selected = false));
        this.isNoneSelected = true;
      } else {
        this.isNoneSelected = false;
      }
    }

    const item = this.list.find((x) => x.item.Code === e.source.value);
    if (item) {
      item.selected = e.checked;
      this.listChange.emit(this.list);
    }
  }
}
