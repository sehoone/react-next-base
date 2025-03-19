/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { DefaultResult, HeaderSetter, RequestOptions } from './types/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { BaseAxios } from './baseAxios';
import { RequestEnum, ContentTypeEnum } from './enum/httpEnum';
import { isString } from '@/utils/is';
import { deepMerge } from '@/utils';
import { formatRequestDate } from './helper';
import { logger } from '@/utils/logger';
import { AuthInfoInterface } from './types/authModel';
import { modalContentAtom } from '@/atoms/commonAtom';
import { getDefaultStore } from 'jotai';

/**
 * @description: AxiosTransform
 */
const transform: AxiosTransform = {
  /**
   * @description: transformResponseHook
   */
  transformResponseHook: <T = DefaultResult>(res: AxiosResponse<T>, options: RequestOptions) => {
    logger.debug('transformResponseHook start');
    const { isReturnNativeResponse, interfaceName } = options;
    logger.debug('transformResponseHook ' + res);
    // 서버응답 그대로 처리(axios 응답을 포함한 응답)
    if (isReturnNativeResponse) {
      return res;
    }
    if (!res) {
      // logger.debug(t('system.api.networkException'));
      // throw new Error(t('system.api.networkException'));
    }
    debugger;
    logger.debug('interfaceName res' + res);
    if (interfaceName === 'ca') {
      // ca 서버 응답 처리
    }
    const data = res as AxiosResponse<DefaultResult>;
    const { dataHeader, dataBody } = data.data;

    if (dataHeader.result == "SUCCESS") {
      return dataBody;
    }

    // // TODO 실패 코드 응답 처리


    // logger.debug('transformResponseHook end');
    return data;
  },

  /**
   * @description: beforeRequestHook
   * 요청보내기 전 처리.
   */
  beforeRequestHook: (config, options) => {
    logger.debug('beforeRequestHook start');
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, urlPrefix } = options;

    if (joinPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    const data = config.data || false;
    if (formatDate && data && !isString(data)) {
      formatRequestDate(data);
    }
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        config.params = Object.assign(params || {});
      } else {
        config.url = config.url + params;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        if (formatDate) {
          formatRequestDate(params);
        }
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data;
          config.params = params;
        } else {
          config.data = params;
          config.params = undefined;
        }
        if (joinParamsToUrl) {
          /*
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data)
          );*/
        }
      } else {
        config.url = config.url + params;
        config.params = undefined;
      }
    }

    logger.debug('beforeRequestHook end');
    return config;
  },

  /**
   * @description: requestInterceptors
   */
  requestInterceptors: async (config, options) => {
    logger.debug('requestInterceptors start');

    const authInfo = {};
    // API인증정보 세팅.

    // 인터페이스별 헤더값 설정
    const interfaceName = options.requestOptions?.interfaceName;
    if (interfaceName && headerSetters[interfaceName]) {
      headerSetters[interfaceName](config, authInfo);
    }

    logger.debug('requestInterceptors end');
    return config;
  },

  /**
   * @description: responseInterceptors
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    logger.debug('responseInterceptors start');
    logger.debug('responseInterceptors end');
    return res;
  },

  /**
   * @description: responseInterceptorsCatch
   */
  responseInterceptorsCatch: (error: any) => {
    logger.debug('responseInterceptorsCatch start' + error);
    // TODO 실패응답 처리. ex. http 실패응답. 401, 403, 404, 500 등
    // const { t } = useI18n();
    const { code, message } = error || {};
    const err: string = error?.toString?.() ?? '';
    // let errMessage = '';

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        // errMessage = t('system.api.apiTimeoutMessage');
      }
      if (err?.includes('Network Error')) {
        // errMessage = t('system.api.networkExceptionMsg');
      }

      // TODO statue 별로 애러메세지 처리
    } catch (error) {
      throw new Error(error as unknown as string);
    }
    logger.debug('fail');
    const store = getDefaultStore();
    store.set(modalContentAtom, `API 통신 실패: ${error.message}`);

    // alert('네트워크 오류 ' + error.message);
    logger.debug('responseInterceptorsCatch end');
    return Promise.reject(error);
  },

  requestCatchHook: (error: Error) => {
    logger.debug('requestCatchHook start');
    logger.debug('requestCatchHook end');
    // alert('네트워크 오류 ' + error.message);
    return Promise.reject(error);
    // }(e: Error, options: RequestOptions) => Promise<unknown>;
  }
};

// axios 헤더값 설정
const headerSetters: { [key: string]: HeaderSetter } = {
  RIC: setDefaultHeaders,
  CA: setCaHeaders,
};

// set 디폴트
// function setDefaultHeaders(config: InternalAxiosRequestConfig<any>, authInfo: AuthInfoInterface) {
function setDefaultHeaders() {
}

// set CA 헤더값
function setCaHeaders(config: InternalAxiosRequestConfig<any>, authInfo: AuthInfoInterface) {
  config.headers['UUID'] = authInfo.uuid;
}

export enum baseAxiosTypeEnum {
  DEFAULT = 'DEFAULT',
  CA = 'CA',
}

// axios baseUrl 설정
export function getAxiosBaseUrl(baseAxiosType: baseAxiosTypeEnum): string {
  const isDummy = process.env.NEXT_PUBLIC_IS_DUMMY || 'false';
  if (isDummy === 'true') {
    return '/dummy-server';
  }

  // 디폴트 서버
  if (baseAxiosType === baseAxiosTypeEnum.DEFAULT) {
    return process.env.NEXT_PUBLIC_RIC_URL || '';
  }

  // CA 서버
  if (baseAxiosType === baseAxiosTypeEnum.CA) {
    return process.env.NEXT_PUBLIC_CA_URL || '';
  }

  return '/';
}


// axios 공통 옵션
const commonBaseAxiosOpt = {
  authenticationScheme: '',
  timeout: 10 * 1000,
  transform,
  withCredentials: true,
  headers: { 'Content-Type': ContentTypeEnum.JSON },
  requestOptions: {
    joinPrefix: false,
    isReturnNativeResponse: false,
    isTransformResponse: true,
    joinParamsToUrl: false,
    formatDate: true,
    errorMessageMode: 'modal',
    joinTime: true,
    withToken: true,
    retryMaxCount: 3,
    retryCount: 0
  }
};

/**
 * @description: 디폴트 axios 생성
 */
function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new BaseAxios(
    deepMerge(
      {
        ...commonBaseAxiosOpt,
        baseURL: getAxiosBaseUrl(baseAxiosTypeEnum.DEFAULT),
        requestOptions: {
          ...commonBaseAxiosOpt.requestOptions,
          interfaceName: 'RIB'
        }
      },
      opt || {}
    )
  );
}

// CA 서버 axios 생성
function createCaAxios(opt?: Partial<CreateAxiosOptions>) {
  return new BaseAxios(
    deepMerge(
      {
        ...commonBaseAxiosOpt,
        authenticationScheme: 'bearer',
        withCredentials: false,
        baseURL: getAxiosBaseUrl(baseAxiosTypeEnum.CA),
        requestOptions: {
          ...commonBaseAxiosOpt.requestOptions,
          interfaceName: 'CA'
        }
      },
      opt || {}
    )
  );
}
/**
 * @description: defHttp
 * axios 디폴트 옵션으로 생성
 * ex. defHttp.get<HellowModel>({ url: Api.GetHellowWorld });
 */
export const defHttp = createAxios();

/**
 * @description: defHttpOpt
 * axios 커스텀 옵션으로 생성. 디폴트 설정에서 커스텀이 필요한 필드와 merge
 * ex. defHttpOpt({ timeout: 200 * 1000 }).get<HellowModel>({url: Api.GetHellowWorld,});
 */
export const defHttpOpt = (opt?: Partial<CreateAxiosOptions>): BaseAxios => createAxios(opt);

/**
 * @description: caHttp
 * axios 디폴트 CA 옵션으로 생성
 * ex. caHttp.get<HellowModel>({ url: Api.GetHellowWorld });
 */
export const caHttp = createCaAxios();

/**
 * @description: caHttpOpt
 * axios 커스텀 옵션으로 생성. 디폴트 설정에서 커스텀이 필요한 필드와 merge
 * ex. caHttpOpt({ timeout: 200 * 1000 }).get<HellowModel>({url: Api.GetHellowWorld,});
 */
export const caHttpOpt = (opt?: Partial<CreateAxiosOptions>): BaseAxios => createCaAxios(opt);