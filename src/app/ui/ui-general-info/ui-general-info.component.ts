import { Component, Input } from '@angular/core';
import { MethodDoc } from 'src/app/data/method-doc.model';

@Component({
  selector: 'app-ui-general-info',
  templateUrl: './ui-general-info.component.html',
  styleUrls: ['./ui-general-info.component.scss'],
})
export class UiGeneralInfoComponent {
  @Input() data: MethodDoc | null = null;

  get dtStart(): Date | null {
    if (!this.data) {
      return null;
    }

    return new Date(this.data.RefData.Project.ProjectStartDate);
  }
}
