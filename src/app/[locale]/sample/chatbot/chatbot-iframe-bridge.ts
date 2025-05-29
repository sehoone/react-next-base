/**
 * chatbot-iframe-bridge: 학습창, 챗UI 부모-자식(iframe) 간 메시지 통신 라이브러리 (TypeScript 버전)
 */
export type MessageCallback<T = any> = (data: IframeMessage<T>, event: MessageEvent) => void;

// IframeMessage 타입 정의
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
 * - 디폴트 값: status 'success', payload undefined
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
  // 자식 iframe으로 메시지 전송
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

  // 자식으로부터 메시지 수신
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

  // 부모로 메시지 전송
  sendMessageToParent<T = any>(
    message: IframeMessage<T>,
    targetOrigin: string = '*',
  ): void {
    window.parent.postMessage(message, targetOrigin);
  },

  // 부모로부터 메시지 수신
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
