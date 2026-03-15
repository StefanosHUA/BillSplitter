import { useState } from 'react';
import { Card } from './ui/Card';
import type { ScannedItem } from '../utils/ocrService';

interface Props {
  initialItems: ScannedItem[];
  onConfirm: (finalItems: { name: string; price: number }[]) => Promise<void>;
  onCancel: () => void;
}

export default function OCRReviewModal({ initialItems, onConfirm, onCancel }: Props) {
  const [items, setItems] = useState<ScannedItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(items.map(({ name, price }) => ({ name, price })));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 bg-white border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-950">Verify Scanned Items</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Found {items.length} items</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
          {items.map((item) => (
            <div key={item.tempId} className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <input 
                className="flex-1 font-bold text-gray-700 outline-none text-sm"
                value={item.name} 
                onChange={(e) => setItems(prev => prev.map(i => i.tempId === item.tempId ? {...i, name: e.target.value} : i))}
              />
              <input 
                type="number" step="0.01"
                className="w-20 font-black text-parea-primary text-right outline-none text-sm bg-gray-50 rounded-lg px-2 py-1"
                value={item.price} 
                onChange={(e) => setItems(prev => prev.map(i => i.tempId === item.tempId ? {...i, price: parseFloat(e.target.value)} : i))}
              />
              <button onClick={() => setItems(prev => prev.filter(i => i.tempId !== item.tempId))} className="ml-2 text-gray-300 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
          <button 
            disabled={loading}
            onClick={handleConfirm} 
            className="flex-[2] py-4 bg-parea-primary text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            {loading ? 'Adding...' : 'Add All to Bill'}
          </button>
        </div>
      </Card>
    </div>
  );
}