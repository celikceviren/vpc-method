import { CodeValueItem, ServiceError } from './workpermit.model';

export enum WpStatus {
  PENDING = 1,
  ACTIVE,
  CLOSED,
  REJECTED,
}

export enum WpScope {
  SELF = 'self',
  AREA_GROUP = 'areagroup',
  FACILITY = 'facility',
  COMPANY = 'company',
  PROJECT = 'project',
}

export enum WpRole {
  OWNER = 'owner',
  APPROVAL_ISG = 'approvalisg',
  APPROVAL_AREA = 'approvalarea',
  VIEWER = 'viewer',
}

export interface PaginatedListResult<T> {
  items: Array<T>;
  result: boolean;
  error?: ServiceError;
  page: number;
  size: number;
  total: number;
}

export interface WpListItem {
  id: number;
  owner: string;
  ownerCode: string;
  contractor: string;
  project: string;
  projectOwner: string;
  dtCreate: Date;
  dtStart: Date;
  dtEnd: Date;
  status: number;
  staff: CodeValueItem[];
  permissions: string[];
  workArea: string;
  workAreaGroup: string;
  isgApproved?: boolean;
  areaApproved?: boolean;
  isExtended?: boolean;
}
