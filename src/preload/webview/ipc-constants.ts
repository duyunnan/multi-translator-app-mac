/**
 * WebView 注入脚本本地 IPC 通道常量。
 * 保持与 shared/types.ts 的 IPC 值一致，但独立定义以维持注入脚本自包含
 * （避免打包出共享 chunk，webview sandbox 中无法 require 相对路径文件）。
 */
export const IPC_W = {
  TranslateText: 'translate-text',
  GenerateReply: 'generate-reply',
  SpeechRecognize: 'speech-recognize',
  WebviewGetConfig: 'webview:get-config',
  UnreadReport: 'mt-unread',
  ActivityReport: 'mt-activity',
} as const
