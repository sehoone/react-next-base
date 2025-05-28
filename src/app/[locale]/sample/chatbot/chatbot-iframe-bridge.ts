/**
 * IframeMessenger: 부모-자식(iframe) 간 메시지 통신 라이브러리 (TypeScript 버전)
 *
 * - ES Module, CommonJS, <script> (window) 방식 모두 지원
 * - 메시지는 IframeMessage 타입 기반으로 규격화
 */
export type MessageCallback<T = any> = (data: IframeMessage<T>, event: MessageEvent) => void;

export type IframeMessage<T = any> = {
  /** 메시지 종류(이벤트명) - 예: 'ready', 'init', 'data', 'error', 'close' 등 */
  type: string;
  /** 상태 */
  status: 'success' | 'error';
  /** 데이터 */
  payload?: T;
};

export type IIframeMessenger = {
  sendMessageToChild: <T = any>(
    iframeEl: HTMLIFrameElement,
    message: IframeMessage<T>,
    targetOrigin?: string
  ) => void;

  listenMessageFromChild: <T = any>(
    callback: MessageCallback<T>,
    allowedOrigin?: string
  ) => void;

  sendMessageToParent: <T = any>(
    message: IframeMessage<T>,
    targetOrigin?: string
  ) => void;

  listenMessageFromParent: <T = any>(
    callback: MessageCallback<T>,
    allowedOrigin?: string
  ) => void;
};

/**
 * IframeMessage 생성 헬퍼
 * - messageParams로 전달한 값이 우선 적용됨
 * - 디폴트 값: status 'success', source 'child', version '1.0.0', timestamp 현재시간 등
 */
export function createIframeMessage<T>(
  messageParams: Partial<IframeMessage<T>> & { type: string },
): IframeMessage<T> {
  return {
    status: 'success',
    payload: undefined,
    ...messageParams, // 전달한 값으로 덮어씀(override)
  };
}

const IframeMessenger: IIframeMessenger = {
  sendMessageToChild<T = any>(
    iframeEl: HTMLIFrameElement,
    message: IframeMessage<T>,
    targetOrigin: string = '*',
  ): void {
    if (!iframeEl || !iframeEl.contentWindow) {
      throw new Error('유효한 iframe 요소를 전달하세요.');
    }
    iframeEl.contentWindow.postMessage(message, targetOrigin);
  },

  listenMessageFromChild<T = any>(
    callback: MessageCallback<T>,
    allowedOrigin?: string,
  ): void {
    window.addEventListener('message', (event: MessageEvent) => {
      // 메시지 형태를 체크하여 IframeMessage 타입만 처리
      const data = event.data;
      if (
        typeof data === 'object'
        && data !== null
        && typeof data.type === 'string'
        && (data.status === 'success' || data.status === 'error')
      ) {
        if (!allowedOrigin || event.origin === allowedOrigin) {
          callback(data, event);
        }
      }
    });
  },

  sendMessageToParent<T = any>(
    message: IframeMessage<T>,
    targetOrigin: string = '*',
  ): void {
    window.parent.postMessage(message, targetOrigin);
  },

  listenMessageFromParent<T = any>(
    callback: MessageCallback<T>,
    allowedOrigin?: string,
  ): void {
    window.addEventListener('message', (event: MessageEvent) => {
      // 부모만 허용
      if (window.parent && event.source !== window.parent) {
        return;
      }
      const data = event.data;
      if (
        typeof data === 'object'
        && data !== null
        && typeof data.type === 'string'
        && (data.status === 'success' || data.status === 'error')
      ) {
        if (!allowedOrigin || event.origin === allowedOrigin) {
          callback(data, event);
        }
      }
    });
  },

};

export default IframeMessenger;
