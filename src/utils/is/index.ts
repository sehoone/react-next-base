/* eslint-disable @typescript-eslint/no-explicit-any */
const toString = Object.prototype.toString;

/**
 * @description: 값이 특정 타입인지 확인
 */
export function is(val: unknown, type: string) {
    return toString.call(val) === `[object ${type}]`;
}

/**
 * @description: 함수인지 확인
 */
export function isFunction<T = Function>(val: unknown): val is T {
    return is(val, "Function");
}

/**
 * @description: 정의된 값인지 확인
 */
export const isDef = <T = unknown>(val?: T): val is T => {
    return typeof val !== "undefined";
};

export const isUnDef = <T = unknown>(val?: T): val is T => {
    return !isDef(val);
};
/**
 * @description: 객체인지 확인
 */
export const isObject = (val: any): val is Record<any, any> => {
    return val !== null && is(val, "Object");
};

/**
 * @description: 날짜인지 확인
 */
export function isDate(val: unknown): val is Date {
    return is(val, "Date");
}

/**
 * @description: 숫자인지 확인
 */
export function isNumber(val: unknown): val is number {
    return is(val, "Number");
}

/**
 * @description: AsyncFunction인지 확인
 */
export function isAsyncFunction<T = any>(val: unknown): val is Promise<T> {
    return is(val, "AsyncFunction");
}

/**
 * @description: Promise인지 확인
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
    return is(val, "Promise") && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

/**
 * @description: 문자열인지 확인
 */
export function isString(val: unknown): val is string {
    return is(val, "String");
}

/**
 * @description: boolean 타입인지 확인
 */
export function isBoolean(val: unknown): val is boolean {
    return is(val, "Boolean");
}

/**
 * @description: 배열인지 확인
 */
export function isArray(val: any): val is Array<any> {
    return val && Array.isArray(val);
}

/**
 * @description: 클라이언트인지 확인
 */
export const isClient = () => {
    return typeof window !== "undefined";
};

/**
 * @description: 브라우저인지 확인
 */
export const isWindow = (val: any): val is Window => {
    return typeof window !== "undefined" && is(val, "Window");
};

export const isElement = (val: unknown): val is Element => {
    return isObject(val) && !!val.tagName;
};

export const isServer = typeof window === "undefined";

// 이미지 노드인지 확인
export function isImageDom(o: Element) {
    return o && ["IMAGE", "IMG"].includes(o.tagName);
}

export function isNull(val: unknown): val is null {
    return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
    return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
    return isUnDef(val) || isNull(val);
}