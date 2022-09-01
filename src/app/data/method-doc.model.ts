export interface MethodDoc {
  VersionCode: string;
  Version: number;
  VersionStatus: number;
  VersionNotes: string;

  ContractorOfficial?: string;
  ContractorOfficialPhone?: string;
  NoEquipments?: boolean;
  NoPpe?: boolean;
  NoRisks?: boolean;
  NoSubContractors?: boolean;

  WorkDefinition: string;
  WorkAreas: CodeValueItem[];
  WorkTypes: CodeValueItem[];
  Equipments: CodeValueItem[];
  Ppe: CodeValueItem[];
  Risks: CodeValueItem[];
  SubContractors: SubContractorItem[];
  Tasks: Task[];
  Sections: Section[];

  RefData: Lookup;
}

export interface CodeValueItem {
  Priority: number;
  Code: string;
  Value: string;
}

export interface Task {
  Id: string;
  Priority: number;
  Name: string;
  RiskCategory: number;
  RiskCategoryName: string;
  NoTaskRisks?: boolean;
  TaskRisks: TaskRisk[];
  NoPrecautions?: boolean;
  Precautions: TaskRisk[];
  NoWorkPermits?: boolean;
  WorkPermits: CodeValueItem[];
  NoRequiredSkills?: boolean;
  RequiredSkills: CodeValueItem[];
}

export interface TaskRisk {
  Id: string;
  Priority: number;
  Name: string;
  Rating: TaskRiskRating;
  ParentId?: string;
}

export interface TaskRiskRating {
  Probability: number;
  ProbabilityName: string;
  Intensity: number;
  IntensityName: string;
  RiskValue: number;
  RiskValueName: string;
}

export interface Section {
  Code: string;
  Title: string;
  Priority: number;
  Questions: SectionQuestion[];
}

export interface SectionQuestion {
  Code: string;
  Title: string;
  Priority: number;
  AnswerKind: number;
  AvailableOptions: SectionQuestionAnswerOption[];
  Answer: SectionQuestionAnswer;
}

export interface SectionQuestionAnswerOption {
  Code: string;
  Value: string;
  Text: string;
}

export interface SectionQuestionAnswer {
  Code: string;
  Value: string;
}

export interface ProjectInfo {
  CompanyCode: string;
  CompanyName: string;
  FacilityCode: string;
  FacilityName: string;
  ContractorCode: string;
  ContractorName: string;
  ProjectCode: string;
  ProjectName: string;
  ProjectDesc: string;
  ProjectOwner: string;
  ProjectStartDate: Date;
  ProjectEndDate: Date;
}

export interface SubContractorItem {
  Priority: number;
  Id: string;
  Name: string;
  TaskSteps: string;
}

export interface Lookup {
  Project: ProjectInfo;
  WorkTypes: CodeValueItem[];
  WorkAreas: CodeValueItem[];
  Equipments: CodeValueItem[];
  WorkPermits: CodeValueItem[];
  Skills: CodeValueItem[];
  Ppe: CodeValueItem[];
  Risks: CodeValueItem[];
}
