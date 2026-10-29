// 让 electron-vite 的 ?raw 静态文本导入具备类型。
declare module '*?raw' {
  const content: string
  export default content
}
