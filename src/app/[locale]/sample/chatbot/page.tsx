'use client';
import { useEffect, useRef, useState } from 'react';
import chatbotIframeBridge, { createIframeMessage } from './chatbot-iframe-bridge';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

const genId = () => Math.random().toString(36).slice(2) + Date.now();

export default function Page() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    { id: genId(), from: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');

  // 토스트 관련 state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    chatbotIframeBridge.sendMessageToParent(
      createIframeMessage({
        type: 'init',
      }),
      'http://localhost:8080', // 부모 origin(환경변수로 환경별 설정 필요)
    );
    // 부모로부터 메시지 받기
    chatbotIframeBridge.listenMessageFromParent((data) => {
      // (`부모 메시지: ${JSON.stringify(data)}`);
      console.warn(`부모 메시지11: ${JSON.stringify(data)}`);
      setToastMsg(JSON.stringify(data));
      setShowToast(true);
      const timeoutId = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timeoutId);
    }, 'http://localhost:8080'); // 부모 origin(환경변수로 환경별 설정 필요)
  }, []);

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    const userMsg: ChatMessage = { id: genId(), from: 'user', text: input };

    chatbotIframeBridge.sendMessageToParent(
      createIframeMessage({
        type: 'sample1',
        payload: { text: input },
      }),
      'http://localhost:8080', // 부모 origin(환경변수로 환경별 설정 필요)
    );
    setChatMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { id: genId(), from: 'bot', text: `"${input}" 라고 하셨군요!` },
      ]);
    }, 500);
    setInput('');
  };

  // 헤더와 입력창의 높이(px)를 정확히 지정
  const HEADER_HEIGHT = 56; // px (py-3 + font 등, 필요시 개발자도구로 직접 측정)
  const FOOTER_HEIGHT = 64; // px (py-2 + input + 버튼 높이)

  return (
    <div className="relative min-h-screen bg-base-200">
      {/* 상단 고정 헤더 */}
      <div
        className="fixed top-0 left-0 w-full bg-primary text-primary-content text-center py-3 shadow z-10"
        style={{ height: HEADER_HEIGHT }}
      >
        챗봇영역_타이틀
      </div>
      {/* DaisyUI Toast */}
      {showToast && (
        <div className="toast fixed left-1/2 -translate-x-1/2 z-50" style={{ bottom: `${FOOTER_HEIGHT + 15}px` }}>
          <div className="alert bg-base-200 text-base-content">
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
      {/* 하단 고정 입력창 */}
      <form
        className="fixed bottom-0 left-0 w-full bg-base-100 flex gap-2 py-2 px-2 border-t z-10 max-w-md mx-auto"
        style={{ height: FOOTER_HEIGHT, boxSizing: 'border-box' }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          className="input input-bordered flex-1"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="btn btn-primary min-w-[60px]" type="submit">
          보내기
        </button>
      </form>

      {/* 메시지 영역: 헤더/입력창 높이만큼 padding, 내부만 스크롤 */}
      <div
        className="mx-auto w-full max-w-md"
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: FOOTER_HEIGHT,
          boxSizing: 'border-box',
          height: `100dvh`,
        }}
      >
        <div
          className="flex flex-col gap-2 h-full overflow-y-auto px-2"
          style={{
            // 전체 높이에서 헤더/하단 입력창을 뺀만큼만 내부 스크롤
            height: `calc(100dvh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
          }}
        >
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`chat ${msg.from === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div
                className={`chat-bubble ${
                  msg.from === 'user'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300'
                } max-w-[75%]`}
                style={{ wordBreak: 'break-word' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatMessagesEndRef} />
        </div>
      </div>
    </div>
  );
}
