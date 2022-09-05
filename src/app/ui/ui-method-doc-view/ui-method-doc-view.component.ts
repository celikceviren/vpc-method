import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NestleRiskValues, PladisRiskValues } from 'src/app/data/common.model';
import {
  MethodDoc,
  ProjectInfo,
  Section,
  SubContractorItem,
  Task,
  TaskRisk,
  TaskRiskRating,
} from 'src/app/data/method-doc.model';

@Component({
  selector: 'app-ui-method-doc-view',
  templateUrl: './ui-method-doc-view.component.html',
  styleUrls: ['./ui-method-doc-view.component.scss'],
})
export class UiMethodDocViewComponent implements OnInit {
  @Input() companyCode: string = '';
  @Input() methodDoc: MethodDoc | null = null;

  riskValueNames: Array<{ key: string; value: string; color: string }> = [];

  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {
    if (this.companyCode === 'PLADIS') {
      this.riskValueNames = PladisRiskValues;
    } else {
      this.riskValueNames = NestleRiskValues;
    }
  }

  get methodVersionCode(): string {
    if (!this.methodDoc) {
      return '-';
    }

    return this.methodDoc.VersionCode;
  }

  get methodVersionStatus(): string {
    if (!this.methodDoc) {
      return '';
    }

    switch (this.methodDoc.VersionStatus) {
      case 0:
        return 'Taslak';
      case 1:
        return 'Onay Bekliyor';
      case 2:
        return 'Düzenleme Bekliyor';
      case 3:
        return 'Onaylandı';
    }

    return this.methodDoc.Version.toString();
  }

  get project(): ProjectInfo | undefined {
    return this.methodDoc?.RefData.Project;
  }

  get workArea(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.WorkAreas.map((x) => x.Value).join(', ');
  }

  get workType(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.WorkTypes.map((x) => x.Value).join(', ');
  }

  get risks(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.Risks.map((x) => x.Value).join(', ');
  }

  get noRisks(): boolean {
    if (!this.methodDoc) {
      return false;
    }

    return this.methodDoc.NoRisks ?? false;
  }

  get equipments(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.Equipments.map((x) => x.Value).join(', ');
  }

  get noEquipments(): boolean {
    if (!this.methodDoc) {
      return false;
    }

    return this.methodDoc.NoEquipments ?? false;
  }

  get ppe(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.Ppe.map((x) => x.Value).join(', ');
  }

  get noPpe(): boolean {
    if (!this.methodDoc) {
      return false;
    }

    return this.methodDoc.NoPpe ?? false;
  }

  get tasks(): Task[] {
    if (!this.methodDoc) {
      return [];
    }

    return this.methodDoc.Tasks ?? [];
  }

  get noContractors(): boolean {
    if (!this.methodDoc) {
      return false;
    }

    return this.methodDoc.NoSubContractors ?? false;
  }

  get contractors(): SubContractorItem[] {
    if (!this.methodDoc) {
      return [];
    }

    return this.methodDoc.SubContractors ?? [];
  }

  get versionStatus(): number {
    if (!this.methodDoc) {
      return 0;
    }

    return this.methodDoc.VersionStatus;
  }

  get versionNotes(): string {
    if (!this.methodDoc) {
      return '';
    }

    return this.methodDoc.VersionNotes;
  }

  get nestleSection1(): Section | null {
    if (!this.methodDoc) {
      return null;
    }

    return (this.methodDoc.Sections ?? []).find((x) => x.Code === 'NESTLE_SC_1') ?? null;
  }

  get nestleSection2(): Section | null {
    if (!this.methodDoc) {
      return null;
    }

    return (this.methodDoc.Sections ?? []).find((x) => x.Code === 'NESTLE_SC_2') ?? null;
  }

  getWorkPermits(item: Task): string {
    return (item.WorkPermits ?? []).map((x) => x.Value).join(', ');
  }

  getRequiredSkills(item: Task): string {
    return (item.RequiredSkills ?? []).map((x) => x.Value).join(', ');
  }

  getRiskValueColor(rating: TaskRiskRating): string {
    const key = `${this.decimalPipe.transform(rating.Probability ?? 0, '2.0')}${this.decimalPipe.transform(
      rating.Intensity,
      '2.0'
    )}`;
    return this.riskValueNames.find((x) => x.key === key)?.color ?? '';
  }

  getParentTaskForPrecaution(task: Task, item: TaskRisk): string {
    const parentId = item.ParentId ?? '';
    if (!parentId) {
      return '';
    }

    const risk = task.TaskRisks.find((x) => x.Id === parentId);
    if (!risk) {
      return '';
    }

    return risk.Priority.toString();
  }
}
