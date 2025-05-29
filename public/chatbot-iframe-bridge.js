/**
 * chatbot-iframe-bridge: 학습창, 챗UI 부모-자식(iframe) 간 메시지 통신 라이브러리 (IIFE, window 전역 등록)
 */
(function (global) {
  const chatbotIframeBridge = {
    /**
     * iframe을 생성(또는 기존 id의 엘리먼트 사용)하고 로드 완료를 await로 확인하는 초기화 함수
     * @param {string} iframeId - 사용할 iframe의 id
     * @param {string} childUrl - 띄울 자식 사이트의 주소(src)
     * @param {object} [options] - { parent: DOMElement, width, height, ... }
     * @returns {Promise<HTMLIFrameElement>} - 로드 완료된 iframe 엘리먼트 반환
     */
    async init(iframeId, childUrl, options = {}) {
      let iframe = document.getElementById(iframeId);
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.border = 'none';
        iframe.width = options.width || '600';
        iframe.height = options.height || '400';
        // 필요시 기타 옵션 추가
        (options.parent || document.body).appendChild(iframe);
      }
      iframe.src = childUrl;

      return await new Promise((resolve, reject) => {
        let timeoutId;
        function onMessage(event) {
          // 보안상 origin 체크 필요!
          if (options.allowedOrigin && event.origin !== options.allowedOrigin) {
            return;
          }
          // 자식화면으로 부터 type: 'init' 메시지가 오면 성공 처리
          if (event.source === iframe.contentWindow && event.data && event.data.type === 'init') {
            window.removeEventListener('message', onMessage);
            clearTimeout(timeoutId);
            resolve(iframe);
          }
        }
        window.addEventListener('message', onMessage);

        // 타임아웃 예외 처리 30초
        timeoutId = setTimeout(() => {
          window.removeEventListener('message', onMessage);
          reject(new Error('iframe init 메시지를 기다리다 타임아웃'));
        }, 10000);
      });
    },
    /**
     * 부모에서 자식 iframe에 메시지 보내기
     * @param {HTMLIFrameElement} iframeEl - iframe DOM Element
     * @param {any} message - 전송할 데이터 (객체 권장)
     * @param {string} [targetOrigin] - 허용할 origin
     */
    sendMessageToChild(iframeEl, message, targetOrigin) {
      if (!iframeEl || !iframeEl.contentWindow) {
        throw new Error('유효한 iframe 요소를 전달하세요.');
      }
      iframeEl.contentWindow.postMessage(message, targetOrigin || '*');
    },

    /**
     * 자식(iframe)에서 오는 메시지 받기 (부모에서 사용)
     * @param {Function} callback - 이벤트 수신 콜백 (data, event)
     * @param {string} [allowedOrigin] - 허용할 origin
     */
    listenMessageFromChild(callback, allowedOrigin) {
      window.addEventListener('message', (event) => {
        if (!allowedOrigin || event.origin === allowedOrigin) {
          callback(event.data, event);
        }
      });
    },

    /**
     * 자식에서 부모에게 메시지 보내기
     * @param {any} message - 전송할 데이터
     * @param {string} [targetOrigin] - 허용할 origin
     */
    sendMessageToParent(message, targetOrigin) {
      window.parent.postMessage(message, targetOrigin || '*');
    },

    /**
     * 부모로부터 메시지 받기 (자식에서 사용)
     * @param {Function} callback - 이벤트 수신 콜백 (data, event)
     * @param {string} [allowedOrigin] - 허용할 origin
     */
    listenMessageFromParent(callback, allowedOrigin) {
      window.addEventListener('message', (event) => {
        if (window.parent && event.source !== window.parent) {
          return;
        }
        if (!allowedOrigin || event.origin === allowedOrigin) {
          callback(event.data, event);
        }
      });
    },
    /**
     * IframeMessage 메시지 생성 헬퍼
     * - messageParams로 전달한 값이 우선 적용됨
     * - 기본값: status 'success', payload undefined
     * - type은 필수
     */
    createIframeMessage(messageParams) {
      if (!messageParams || typeof messageParams.type !== 'string') {
        throw new Error('type 필드는 필수입니다.');
      }
      return Object.assign(
        {
          status: 'success',
          payload: undefined,
        },
        messageParams,
      );
    },
  };

  // window 전역 등록
  global.chatbotIframeBridge = chatbotIframeBridge;
})(typeof window !== 'undefined' ? window : this);
