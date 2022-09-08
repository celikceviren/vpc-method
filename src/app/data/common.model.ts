import { CodeValueItem, SubContractorItem, Task, TaskRisk } from './method-doc.model';

export enum FormSection {
  workInfo = 'workInfo',
  workTypes = 'workTypes',
  risks = 'risks',
  equipments = 'equipments',
  ppe = 'ppe',
  tasks = 'tasks',
  contractors = 'contractors',
}

export namespace StaticValues {
  export const SELECT_OPTION_NONE_CODE: string = 'NONE';
  export const SELECT_OPTION_NONE_VALUE: string = 'Hiçbiri';
  export const QUESTION_ANSWER_YES_CODE: number = 1;
  export const QUESTION_ANSWER_YES_VALUE: string = 'Evet';
  export const QUESTION_ANSWER_NO_CODE: number = 2;
  export const QUESTION_ANSWER_NO_VALUE: string = 'Hayır';
  export const QUESTION_ANSWER_NAN_CODE: number = 3;
  export const QUESTION_ANSWER_NAN_VALUE: string = 'Gerekli Değil';
  export const GAS_MEASUREMENT_O2_CODE: string = 'O2';
  export const GAS_MEASUREMENT_O2_TEXT: string = 'O2 (OKSİJEN) %VOL';
  export const GAS_MEASUREMENT_O2_HINT: string = '(min %19,5 max %23,5)';
  export const GAS_MEASUREMENT_CH4_CODE: string = 'CH4';
  export const GAS_MEASUREMENT_CH4_TEXT: string = 'CH4 (METAN)';
  export const GAS_MEASUREMENT_CH4_HINT: string = '(min %5, max %15)';
  export const GAS_MEASUREMENT_CO_CODE: string = 'CO';
  export const GAS_MEASUREMENT_CO_TEXT: string = 'CO (Karbon Monoksit) PPM';
  export const GAS_MEASUREMENT_CO_HINT: string = '< (35ppm)';
  export const GAS_MEASUREMENT_H2S_CODE: string = 'H2S';
  export const GAS_MEASUREMENT_H2S_TEXT: string = 'H2S (Hidrojen Sülfür) PPM';
  export const GAS_MEASUREMENT_H2S_HINT: string = '< (35ppm)';
  export const GAS_MEASUREMENT_VOC_CODE: string = 'VOC';
  export const GAS_MEASUREMENT_VOC_TEXT: string = 'VOC (LEL)';
  export const GAS_MEASUREMENT_VOC_HINT: string = '%LEL<1';
  export const WP_APPROVE_KIND_ISG_ID: number = 1;
  export const WP_APPROVE_KIND_AREA_ID: number = 2;
  export const WP_APPROVE_KIND_ISG: string = 'isg';
  export const WP_APPROVE_KIND_AREA: string = 'area';
}

export interface CodeValueSelectItem {
  item: CodeValueItem;
  selected: boolean;
}

export interface TaskFormDialogData {
  isEdit?: boolean;
  task?: Task;
  workPermits: CodeValueItem[];
  skills: CodeValueItem[];
}

export interface ConfirmDialogData {
  title?: string;
  body: string;
  hasConfirmBtn?: boolean;
  confirmBtnText?: string;
  closeBtnText?: string;
}

export interface TaskRiskFormDialogData {
  isEdit?: boolean;
  taskId: string;
  companyCode: string;
  type: 'risk' | 'precaution';
  item?: TaskRisk;
  parents?: TaskRisk[];
}

export interface ContractorFormDialogData {
  isEdit?: boolean;
  item?: SubContractorItem;
}

export interface InfoDialogData {
  title?: string;
  heading?: string;
  body: string;
  dismissable?: boolean;
  dismissText?: string;
  isLoading?: boolean;
}

export const PladisProbabilityValues: Array<{ value: number; label: string; tooltip?: string }> = [
  { value: 1, label: 'Çok küçük', tooltip: 'Yılda bir' },
  { value: 2, label: 'Küçük', tooltip: 'Üç ayda bir' },
  { value: 3, label: 'Orta', tooltip: 'Ayda bir' },
  { value: 4, label: 'Yüksek', tooltip: 'Haftada bir' },
  { value: 5, label: 'Çok yüksek', tooltip: 'Her gün' },
];

export const PladisIntensityValues: Array<{ value: number; label: string; tooltip?: string }> = [
  { value: 1, label: 'Çok hafif', tooltip: 'İlk yardım gerektirmeyen' },
  { value: 2, label: 'Hafif', tooltip: 'İlk yardımlı iş kazası' },
  { value: 3, label: 'Orta', tooltip: 'Basit Yaralanmalı iş kazası' },
  { value: 4, label: 'Ciddi', tooltip: 'Ciddi Yaralanmalı (Uzuv kaybı, kırık vb.)' },
  { value: 5, label: 'Çık ciddi', tooltip: 'Ölümlü iş kazası, Meslek hastalığı' },
];

export const PladisRiskValues: Array<{ key: string; value: string; color: string }> = [
  { key: '0101', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0102', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0103', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0104', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0105', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0201', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0202', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0203', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0204', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0205', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0301', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0302', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0303', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0304', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0305', value: 'Kabul Edilemez Risk', color: 'red' },
  { key: '0401', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0402', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0403', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0404', value: 'Kabul Edilemez Risk', color: 'red' },
  { key: '0405', value: 'Kabul Edilemez Risk', color: 'red' },
  { key: '0501', value: 'Kabul Edilebilir Risk', color: 'green' },
  { key: '0502', value: 'Dikkate Değer Risk', color: 'orange' },
  { key: '0503', value: 'Kabul Edilemez Risk', color: 'red' },
  { key: '0504', value: 'Kabul Edilemez Risk', color: 'red' },
  { key: '0505', value: 'Kabul Edilemez Risk', color: 'red' },
];

export const NestleProbabiltyValues: Array<{ value: number; label: string; tooltip?: string }> = [
  { value: 1, label: 'Neredeyse İmkansız', tooltip: 'Hiç' },
  { value: 2, label: 'Muhtemel Değil', tooltip: 'Ender - seyrek' },
  { value: 3, label: 'Muhtemel', tooltip: 'Ara sıra - nadiren' },
  { value: 4, label: 'Kuvvetle Muhtemel', tooltip: 'Sık sık' },
];

export const NestleIntensityValues: Array<{ value: number; label: string }> = [
  { value: 1, label: 'İlkyardım' },
  { value: 2, label: 'Raporlanabilir' },
  { value: 3, label: 'Geri Dönülmez' },
  { value: 4, label: 'Ölümcül' },
];

export const NestleRiskValues: Array<{ key: string; value: string; color: string }> = [
  { key: '0101', value: 'Düşük Risk', color: 'green' },
  { key: '0102', value: 'Düşük Risk', color: 'green' },
  { key: '0103', value: 'Orta Risk', color: 'yellow' },
  { key: '0104', value: 'Orta Risk', color: 'yellow' },
  { key: '0201', value: 'Düşük Risk', color: 'green' },
  { key: '0202', value: 'Orta Risk', color: 'yellow' },
  { key: '0203', value: 'Yüksek Risk', color: 'orange' },
  { key: '0204', value: 'Yüksek Risk', color: 'orange' },
  { key: '0301', value: 'Orta Risk', color: 'yellow' },
  { key: '0302', value: 'Yüksek Risk', color: 'orange' },
  { key: '0303', value: 'Yüksek Risk', color: 'orange' },
  { key: '0304', value: 'Çok Yüksek Risk', color: 'red' },
  { key: '0401', value: 'Orta Risk', color: 'yellow' },
  { key: '0402', value: 'Yüksek Risk', color: 'orange' },
  { key: '0403', value: 'Çok Yüksek Risk', color: 'red' },
  { key: '0404', value: 'Çok Yüksek Risk', color: 'red' },
];
