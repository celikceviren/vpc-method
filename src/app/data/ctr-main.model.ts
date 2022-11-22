export enum CtrReviewStatus {
  PENDING = 0,
  COMPLETED,
}

export enum CtrReviewFormType {
  PROJECT_OWNER = 0,
  ISG,
  AREA_MNG,
  QUALITY_MNG,
}

export enum CtrReviewListScope {
  USER = 'user',
  PROJECT = 'project',
  CONTRACTOR = 'contractor',
}

export enum CtrReviewFormParamType {
  REVIEW = 'review',
  PROJECT = 'project',
}

export interface CtrReviewItem {
  id: number;
  pending: boolean;
  completed: boolean;
  allowed: boolean;
  dtCreate: Date;
  dtComplete?: Date;
  rating: number;
  user: {
    username: string;
    usercode: string;
    name: string;
  };
  project: {
    code: string;
    name: string;
    desc: string;
    dtStart: string;
    owner: string;
    ownerCode: string;
    facility: string;
    facilityCode: string;
  };
  contractor: {
    code: string;
    name: string;
  };
  submittedForm?: Array<{ answerText: string; id: number; rating: number; text: string }>;
}

export interface CtrReviewForm {
  review?: CtrReviewItem;
  form?: CtrReviewFormItem;
}

export interface CtrReviewFormItem {
  id: number;
  type: number;
  name: string;
  questions: Array<CtrReviewFormQuestionItem>;
}

export interface CtrReviewFormQuestionItem {
  id: number;
  text: string;
  order: number;
}

export interface CtrReviewFormAnswerItem {
  questionId: number;
  value: number;
  text: string;
}

export interface CtrReviewStatsItem {
  pending: number;
  completed: number;
}

export interface CtrReviewLegendItem {
  min: number;
  max: number;
  name: string;
  desc: string;
  color?: string;
}
