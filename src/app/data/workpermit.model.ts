export enum WPNewStep {
  SelectLocation = 1,
  SelectProject,
  SelectContractor,
  SelectStaff,
  WorkInfo,
  WorkType,
  Risks,
  Equipments,
  Ppe,
  ExtraPermissions,
  QuestionsList,
  ReviewApprove,
}

export interface ServiceError {
  message: string;
  details?: string;
  error?: any;
}

export interface ServiceItemResult<T> {
  result: boolean;
  error?: ServiceError;
  item?: T;
}

export interface ServiceListResult<T> {
  result: boolean;
  error?: ServiceError;
  items?: Array<T>;
}

export enum PageState {
  ready = 'ready',
  inprogress = 'inprogress',
  failed = 'failed',
  done = 'done',
}

export interface WpPageState {
  state: PageState;
  error?: ServiceError;
}

export class WPNewStepsData {
  qrCode: string = '';
  selectedLocation: WorkAreaInfo = {
    companyCode: '',
    companyName: '',
    facilityCode: '',
    faiclityName: '',
    workAreaCode: '',
    workAreaName: '',
  };
  projectsList: Project[] = [];
  selectedProject?: Project;
  contractorsList: CodeValueItem[] = [];
  selectedContractor?: CodeValueItem;
  staffList: CodeValueItem[] = [];
  selectedStaff: CodeValueItem[] = [];
  workDescription: WorkDetails = {
    description: '',
    dtStart: new Date(),
  };
  workTypeList: CodeValueItem[] = [];
  selectedWorkTypes: CodeValueItem[] = [];
  riskList: CodeValueItem[] = [];
  selectedRisks: CodeValueItem[] = [];
  equipmentList: CodeValueItem[] = [];
  selectedEquipments: CodeValueItem[] = [];
  ppeList: CodeValueItem[] = [];
  selectedPpe: CodeValueItem[] = [];
  extraPermissionList: CodeValueItem[] = [];
  selectedExtraPermissions: CodeValueItem[] = [];

  clearSelectedLocation(): void {
    this.selectedLocation = {
      companyCode: '',
      companyName: '',
      facilityCode: '',
      faiclityName: '',
      workAreaCode: '',
      workAreaName: '',
    };
  }

  clearWorkDescription(): void {
    this.workDescription = {
      description: '',
      dtStart: new Date(),
    };
  }
}

export interface WorkAreaInfo {
  companyCode: string;
  companyName: string;
  facilityCode: string;
  faiclityName: string;
  workAreaCode: string;
  workAreaName: string;
}

export interface Project {
  kind: 'project';
  code: string;
  name: string;
  desc: string;
  owner: string;
  dtStart: Date;
  dtEnd: Date;
}

export interface CodeValueItem {
  kind: 'contractor' | 'staff' | 'worktype' | 'risk' | 'equipment' | 'ppe' | 'extrawp';
  code: string;
  name: string;
}

export interface WorkDetails {
  description: string;
  dtStart: Date;
}
