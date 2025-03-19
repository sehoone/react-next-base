export {};

declare global {
  interface Window {
    // 외부라이브러리 함수 호출을 위한 타입 정의
    callExtraLib: () => void;
  }
}