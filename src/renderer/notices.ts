import type { InjectionKey } from 'vue';

export type NoticeKind = 'info' | 'success' | 'warning' | 'error';
export type NoticeHandler = (message: string, kind?: NoticeKind) => void;

export const noticeKey: InjectionKey<NoticeHandler> = Symbol('notice');
