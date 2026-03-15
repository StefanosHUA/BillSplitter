import { useState, useRef } from 'react'; // Added useRef
import { useParams, Link } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { Card } from '../components/ui/Card';
import { processReceiptImage } from '../utils/ocrService';
import OCRReviewModal from '../components/OCRReviewModal';
import type { ParticipantRes } from '../types'; 
import type { ScannedItem } from '../utils/ocrService';

interface ParticipantItemProps {
  friend: ParticipantRes;
  onEdit: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function ParticipantItem({ friend, onEdit, onDelete }: ParticipantItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(friend.name);

  const handleSave = async () => {
    setIsEditing(false);
    if (tempName.trim() !== '' && tempName !== friend.name) {
      await onEdit(friend.id, tempName);
    } else {
      setTempName(friend.name);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl group transition-all hover:border-parea-primary/30">
      {isEditing ? (
        <input
          autoFocus
          className="flex-1 font-bold text-gray-700 text-sm outline-none border-b-2 border-parea-primary bg-transparent py-0.5"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      ) : (
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer" 
          onClick={() => setIsEditing(true)}
        >
          <span className="font-bold text-gray-700 text-sm group-hover:text-parea-primary transition-colors">
            {friend.name}
          </span>
          <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
        </div>
      )}
      <button 
        onClick={() => onDelete(friend.id)} 
        className="ml-2 text-gray-300 hover:text-red-500 transition-colors p-1"
      >
        ✕
      </button>
    </div>
  );
}

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null); // REF: For resetting the input value
  
  const { 
    session, totalPrice, splitResults, isCalculating, loading,
    addParticipant, addItem, deleteParticipant, deleteItem, toggleShare, calculate, 
    toggleParticipantPaid, editParticipantName, addItemsBulk 
  } = useSessionDetails(id);

  const [newFriendName, setNewFriendName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[] | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const items = await processReceiptImage(file);
      setScannedItems(items);
      
      // SENIOR FIX: Reset the input value so the same file can be scanned again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      alert("Could not process receipt. Try a clearer photo.");
      
      // Reset even on error
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-4xl animate-bounce">🍷</div>;
  if (!session) return <div className="text-center py-20 font-bold text-gray-400">Session not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-4 sm:px-0">
      
      {scannedItems && (
        <OCRReviewModal 
          initialItems={scannedItems}
          onCancel={() => setScannedItems(null)}
          onConfirm={async (finalItems) => {
            await addItemsBulk(finalItems);
            setScannedItems(null);
          }}
        />
      )}

      <header className="flex flex-col gap-2 border-b border-gray-100 pb-6">
        <Link to="/" className="text-sm font-bold text-gray-400 hover:text-parea-primary no-underline w-fit">
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 m-0 tracking-tight">{session.title}</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {new Date(session.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Bill</div>
            <div className="text-3xl font-black text-parea-primary">€{totalPrice.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h2 className="text-lg font-black text-gray-900 mb-6">👥 Participants</h2>
            <form onSubmit={(e) => { e.preventDefault(); addParticipant(newFriendName); setNewFriendName(''); }} className="flex gap-2 mb-6">
              <input 
                type="text" required placeholder="Add friend..." value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)} 
                className="flex-1 min-w-0 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm"
              />
              <button type="submit" className="shrink-0 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-transform">
                Add
              </button>
            </form>
            <div className="space-y-2">
              {session.participants?.map((friend) => (
                <ParticipantItem 
                  key={friend.id} 
                  friend={friend} 
                  onEdit={editParticipantName} 
                  onDelete={(pid) => deleteParticipant(pid)} 
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900">🧾 Bill Items</h2>
              
              <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isScanning ? 'bg-gray-100 text-gray-400' : 'bg-parea-primary/10 text-parea-primary active:scale-95'}`}>
                <input 
                  ref={fileInputRef} // ATTACHED REF HERE
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                  disabled={isScanning} 
                />
                {isScanning ? '⌛ Scanning...' : '📸 Scan Receipt'}
              </label>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addItem(newItemName, parseFloat(newItemPrice)); setNewItemName(''); setNewItemPrice(''); }} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input type="text" required placeholder="Item name..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-medium"/>
              <div className="flex gap-3">
                <input type="number" required step="0.01" placeholder="€ 0.00" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-28 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-parea-primary"/>
                <button type="submit" className="px-6 py-3 bg-parea-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">
                  Add Item
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {session.items?.map((item) => (
                <div key={item.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-gray-900 m-0">{item.itemName}</h3>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-xl text-parea-primary">€{item.price.toFixed(2)}</span>
                      <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.participants?.map((friend) => {
                      const isShared = item.sharedByParticipantIds?.includes(friend.id);
                      return (
                        <button 
                          key={friend.id} 
                          onClick={() => toggleShare(item.id, friend.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isShared ? 'bg-parea-primary text-white border-parea-primary shadow-md' : 'bg-white text-gray-400 border-gray-200'
                          }`}
                        >
                          {friend.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col items-center pt-8">
        <button 
          onClick={calculate} 
          disabled={isCalculating} 
          className="bg-gray-950 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all hover:bg-black"
        >
          {isCalculating ? 'Calculating...' : '🧮 Calculate Split'}
        </button>

        {splitResults && (
          <Card className="mt-8 w-full max-w-md p-8 border-2 border-parea-primary/5">
            <h3 className="text-center font-black text-gray-400 uppercase tracking-widest text-xs mb-8">Final Settlement</h3>
            <div className="space-y-4">
              {splitResults.map((debt) => {
                const participant = session.participants?.find(p => p.id === debt.participantId);
                const amountPaid = participant?.amountPaid || 0;
                const currentOwed = debt.amount;

                const isFullySettled = amountPaid >= currentOwed && amountPaid > 0;
                const isPartial = amountPaid > 0 && amountPaid < currentOwed;

                return (
                  <div 
                    key={debt.participantId} 
                    className={`flex justify-between items-center p-4 rounded-2xl transition-all ${
                      isPartial ? 'bg-orange-50 border border-orange-100 mb-2' : 'border border-transparent border-b-gray-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">{debt.name}</span>
                      {isFullySettled ? (
                        <span className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1">Paid in Full ✅</span>
                      ) : isPartial ? (
                        <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1 animate-pulse">⚠️ Total Changed: Paid €{amountPaid.toFixed(2)}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Awaiting Payment</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-black uppercase">Owes</span>
                        <span className={`font-black text-xl leading-none ${isPartial ? 'text-orange-600' : 'text-parea-primary'}`}>
                          €{currentOwed.toFixed(2)}
                        </span>
                      </div>

                      <button 
                        onClick={() => toggleParticipantPaid(debt.participantId, currentOwed)}
                        className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all shadow-sm active:scale-95 ${
                          isFullySettled 
                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                            : isPartial
                              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                        }`}
                      >
                        {isFullySettled ? 'Undo' : isPartial ? 'Pay Diff' : 'Settle'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}