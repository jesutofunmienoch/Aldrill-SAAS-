'use client';

import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing must be done in the browser.');
  }

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.entry')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    text += pageText + '\n';
  }

  return text;
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractTextFromImage(file: File): Promise<string> {
  const {
    data: { text },
  } = await Tesseract.recognize(file, 'eng');
  return text;
}
