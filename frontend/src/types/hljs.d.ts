// types/hljs.d.ts
declare module 'highlight.js' {
  export function highlight(code: string, options: { language: string }): { value: string }
  export function highlightAuto(code: string): { value: string; language: string }
  export function highlightAll(): void
  export function getLanguage(name: string): boolean
}
