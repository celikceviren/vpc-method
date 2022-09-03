import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkAreaInfo } from 'src/app/data/workpermit.model';

@Component({
  selector: 'app-wp-location-approve',
  templateUrl: './wp-location-approve.component.html',
  styleUrls: ['./wp-location-approve.component.scss'],
})
export class WpLocationApproveComponent {
  @Input('location') location: WorkAreaInfo | undefined;
  @Output('approve') approve: EventEmitter<boolean> = new EventEmitter<boolean>();
}
