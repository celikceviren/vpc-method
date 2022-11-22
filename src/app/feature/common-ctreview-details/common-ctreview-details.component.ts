import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CtrReviewItem } from 'src/app/data/ctr-main.model';
import { CtrMainService } from 'src/app/data/ctr-main.service';

@Component({
  selector: 'app-common-ctreview-details',
  templateUrl: './common-ctreview-details.component.html',
  styleUrls: ['./common-ctreview-details.component.scss'],
})
export class CommonCtreviewDetailsComponent implements OnInit {
  @Input() item!: CtrReviewItem;
  @Input() companyCode!: string;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  get ratingValueText(): string {
    return this.item?.completed
      ? this.service.getReviewFormValueTextForCompany(this.companyCode, this.item?.rating ?? 0)
      : '';
  }
  constructor(private service: CtrMainService) {}

  ngOnInit(): void {}
}
