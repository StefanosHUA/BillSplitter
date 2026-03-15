import { createWorker } from 'tesseract.js';

export interface ScannedItem {
  tempId: string;
  name: string;
  price: number;
}

export const processReceiptImage = async (file: File): Promise<ScannedItem[]> => {
  // SENIOR MOVE: Load both English and Greek data packs
  // 'ell' is the ISO code for Modern Greek
  const worker = await createWorker('eng+ell'); 
  
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  const lines = text.split('\n');
  const items: ScannedItem[] = [];

  // Updated noise keywords to include common Greek receipt terms
  const NOISE_KEYWORDS = [
    'total', 'subtotal', 'vat', 'tax', 'fpa', 'φπα', 
    'visa', 'mastercard', 'cash', 'change', 'terminal', 
    'receipt', 'approval', 'sum', 'balance', 'items', 'qty',
    'συνολο', 'μεταφορα', 'καθαρη', 'αξια', 'εκπτωση' // Greek keywords
  ];

  lines.forEach(line => {
    // We updated the regex to support Greek characters in the name [α-ωΑ-Ω]
    const match = line.match(/^(\d+)?x?\s*([a-zA-Zα-ωΑ-Ω\s]+?)\s*€?\s*(\d+[.,]\d{2})/i);
    
    if (match) {
      const quantity = match[1] ? parseInt(match[1]) : 1;
      const rawName = match[2].trim();
      const lineTotalPrice = parseFloat(match[3].replace(',', '.'));
      
      const isNoise = NOISE_KEYWORDS.some(word => 
        rawName.toLowerCase().includes(word)
      );

      const hasMetadataPunctuation = rawName.includes(':');

      if (!isNoise && !hasMetadataPunctuation && lineTotalPrice > 0) {
        const unitPrice = lineTotalPrice / quantity;
        const cleanName = rawName.replace(/^\d+x?\s*/i, '');

        for (let i = 0; i < quantity; i++) {
          items.push({
            tempId: Math.random().toString(36).substring(2, 11),
            name: cleanName,
            price: Number(unitPrice.toFixed(2))
          });
        }
      }
    }
  });

  return items;
};