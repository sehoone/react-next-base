export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined;

// axios request header setter type
type HeaderSetter = (config: any, authInfo: any) => void;

// 요청 처리 옵션
export interface RequestOptions {
  // Splicing request parameters to url
  joinParamsToUrl?: boolean;
  // Format request parameter time
  formatDate?: boolean;
  // Whether to process the request result
  isTransformResponse?: boolean;
  // Whether to return native response headers
  // For example: use this attribute when you need to get the response headers
  isReturnNativeResponse?: boolean;
  // Whether to join url
  joinPrefix?: boolean;
  // Interface address, use the default apiUrl if you leave it blank
  apiUrl?: string;
  // URL prefix
  urlPrefix?: string;
  // Error message prompt type
  errorMessageMode?: ErrorMessageMode;
  // Whether to add a timestamp
  joinTime?: boolean;
  // Whether to send token in header
  withToken?: boolean;
  // 인터페이스명
  interfaceName?: string;
}

interface DataHeader {
  trxCd: string;
  globId: string;
  reqMsgIlsi: string;
  outMsgIlsi: string;
  language: string;
  subChannel: string;
  result: string;
  resultCode: string;
  resultMsg: string | null;
  resultDetail: string | null;
  channelGbn: string;
  submitGbn: string;
  programId: string;
  webProcGbn: string;
  locale: string;
  encG: number;
  secChal1: string;
  secChal2: string;
  uuid: string;
}
// API response
// export interface Result<T = unknown> {
//   rstCd: string;
//   dta: T;
//   errMsg: string;
// }
export interface DefaultResult<T = unknown> {
  dataHeader: DataHeader;
  dataBody: T;
}

// ca 서버 응답
export interface CaResult<T = unknown> {
  rstCd: number;
  dta: T;
}
