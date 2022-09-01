import { Injectable } from '@angular/core';
import { CodeValueSelectItem, FormSection, StaticValues } from './common.model';
import { CodeValueItem, MethodDoc } from './method-doc.model';

@Injectable({
  providedIn: 'root',
})
export class PladisMethodEditorService {
  readonly optionNone: CodeValueSelectItem = {
    item: {
      Code: StaticValues.SELECT_OPTION_NONE_CODE,
      Value: StaticValues.SELECT_OPTION_NONE_VALUE,
      Priority: 1000,
    },
    selected: false,
  };

  public getFormSectionsList(): { section: FormSection; valid: boolean }[] {
    const sections: { section: FormSection; valid: boolean }[] = [
      {
        section: FormSection.workInfo,
        valid: false,
      },
      {
        section: FormSection.workTypes,
        valid: false,
      },
      {
        section: FormSection.risks,
        valid: false,
      },
      {
        section: FormSection.equipments,
        valid: false,
      },
      {
        section: FormSection.ppe,
        valid: false,
      },
      {
        section: FormSection.tasks,
        valid: false,
      },
      {
        section: FormSection.contractors,
        valid: false,
      },
    ];

    return sections;
  }

  public isDocReadyForPublish(
    doc: MethodDoc,
    formSections: { section: FormSection; valid: boolean }[]
  ): { section: FormSection; valid: boolean }[] {
    formSections.forEach((item) => {
      switch (item.section) {
        case FormSection.workInfo:
          item.valid =
            (doc.ContractorOfficial ?? '') !== '' &&
            (doc.ContractorOfficialPhone ?? '') !== '' &&
            (doc.WorkDefinition ?? '') !== '' &&
            (doc.WorkAreas ?? []).length > 0;
          break;
        case FormSection.workTypes:
          item.valid = (doc.WorkTypes ?? []).length > 0;
          break;
        case FormSection.risks:
          item.valid = (doc.Risks ?? []).length > 0 || (doc.NoRisks ?? false);
          break;
        case FormSection.equipments:
          item.valid = (doc.Equipments ?? []).length > 0 || (doc.NoEquipments ?? false);
          break;
        case FormSection.ppe:
          item.valid = (doc.Ppe ?? []).length > 0 || (doc.NoPpe ?? false);
          break;
        case FormSection.tasks:
          const hasTasks = (doc.Tasks ?? []).length > 0;
          if (!hasTasks) {
            item.valid = false;
            break;
          }

          const hasMissing = doc.Tasks.some((task) => {
            return (
              (!task.NoPrecautions && !(task.Precautions ?? []).length) ||
              (!task.NoTaskRisks && !(task.TaskRisks ?? []).length)
            );
          });

          let tasksValid = true;
          if (hasMissing) {
            tasksValid = false;
          } else {
            doc.Tasks.forEach((task) => {
              const precautionParentIds = (task.Precautions ?? []).map((x) => x.ParentId ?? '').filter((x) => x) ?? [];
              if ((task.TaskRisks ?? []).some((x) => precautionParentIds.findIndex((y) => y === x.Id) < 0)) {
                tasksValid = false;
              }
            });
          }

          item.valid = tasksValid;
          break;
        case FormSection.contractors:
          item.valid = (doc.SubContractors ?? []).length > 0 || (doc.NoSubContractors ?? false);
          break;
      }
    });

    return formSections;
  }

  public getSelectionList(
    allItems: CodeValueItem[],
    selectedItems: CodeValueItem[],
    options?: { includeNone?: boolean; isNoneChecked?: boolean }
  ): CodeValueSelectItem[] {
    const list = allItems.map((item) => {
      return {
        item: item,
        selected: selectedItems.findIndex((x) => x.Code === item.Code) >= 0,
      };
    });
    if (options?.includeNone) {
      const none = JSON.parse(JSON.stringify(this.optionNone)) as CodeValueSelectItem;
      if (options.isNoneChecked) {
        none.selected = true;
        list.push(none);
        return list.map((x) => {
          x.selected = x.item.Code === none.item.Code;
          return x;
        });
      }
      list.push(none);
    }
    return list;
  }
}
