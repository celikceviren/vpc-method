import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, finalize, fromEvent, interval, map, Subject, take, takeUntil, timer } from 'rxjs';
import {
  CodeValueSelectItem,
  ConfirmDialogData,
  ContractorFormDialogData,
  FormSection,
  InfoDialogData,
  StaticValues,
  TaskFormDialogData,
  TaskRiskFormDialogData,
} from 'src/app/data/common.model';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { MethodDoc, SubContractorItem, Task, TaskRisk } from 'src/app/data/method-doc.model';
import { NestleMethodEditorService } from 'src/app/data/nestle-method-editor.service';
import { UUIDService } from 'src/app/data/uuid.service';
import { FailureMsgData, HandshakeMsgData, KeepAliveMsgData, SaveDocMsgData } from 'src/app/data/window-msg.model';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { UiConfirmDialogComponent } from 'src/app/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { UiContractorFormComponent } from 'src/app/ui/ui-contractor-form/ui-contractor-form.component';
import { UiTaskFormComponent } from 'src/app/ui/ui-task-form/ui-task-form.component';
import { UiTaskRiskFormComponent } from 'src/app/ui/ui-task-risk-form/ui-task-risk-form.component';
import { SplashScreenService } from 'src/_services/common/splash-screen-service';

interface Section1Form {
  Question: FormControl<string | null>;
}
interface Section2Form {
  Question1: FormControl<string | null>;
  Question2: FormControl<string | null>;
  Question3: FormControl<string | null>;
}

@Component({
  selector: 'app-nestle-method-editor',
  templateUrl: './nestle-method-editor.component.html',
  styleUrls: ['./nestle-method-editor.component.scss'],
})
export class NestleMethodEditorComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();
  private _keepAliveTick = new Subject<void>();
  private _sessionTerminated = new Subject<void>();
  private _methodDoc: MethodDoc | null = null;
  private _ppe: CodeValueSelectItem[] = [];
  private _subContractors: SubContractorItem[] = [];
  private keepAliveErrorCount = 0;
  private readonly keepAliveInterval = 90000;

  formSections: { section: FormSection; valid: boolean }[] = [];
  companyCode = 'NESTLE';
  versionCode: string | undefined;
  ready = false;
  isReadyToPublish: boolean = false;
  formSection = FormSection;
  section1Q1Form!: FormGroup<Section1Form>;
  section1Q2Form!: FormGroup<Section1Form>;
  section2Form!: FormGroup<Section2Form>;

  constructor(
    private route: ActivatedRoute,
    private splasService: SplashScreenService,
    private editorService: NestleMethodEditorService,
    private windowMsgService: WindowMsgService,
    private dialogService: InfoDialogService,
    private dialog: MatDialog,
    private uuid: UUIDService,
    private formBuilder: FormBuilder
  ) {}

  set methodDoc(value: MethodDoc | null) {
    this._methodDoc = value;
    this.updateMethodDocValidty();
  }

  get methodDoc(): MethodDoc | null {
    return this._methodDoc;
  }

  set ppe(value: CodeValueSelectItem[]) {
    this._ppe = value;
    if (this.methodDoc) {
      const selected = value.filter((x) => x.selected).map((x) => x.item) ?? [];
      if (selected.length === 1 && selected[0].Code === StaticValues.SELECT_OPTION_NONE_CODE) {
        this.methodDoc.NoPpe = true;
        this.methodDoc.Ppe = [];
      } else {
        this.methodDoc.NoPpe = false;
        this.methodDoc.Ppe = value.filter((x) => x.selected).map((x) => x.item) ?? [];
      }
    }
    this.updateMethodDocValidty();
  }

  get ppe(): CodeValueSelectItem[] {
    return this._ppe;
  }

  set tasks(value: Task[]) {
    if (this.methodDoc) {
      this.methodDoc.Tasks = value;
      this.updateMethodDocValidty();
    }
  }

  get tasks(): Task[] {
    return this._methodDoc?.Tasks ?? [];
  }

  set subContractors(value: SubContractorItem[]) {
    this._subContractors = value;
    if (this.methodDoc) {
      this.methodDoc.SubContractors = value;
    }
    this.updateMethodDocValidty();
  }

  get subContractors(): SubContractorItem[] {
    return this._subContractors;
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

  isFormSectionValid(section: FormSection): boolean {
    return this.formSections.find((x) => x.section === section)?.valid ?? true;
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((params: Params) => {
      this.formSections = this.editorService.getFormSectionsList();
      this.versionCode = params['versionCode'] ?? '';

      if (!this.versionCode) {
        this.postMsg('failed', { reason: 'INV_VERSION_CODE', reasonMsg: 'Doküman versiyon bilgisi eksik.' });
        return;
      }

      if (this.versionCode) {
        this.awaitInitialData();
        this.postMsg('ready', { companyCode: this.companyCode, versionCode: this.versionCode });
        return;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._keepAliveTick.complete();
    this._sessionTerminated.complete();
  }

  onAddTaskClick(): void {
    const dialogData: TaskFormDialogData = {
      isEdit: false,
      workPermits: this.methodDoc?.RefData.WorkPermits ?? [],
      skills: this.methodDoc?.RefData.Skills ?? [],
    };
    const dialogRef = this.dialog.open(UiTaskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const newTask: Task = resp as Task;
        newTask.Priority = ((this.methodDoc?.Tasks ?? []).length ?? 0) + 1;
        newTask.Id = this.uuid.UUID();
        if (!this.methodDoc.Tasks?.length) {
          this.methodDoc.Tasks = [newTask];
        } else {
          this.methodDoc.Tasks.push(newTask);
        }
        this.updateMethodDocValidty();
      });
  }

  onEditTaskClick(taskId: string): void {
    const tasks = this.methodDoc?.Tasks ?? [];
    const taskToUpdate = tasks.find((x) => x.Id === taskId);
    if (!taskToUpdate) {
      return;
    }

    const dialogData: TaskFormDialogData = {
      isEdit: true,
      task: taskToUpdate,
      workPermits: this.methodDoc?.RefData.WorkPermits ?? [],
      skills: this.methodDoc?.RefData.Skills ?? [],
    };
    const dialogRef = this.dialog.open(UiTaskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const updatedTask: Task = resp as Task;
        const taskToUpdateIx = this.methodDoc.Tasks.findIndex((x) => x.Id == taskId);
        this.methodDoc.Tasks[taskToUpdateIx] = updatedTask;
        this.updateMethodDocValidty();
      });
  }

  onDeleteTaskClick(taskId: string): void {
    const tasks = this.tasks;
    const taskToDelete = tasks.find((x) => x.Id === taskId);
    if (!taskToDelete) {
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'İş adımını silmek istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed || !this.methodDoc) {
        return;
      }

      const tasksToKeep: Task[] = [];
      tasks.forEach((item) => {
        if (item.Id !== taskId) {
          const itemToKeep = JSON.parse(JSON.stringify(item));
          tasksToKeep.push(itemToKeep);
        }
      });
      tasksToKeep.forEach((x, ix) => {
        x.Priority = ix + 1;
      });

      setTimeout(() => {
        if (!this.methodDoc) {
          return;
        }
        this.methodDoc.Tasks = tasksToKeep;
        this.updateMethodDocValidty();
      }, 0);
    });
  }

  onAddTaskRisk(taskId: string): void {
    const dialogData: TaskRiskFormDialogData = {
      isEdit: false,
      taskId: taskId,
      companyCode: this.companyCode,
      type: 'risk',
    };
    const dialogRef = this.dialog.open(UiTaskRiskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const newItem = resp as { taskId: string; item: TaskRisk };
        const task = this.methodDoc?.Tasks.find((x) => x.Id === newItem.taskId);
        if (!task) {
          return;
        }
        newItem.item.Id = this.uuid.UUID();
        newItem.item.Priority = ((task.TaskRisks ?? []).length ?? 0) + 1;
        if (!task.TaskRisks?.length) {
          task.TaskRisks = [newItem.item];
        } else {
          task.TaskRisks.push(newItem.item);
        }
        task.NoPrecautions = false;
        this.updateMethodDocValidty();
      });
  }

  onAddTaskPrecaution(taskId: string): void {
    const taks = (this.methodDoc?.Tasks ?? []).find((x) => x.Id === taskId);
    const dialogData: TaskRiskFormDialogData = {
      isEdit: false,
      taskId: taskId,
      companyCode: this.companyCode,
      type: 'precaution',
      parents: taks?.TaskRisks ?? [],
    };
    const dialogRef = this.dialog.open(UiTaskRiskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const newItem = resp as { taskId: string; item: TaskRisk };
        const task = this.methodDoc?.Tasks.find((x) => x.Id === newItem.taskId);
        if (!task) {
          return;
        }
        newItem.item.Id = this.uuid.UUID();
        newItem.item.Priority = ((task.Precautions ?? []).length ?? 0) + 1;
        if (!task.Precautions?.length) {
          task.Precautions = [newItem.item];
        } else {
          task.Precautions.push(newItem.item);
        }
        task.NoPrecautions = false;
        this.updateMethodDocValidty();
      });
  }

  onEditTaskRisk(event: { taskId: string; item: TaskRisk }): void {
    const dialogData: TaskRiskFormDialogData = {
      isEdit: true,
      taskId: event.taskId,
      companyCode: this.companyCode,
      type: 'risk',
      item: event.item,
    };
    const dialogRef = this.dialog.open(UiTaskRiskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const updatedItem = resp as { taskId: string; item: TaskRisk };
        const task = this.methodDoc?.Tasks.find((x) => x.Id === updatedItem.taskId);
        if (!task) {
          return;
        }
        const itemToUpdateIx = task.TaskRisks.findIndex((x) => x.Id == updatedItem.item.Id);
        task.TaskRisks[itemToUpdateIx] = updatedItem.item;
      });
  }

  onEditTaskPrecaution(event: { taskId: string; item: TaskRisk }): void {
    const taks = (this.methodDoc?.Tasks ?? []).find((x) => x.Id === event.taskId);
    const dialogData: TaskRiskFormDialogData = {
      isEdit: true,
      taskId: event.taskId,
      companyCode: this.companyCode,
      type: 'precaution',
      item: event.item,
      parents: taks?.TaskRisks ?? [],
    };
    const dialogRef = this.dialog.open(UiTaskRiskFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const updatedItem = resp as { taskId: string; item: TaskRisk };
        const task = this.methodDoc?.Tasks.find((x) => x.Id === updatedItem.taskId);
        if (!task) {
          return;
        }
        const itemToUpdateIx = task.Precautions.findIndex((x) => x.Id == updatedItem.item.Id);
        task.Precautions[itemToUpdateIx] = updatedItem.item;
      });
  }

  onDeleteTaskRisk(event: { taskId: string; id: string }): void {
    const tasks = this.tasks;
    const taskToDeleteRisksFrom = tasks.find((x) => x.Id === event.taskId);
    if (!taskToDeleteRisksFrom) {
      return;
    }

    let hasRiskToDelete = false;
    taskToDeleteRisksFrom.TaskRisks.forEach((item) => {
      if (item.Id === event.id) {
        hasRiskToDelete = true;
      }
    });

    if (!hasRiskToDelete) {
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'İlgili kaydı silmek istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };

    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed || !this.methodDoc) {
        return;
      }

      const risksToKeep: TaskRisk[] = [];
      taskToDeleteRisksFrom.TaskRisks.forEach((item) => {
        if (item.Id !== event.id) {
          const riskToKeep = JSON.parse(JSON.stringify(item)) as TaskRisk;
          risksToKeep.push(riskToKeep);
        }
      });
      risksToKeep.forEach((x, ix) => {
        x.Priority = ix + 1;
      });

      const precautionsToKeep: TaskRisk[] = [];
      if (taskToDeleteRisksFrom.Precautions?.length) {
        taskToDeleteRisksFrom.Precautions.forEach((item) => {
          if (item.ParentId !== event.id) {
            precautionsToKeep.push(item);
          }
        });
        precautionsToKeep.forEach((x, ix) => {
          x.Priority = ix + 1;
        });
      }

      setTimeout(() => {
        taskToDeleteRisksFrom.TaskRisks = JSON.parse(JSON.stringify(risksToKeep));
        taskToDeleteRisksFrom.Precautions = JSON.parse(JSON.stringify(precautionsToKeep));
        this.updateMethodDocValidty();
      }, 0);
    });
  }

  onDeleteTaskPrecaution(event: { taskId: string; id: string }): void {
    const tasks = this.tasks;
    const taskToDeletePrecautionFrom = tasks.find((x) => x.Id === event.taskId);
    if (!taskToDeletePrecautionFrom) {
      return;
    }

    let hasPrecautionToDelete = false;
    taskToDeletePrecautionFrom.Precautions.forEach((item) => {
      if (item.Id === event.id) {
        hasPrecautionToDelete = true;
      }
    });

    if (!hasPrecautionToDelete) {
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'İlgili kaydı silmek istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };

    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed || !this.methodDoc) {
        return;
      }

      const itemsToKeep: TaskRisk[] = [];
      taskToDeletePrecautionFrom.Precautions.forEach((item) => {
        if (item.Id !== event.id) {
          const itemToKeep = JSON.parse(JSON.stringify(item)) as TaskRisk;
          itemsToKeep.push(itemToKeep);
        }
      });
      itemsToKeep.forEach((x, ix) => {
        x.Priority = ix + 1;
      });

      setTimeout(() => {
        taskToDeletePrecautionFrom.Precautions = itemsToKeep;
        this.updateMethodDocValidty();
      }, 0);
    });
  }

  onAddContractor(): void {
    const dialogData: ContractorFormDialogData = {
      isEdit: false,
    };
    const dialogRef = this.dialog.open(UiContractorFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp || !this.methodDoc) {
          return;
        }
        const newItem: SubContractorItem = resp as SubContractorItem;
        newItem.Priority = ((this.subContractors ?? []).length ?? 0) + 1;
        newItem.Id = this.uuid.UUID();
        this.subContractors.push(newItem);
        setTimeout(() => {
          this.updateMethodDocValidty();
        }, 0);
      });
  }

  onEditContractor(id: string): void {
    const contractorToUpdate = this.subContractors.find((x) => x.Id === id);
    if (!contractorToUpdate) {
      return;
    }

    const dialogData: ContractorFormDialogData = {
      isEdit: true,
      item: contractorToUpdate,
    };
    const dialogRef = this.dialog.open(UiContractorFormComponent, {
      width: '100%',
      panelClass: ['form-editor'],
      autoFocus: false,
      restoreFocus: false,
      data: dialogData,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp) => {
        if (!resp) {
          return;
        }
        const updatedItem: SubContractorItem = resp as SubContractorItem;
        const itemToUpdateIx = this.subContractors.findIndex((x) => x.Id == id);
        this.subContractors[itemToUpdateIx] = updatedItem;
      });
  }

  onDeleteContractor(id: string): void {
    const contractorToDelete = this.subContractors.find((x) => x.Id === id);
    if (!contractorToDelete) {
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: '',
      body: 'Alt yükleniciyi silmek istediğinize emin misiniz?',
      hasConfirmBtn: true,
      confirmBtnText: 'Evet',
      closeBtnText: 'Vazgeç',
    };
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      width: '320px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp || !resp?.confirmed) {
        return;
      }

      const itemsToKeep: SubContractorItem[] = [];
      this.subContractors.forEach((item) => {
        if (item.Id !== id) {
          const itemToKeep = JSON.parse(JSON.stringify(item));
          itemsToKeep.push(itemToKeep);
        }
      });
      itemsToKeep.forEach((x, ix) => {
        x.Priority = ix + 1;
      });
      setTimeout(() => {
        this.subContractors = itemsToKeep;
      }, 0);
    });
  }

  onSave(): void {
    if (!this.methodDoc) {
      return;
    }

    const dialogData: InfoDialogData = {
      body: 'Kaydediliyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);

    const msgData: SaveDocMsgData = {
      companyCode: this.companyCode,
      versionCode: this.versionCode ?? '',
      doc: this.methodDoc,
    };
    this.awaitSaveDraftResponse();
    this.postMsg('saveDraft', msgData);
  }

  onSaveAndPublish(): void {
    if (!this.methodDoc) {
      return;
    }

    const dialogData: InfoDialogData = {
      body: 'Kaydediliyor...',
      isLoading: true,
    };
    this.dialogService.show(dialogData);

    const msgData: SaveDocMsgData = {
      companyCode: this.companyCode,
      versionCode: this.versionCode ?? '',
      doc: this.methodDoc,
    };
    this.awaitPublishResponse();
    this.postMsg('publish', msgData);
  }

  private createSection1Q1Form(doc: MethodDoc): FormGroup<Section1Form> {
    let value = '';
    const section = doc.Sections.find((x) => x.Code === 'NESTLE_SC_1');
    if (section) {
      const question = section.Questions.find((x) => x.Code === 'NESTLE_SC_11');
      if (question && question.Answer?.Value) {
        value = question.Answer.Value;
      }
    }
    return this.formBuilder.group({
      Question: [value, [Validators.required, Validators.maxLength(200)]],
    });
  }

  private createSection1Q2Form(doc: MethodDoc): FormGroup<Section1Form> {
    let value = '';
    const section = doc.Sections.find((x) => x.Code === 'NESTLE_SC_1');
    if (section) {
      const question = section.Questions.find((x) => x.Code === 'NESTLE_SC_12');
      if (question && question.Answer?.Value) {
        value = question.Answer.Value;
      }
    }
    return this.formBuilder.group({
      Question: [value, [Validators.required, Validators.maxLength(200)]],
    });
  }

  private createSection2Form(doc: MethodDoc): FormGroup<Section2Form> {
    let value1 = '';
    let value2 = '';
    let value3 = '';
    const section = doc.Sections.find((x) => x.Code === 'NESTLE_SC_2');
    if (section) {
      const question1 = section.Questions.find((x) => x.Code === 'NESTLE_SC_21');
      if (question1 && question1.Answer?.Code) {
        value1 = question1.Answer.Code;
      }

      const question2 = section.Questions.find((x) => x.Code === 'NESTLE_SC_22');
      if (question2 && question2.Answer?.Code) {
        value2 = question2.Answer.Code;
      }

      const question3 = section.Questions.find((x) => x.Code === 'NESTLE_SC_23');
      if (question3 && question3.Answer?.Code) {
        value3 = question3.Answer.Code;
      }
    }
    return this.formBuilder.group({
      Question1: [value1, Validators.required],
      Question2: [value2, Validators.required],
      Question3: [value3, Validators.required],
    });
  }

  private updateMethodDocValidty(): void {
    if (!this.methodDoc) {
      this.isReadyToPublish = false;
      return;
    }

    const updatedSections = this.editorService.isDocReadyForPublish(this.methodDoc, this.formSections);
    this.formSections.forEach((item) => {
      item.valid = updatedSections.find((x) => x.section === item.section)?.valid ?? true;
    });

    this.isReadyToPublish =
      !this.formSections.some((x) => !x.valid) &&
      this.section1Q1Form.valid &&
      this.section1Q2Form.valid &&
      this.section2Form.valid;
  }

  private awaitInitialData(): void {
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(timer(15000)),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }

          return e?.data?.action === 'data' && e.data?.data?.VersionCode === this.versionCode;
        }),
        take(1),
        map((e: any) => e.data.data as MethodDoc),
        finalize(() => {
          setTimeout(() => {
            if (!this.methodDoc) {
              this.splasService.hide();
              this.dialogService.show({
                heading: 'Hata',
                title: 'Veriler alınamadı.',
                body: 'Sayfayı yenileyerek tekrar deneyiniz.<br/><small><i>Ref: awaitInitialData:001',
              });
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        console.log('awaitInitialData => received =>', e);
        this._ppe = this.editorService.getSelectionList(e.RefData.Ppe ?? [], e.Ppe ?? [], {
          includeNone: true,
          isNoneChecked: e.NoPpe ?? false,
        });
        this._subContractors = e.SubContractors ?? [];
        this.section1Q1Form = this.createSection1Q1Form(e);
        this.section1Q2Form = this.createSection1Q2Form(e);
        this.section2Form = this.createSection2Form(e);
        this.methodDoc = e;

        this.section1Q1Form.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
          const section = this.methodDoc?.Sections.find((x) => x.Code === 'NESTLE_SC_1');
          if (section) {
            const question = section.Questions.find((x) => x.Code === 'NESTLE_SC_11');
            if (question) {
              const answer = this.section1Q1Form.controls.Question.value ?? '';
              question.Answer = {
                Code: '',
                Value: this.section1Q1Form.controls.Question.valid ? answer : '',
              };
            }
          }
          this.updateMethodDocValidty();
        });
        this.section1Q2Form.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
          const section = this.methodDoc?.Sections.find((x) => x.Code === 'NESTLE_SC_1');
          if (section) {
            const question = section.Questions.find((x) => x.Code === 'NESTLE_SC_12');
            if (question) {
              const answer = this.section1Q2Form.controls.Question.value ?? '';
              question.Answer = {
                Code: '',
                Value: this.section1Q2Form.controls.Question.valid ? answer : '',
              };
            }
          }
          this.updateMethodDocValidty();
        });
        this.section2Form.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
          const section = this.methodDoc?.Sections.find((x) => x.Code === 'NESTLE_SC_2');
          if (section) {
            const question1 = section.Questions.find((x) => x.Code === 'NESTLE_SC_21');
            if (question1) {
              const answer = this.section2Form.controls.Question1.value ?? '';
              question1.Answer = {
                Code: answer,
                Value: answer !== '' ? (answer === '1' ? 'Evet' : 'Hayır') : '',
              };
            }
            const question2 = section.Questions.find((x) => x.Code === 'NESTLE_SC_22');
            if (question2) {
              const answer = this.section2Form.controls.Question2.value ?? '';
              question2.Answer = {
                Code: answer,
                Value: answer !== '' ? (answer === '1' ? 'Evet' : 'Hayır') : '',
              };
            }
            const question3 = section.Questions.find((x) => x.Code === 'NESTLE_SC_23');
            if (question3) {
              const answer = this.section2Form.controls.Question3.value ?? '';
              question3.Answer = {
                Code: answer,
                Value: answer !== '' ? (answer === '1' ? 'Evet' : 'Hayır') : '',
              };
            }
          }
          this.updateMethodDocValidty();
        });
        this.initKeepAlive();
        setTimeout(() => {
          this.ready = true;
          this.splasService.hide();
        }, 500);
      });
  }

  private initKeepAlive(): void {
    interval(this.keepAliveInterval)
      .pipe(takeUntil(this._unsubscribeAll), takeUntil(this._sessionTerminated))
      .subscribe(() => {
        this._keepAliveTick.next();
        setTimeout(() => {
          this.awaitKeepAliveData();
          this.postMsg('keepAlive', {
            companyCode: this.companyCode,
            versionCode: this.versionCode ?? '',
            type: 'editMethodDoc',
          });
        });
      });
  }

  private awaitKeepAliveData(): void {
    let success = false;
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._keepAliveTick),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }
          return e?.data?.action === 'keepAlive';
        }),
        take(1),
        map((e: any) => e.data.data),
        finalize(() => {
          setTimeout(() => {
            if (!success) {
              this.keepAliveErrorCount++;
              if (this.keepAliveErrorCount > 2) {
                this.dialogService.show({
                  heading: 'Hata',
                  title: '',
                  body: 'Uzun süredir işlem yapmadığınız için oturumunuz sona erdi.<br/><small><i>Ref: awaitKeepAliveData:001',
                });
                this._sessionTerminated.next();
              }
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        if (e.result) {
          success = true;
          this.keepAliveErrorCount = 0;
        }
      });
  }

  private awaitSaveDraftResponse(): void {
    let success = false;
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(timer(45000)),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }
          return e?.data?.action === 'saveDraft';
        }),
        take(1),
        map((e: any) => e.data.data),
        finalize(() => {
          setTimeout(() => {
            if (!success) {
              this.dialogService.show({
                heading: 'Bilgiler kaydedilemedi.',
                body: 'Lütfen daha sonra tekrar deneyin.<br/><small><i>Ref: awaitSaveDraftResponse:001',
                dismissable: true,
              });
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        success = true;
        if (e.result) {
          this.dialogService.show({
            heading: 'İşlem başarılı.',
            dismissable: true,
            body: 'Method dokümanı taslak olarak kaydedildi.',
          });
        } else {
          const reasonCode = e.reasonCode ?? '-';
          const reason = e.reason ?? 'awaitSaveDraftResponse:002';
          this.dialogService.show({
            heading: 'Bilgiler kaydedilemedi.',
            body: `Hata: ${reasonCode}<br/><small><i>Ref: ${reason}`,
            dismissable: true,
          });
        }
      });
  }

  private awaitPublishResponse(): void {
    let success = false;
    fromEvent(window, 'message')
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(timer(45000)),
        filter((e: any) => {
          const isValidSource = this.windowMsgService.isValidSourceOrigin(e);
          if (!isValidSource) {
            return false;
          }
          return e?.data?.action === 'publish';
        }),
        take(1),
        map((e: any) => e.data.data),
        finalize(() => {
          setTimeout(() => {
            if (!success) {
              this.dialogService.show({
                heading: 'Bilgiler kaydedilemedi.',
                body: 'Lütfen daha sonra tekrar deneyin.<br/><small><i>Ref: awaitPublishResponse:001',
                dismissable: true,
              });
            }
          }, 0);
        })
      )
      .subscribe((e) => {
        success = true;
        if (!e.result) {
          const reasonCode = e.reasonCode ?? '-';
          const reason = e.reason ?? 'awaitPublishResponse:002';
          this.dialogService.show({
            heading: 'Bilgiler kaydedilemedi.',
            body: `Hata: ${reasonCode}<br/><small><i>Ref: ${reason}`,
            dismissable: true,
          });
        }
      });
  }

  private postMsg(msg: string, data?: FailureMsgData | HandshakeMsgData | KeepAliveMsgData | SaveDocMsgData): void {
    const targetOrigin = `${this.windowMsgService.getSourceOrigin('/project/methodDocs')}`;
    parent.postMessage(
      {
        action: msg,
        data,
      },
      targetOrigin
    );
  }
}
