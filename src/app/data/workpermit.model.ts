import { StaticValues } from './common.model';
import { WpListItem } from './workpermit-main.model';

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
  GasMeasurement,
  ReviewApprove,
}
export enum WpApproveStep {
  SelectLocation = 1,
  SelectWorkPermit,
  WorkPermitReview,
  Approval,
}
export enum WpFormType {
  WpCloseForm = 1,
  WpControlForm,
}
export enum WpFormStep {
  SelectLocation = 1,
  SelectWorkPermit,
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
    facilityName: '',
    areaGroupCode: '',
    areaGroupName: '',
    areaCode: '',
    areaName: '',
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
  controlQuestions: ControlQuestions = {
    questionGroups: [],
    controlNotes: '',
  };
  gasMeasurements: GasMeasurement[] = [];

  constructor() {}

  clearSelectedLocation(): void {
    this.selectedLocation = {
      companyCode: '',
      companyName: '',
      facilityCode: '',
      facilityName: '',
      areaGroupCode: '',
      areaGroupName: '',
      areaCode: '',
      areaName: '',
    };
  }

  clearWorkDescription(): void {
    this.workDescription = {
      description: '',
      dtStart: new Date(),
    };
  }

  populateGasMeasurements(): void {
    this.gasMeasurements.push({
      code: StaticValues.GAS_MEASUREMENT_O2_CODE,
      label: StaticValues.GAS_MEASUREMENT_O2_TEXT,
      hint: StaticValues.GAS_MEASUREMENT_O2_HINT,
      value: '',
    });
    this.gasMeasurements.push({
      code: StaticValues.GAS_MEASUREMENT_CH4_CODE,
      label: StaticValues.GAS_MEASUREMENT_CH4_TEXT,
      hint: StaticValues.GAS_MEASUREMENT_CH4_HINT,
      value: '',
    });
    this.gasMeasurements.push({
      code: StaticValues.GAS_MEASUREMENT_CO_CODE,
      label: StaticValues.GAS_MEASUREMENT_CO_TEXT,
      hint: StaticValues.GAS_MEASUREMENT_CO_HINT,
      value: '',
    });
    this.gasMeasurements.push({
      code: StaticValues.GAS_MEASUREMENT_H2S_CODE,
      label: StaticValues.GAS_MEASUREMENT_H2S_TEXT,
      hint: StaticValues.GAS_MEASUREMENT_H2S_HINT,
      value: '',
    });
    this.gasMeasurements.push({
      code: StaticValues.GAS_MEASUREMENT_VOC_CODE,
      label: StaticValues.GAS_MEASUREMENT_VOC_TEXT,
      hint: StaticValues.GAS_MEASUREMENT_VOC_HINT,
      value: '',
    });
  }

  mapStaffListResponse(response: StaffListResponse): void {
    this.staffList = response?.staffList ?? [];
    if (response?.lookup) {
      const { workTypeList, riskList, equipmentList, ppeList, extraPermissionList } = response.lookup;
      this.workTypeList = workTypeList ?? [];
      this.riskList = riskList ?? [];
      this.equipmentList = equipmentList ?? [];
      this.ppeList = ppeList ?? [];
      this.extraPermissionList = extraPermissionList ?? [];
    }

    if (response?.preset) {
      const {
        workDescription,
        selectedWorkTypes,
        selectedRisks,
        selectedEquipments,
        selectedPpe,
        selectedExtraPermissions,
      } = response.preset;
      this.workDescription = this.workDescription.description !== '' ? this.workDescription : workDescription;
      this.selectedWorkTypes = !this.selectedWorkTypes.length ? selectedWorkTypes : this.selectedWorkTypes;
      this.selectedRisks = !this.selectedRisks.length ? selectedRisks : this.selectedRisks;
      this.selectedPpe = !this.selectedPpe.length ? selectedPpe : this.selectedPpe;
      this.selectedEquipments = !this.selectedEquipments.length ? selectedEquipments : this.selectedEquipments;
      this.selectedExtraPermissions = !this.selectedExtraPermissions.length
        ? selectedExtraPermissions
        : this.selectedExtraPermissions;
    }
  }
}
export interface WorkAreaInfo {
  companyCode: string;
  companyName: string;
  facilityCode: string;
  facilityName: string;
  areaGroupCode: string;
  areaGroupName: string;
  areaCode: string;
  areaName: string;
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
  kind: 'contractor' | 'staff' | 'worktype' | 'risk' | 'equipment' | 'ppe' | 'extrawp' | 'gasm' | 'user';
  code: string;
  name: string;
}
export interface WorkDetails {
  description: string;
  dtStart: Date;
  dtEnd?: Date;
  dtCreate?: Date;
  dtClose?: Date;
  owner?: string;
  ownerCode?: string;
  status?: number;
  isgApprove?: boolean;
  isgApproveText?: string;
  areaApprove?: boolean;
  areaApproveText?: string;
  qualityApproveRequired?: boolean;
  qualityApprove?: boolean;
  qualityApproveText?: string;
  rejectedBy?: string;
  rejectReason?: string;
  rejectKind?: string;
  isExtended?: boolean;
  isPendingClose?: boolean;
  isPendingTransfer?: boolean;
  transferTo?: boolean;
}
export interface StaffListResponse {
  staffList: CodeValueItem[];
  lookup: {
    workTypeList: CodeValueItem[];
    riskList: CodeValueItem[];
    equipmentList: CodeValueItem[];
    ppeList: CodeValueItem[];
    extraPermissionList: CodeValueItem[];
  };
  preset: {
    workDescription: WorkDetails;
    selectedWorkTypes: CodeValueItem[];
    selectedRisks: CodeValueItem[];
    selectedEquipments: CodeValueItem[];
    selectedPpe: CodeValueItem[];
    selectedExtraPermissions: CodeValueItem[];
  };
}
export interface ControlQuestions {
  questionGroups: Array<QuestionGroup>;
  controlNotes: string;
}
export interface QuestionGroup {
  code: string;
  name: string;
  priority: number;
  questions: Question[];
}
export interface Question {
  code: string;
  question: string;
  priority: string;
  answer: number;
  answerText: string;
}
export interface GasMeasurement {
  code: string;
  label: string;
  hint: string;
  value: string;
}
export interface SummaryStatsItem {
  pending: number;
  active: number;
  closed: number;
  rejected: number;
}
export interface WorkPermitItem {
  id: number;
  location: WorkAreaInfo;
  project: Project;
  contractor: CodeValueItem;
  staff: CodeValueItem[];
  workTypes: CodeValueItem[];
  equipments: CodeValueItem[];
  risks: CodeValueItem[];
  ppe: CodeValueItem[];
  workPermits: CodeValueItem[];
  gasMeasurements: CodeValueItem[];
  workDescription: WorkDetails;
  controlQuestions: ControlQuestions;
  forms?: Array<WpFormItem>;
}
export interface WpListSelectItem {
  kind: 'workpermit';
  code: string;
  name: string;
  self: WpListItem;
  staff: string;
}
export class WpApproveStepData {
  kind: string = '';
  qrCode: string = '';
  selectedLocation: WorkAreaInfo = {
    companyCode: '',
    companyName: '',
    facilityCode: '',
    facilityName: '',
    areaGroupCode: '',
    areaGroupName: '',
    areaCode: '',
    areaName: '',
  };
  wpList: WpListSelectItem[] = [];
  selectedWp: WpListItem | undefined;
  wpItem: WorkPermitItem | undefined;

  constructor() {}

  clearSelectedLocation(): void {
    this.selectedLocation = {
      companyCode: '',
      companyName: '',
      facilityCode: '',
      facilityName: '',
      areaGroupCode: '',
      areaGroupName: '',
      areaCode: '',
      areaName: '',
    };
  }
}
export class WpFormStepData {
  formType!: WpFormType;
  qrCode: string = '';
  selectedLocation: WorkAreaInfo = {
    companyCode: '',
    companyName: '',
    facilityCode: '',
    facilityName: '',
    areaGroupCode: '',
    areaGroupName: '',
    areaCode: '',
    areaName: '',
  };
  wpList: WpListSelectItem[] = [];
  selectedWp: WpListItem | undefined;
  wpItem: WorkPermitItem | undefined;
  controlQuestions: ControlQuestions = {
    questionGroups: [],
    controlNotes: '',
  };

  constructor() {}

  clearSelectedLocation(): void {
    this.selectedLocation = {
      companyCode: '',
      companyName: '',
      facilityCode: '',
      facilityName: '',
      areaGroupCode: '',
      areaGroupName: '',
      areaCode: '',
      areaName: '',
    };
  }
}
export interface WpFormResponseItem {
  wplist: WpListItem[];
  questionGroups: QuestionGroup[];
}
export interface WpFormDataItem {
  wplist: WpListSelectItem[];
  controlQuestions: ControlQuestions;
}
export interface WpFormItem {
  formType: number;
  dtCreate: Date;
  owner: string;
  workPermitId: number;
  isgApprove?: boolean;
  isgApproveText?: string;
  areaApprove?: boolean;
  areaApproveText?: string;
  qualityApproveRequired?: boolean;
  qualityApprove?: boolean;
  qualityApproveText?: string;
  isRejected?: boolean;
  rejectedByText?: string;
  rejectReason?: string;
  rejectKind?: string;
  controlQuestions: ControlQuestions;
}
