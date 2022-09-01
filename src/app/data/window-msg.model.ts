import { MethodDoc } from './method-doc.model';

export interface WinCommMsg<T> {
  action: string;
  data: T;
}

export interface FailureMsgData {
  reason: string;
  reasonMsg: string;
}

export interface HandshakeMsgData {
  companyCode: string;
  versionCode: string;
}

export interface KeepAliveMsgData {
  companyCode: string;
  versionCode: string;
  type: 'editMethodDoc' | 'viewMethodDoc' | undefined;
}

export interface SaveDocMsgData {
  companyCode: string;
  versionCode: string;
  doc: MethodDoc;
}

export interface RejectDocMsgData {
  companyCode: string;
  versionCode: string;
  reason: string;
}
