export interface AreaGroupListItem {
  id: number;
  code: string;
  name: string;
  facility: string;
  facilityCode: string;
  areaCount: number;
}

export interface AreaGroupFormDialogData {
  isEdit?: boolean;
  item?: AreaGroupListItem;
  facilities: Array<{ id: string; name: string }>;
}

export interface AreaListItem {
  id: number;
  code: string;
  name: string;
  qrCode: string;
  areaGroup: string;
  areaGroupCode: string;
  facility: string;
  facilityCode: string;
}

export interface AreaFormDialogData {
  isEdit?: boolean;
  item?: AreaListItem;
  facilities: Array<{ id: string; name: string }>;
  areaGroups: Array<AreaGroupListItem>;
}
