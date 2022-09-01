import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NestleRiskValues, PladisRiskValues } from 'src/app/data/common.model';
import { Task, TaskRisk, TaskRiskRating } from 'src/app/data/method-doc.model';

@Component({
  selector: 'app-ui-tasks-list',
  templateUrl: './ui-tasks-list.component.html',
  styleUrls: ['./ui-tasks-list.component.scss'],
})
export class UiTasksListComponent implements OnInit {
  @Input() companyCode: string = '';
  @Input() tasks: Task[] = [];
  @Output() tasksChange: EventEmitter<Task[]> = new EventEmitter<Task[]>();
  @Output() addTask: EventEmitter<void> = new EventEmitter<void>();
  @Output() editTask: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteTask: EventEmitter<string> = new EventEmitter<string>();
  @Output() addTaskRisk: EventEmitter<string> = new EventEmitter<string>();
  @Output() editTaskRisk: EventEmitter<{ taskId: string; item: TaskRisk }> = new EventEmitter<{
    taskId: string;
    item: TaskRisk;
  }>();
  @Output() deleteTaskRisk: EventEmitter<{ taskId: string; id: string }> = new EventEmitter<{
    taskId: string;
    id: string;
  }>();
  @Output() addTaskPrecaution: EventEmitter<string> = new EventEmitter<string>();
  @Output() editTaskPrecaution: EventEmitter<{ taskId: string; item: TaskRisk }> = new EventEmitter<{
    taskId: string;
    item: TaskRisk;
  }>();
  @Output() deleteTaskPrecaution: EventEmitter<{ taskId: string; id: string }> = new EventEmitter<{
    taskId: string;
    id: string;
  }>();

  riskValueNames: Array<{ key: string; value: string; color: string }> = [];

  constructor(private decimalPipe: DecimalPipe) {}

  get hasMissingPrecautions(): boolean {
    let hasMissingPrecaution = false;
    this.tasks.forEach((task) => {
      const precautionParentIds = (task.Precautions ?? []).map((x) => x.ParentId ?? '').filter((x) => x) ?? [];
      if ((task.TaskRisks ?? []).some((x) => precautionParentIds.findIndex((y) => y === x.Id) < 0)) {
        hasMissingPrecaution = true;
      }
    });
    return hasMissingPrecaution;
  }

  ngOnInit(): void {
    if (this.companyCode === 'PLADIS') {
      this.riskValueNames = PladisRiskValues;
    } else {
      this.riskValueNames = NestleRiskValues;
    }
  }

  getWorkPermits(taskId: string): string {
    return (this.tasks.find((x) => x.Id === taskId)?.WorkPermits ?? []).map((x) => x.Value).join(', ');
  }

  getRequiredSkills(taskId: string): string {
    return (this.tasks.find((x) => x.Id === taskId)?.RequiredSkills ?? []).map((x) => x.Value).join(', ');
  }

  trackTasksBy(ix: number, item: Task): any {
    return item.Id;
  }

  trackTaskRisksBy(ix: number, item: TaskRisk): any {
    return item.Id;
  }

  onNoTaskRisksChange(e: MatSlideToggleChange, taskId: string = ''): void {
    const task = this.tasks.find((x) => x.Id === taskId);
    if (!task) {
      return;
    }

    if (e.checked) {
      task.NoTaskRisks = true;
      task.NoPrecautions = true;
      task.TaskRisks = [];
      task.Precautions = [];
    } else {
      task.NoTaskRisks = false;
      task.NoPrecautions = false;
    }
    this.tasksChange.emit(this.tasks);
  }

  isValidTask(task: Task): boolean {
    const hasMissing =
      (!task.NoPrecautions && !(task.Precautions ?? []).length) ||
      (!task.NoTaskRisks && !(task.TaskRisks ?? []).length);

    if (hasMissing) {
      return false;
    }

    const precautionParentIds = (task.Precautions ?? []).map((x) => x.ParentId ?? '').filter((x) => x) ?? [];
    const hasMissingPrecaution = (task.TaskRisks ?? []).some(
      (x) => precautionParentIds.findIndex((y) => y === x.Id) < 0
    );
    return !hasMissingPrecaution;
  }

  getRiskValueColor(rating: TaskRiskRating): string {
    const key = `${this.decimalPipe.transform(rating.Probability ?? 0, '2.0')}${this.decimalPipe.transform(
      rating.Intensity,
      '2.0'
    )}`;
    return this.riskValueNames.find((x) => x.key === key)?.color ?? '';
  }

  onDeleteRisk(task: Task, risk: TaskRisk): void {
    this.deleteTaskRisk.emit({ taskId: task.Id, id: risk.Id });
  }

  onDeletePrecaution(task: Task, risk: TaskRisk): void {
    this.deleteTaskPrecaution.emit({ taskId: task.Id, id: risk.Id });
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
