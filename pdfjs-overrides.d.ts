// pdfjs-overrides.d.ts

declare module 'pdfjs-dist/legacy/build/pdf' {
  const pdfjs: any;
  export = pdfjs;
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const workerSrc: string;
  export default workerSrc;
}
