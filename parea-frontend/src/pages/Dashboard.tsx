import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../hooks/useSessions';
import { Card } from '../components/ui/Card';
import { authService } from '../api/authService'; 

export default function Dashboard() {
  const { sessions, loading, createSession, deleteSession, currentUserId } = useSessions();
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  if (!currentUserId || !authService.isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createSession(newTitle);
    setNewTitle('');
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Delete this gathering?")) {
      await deleteSession(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:static sm:bg-transparent sm:border-none sm:px-0 sm:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-3xl hidden sm:block">🍽️</span>
            <div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-gray-950">My Parea Nights</h1>
              <p className="hidden sm:block text-sm text-gray-500 font-medium">Split bills with friends, easily.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="flex w-full sm:w-auto items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            <input 
              type="text" 
              placeholder="Where to next?" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 min-w-0 bg-transparent px-3 py-2 outline-none text-base font-medium sm:w-64"
            />
            <button className="shrink-0 bg-parea-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all">
              New Session
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-0 pb-12">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium animate-pulse">Loading your nights...</div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-20 border-dashed">
            <div className="text-5xl mb-4">🍷</div>
            <h2 className="text-xl font-bold text-gray-900">No gatherings yet</h2>
            <p className="text-gray-500">Log your first night out above!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => {
              // LOGIC: Calculate settlement progress
              const totalParticipants = session.participants?.length || 0;
              const paidCount = session.participants?.filter(p => p.amountPaid > 0).length || 0;
              
              // Settled if there are people and everyone has paid
              const isFullySettled = totalParticipants > 0 && session.participants?.every(p => p.amountPaid > 0);

              return (
                <Card 
                  key={session.id} 
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="group relative p-6 transition-all hover:shadow-lg overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-black text-gray-950 group-hover:text-parea-primary transition-colors pr-8">
                      {session.title}
                    </h3>
                    <button 
                      onClick={(e) => handleDelete(e, session.id)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-20"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>👥</span> 
                      {totalParticipants}
                      {totalParticipants > 0 && (
                        <span className="text-[10px] text-gray-300 ml-1">({paidCount} paid)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1"><span>🍽️</span> {session.items?.length || 0}</div>
                    
                    {/* DYNAMIC STATUS BADGE */}
                    <div className={`ml-auto px-2 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black transition-colors ${
                      isFullySettled 
                        ? 'bg-green-100 text-green-600 ring-1 ring-green-200' 
                        : 'bg-gray-50 text-gray-400'
                    }`}>
                      {isFullySettled ? 'Settled' : 'Pending'}
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  {!isFullySettled && totalParticipants > 0 && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                      <div 
                        className="h-full bg-parea-primary transition-all duration-700 ease-in-out" 
                        style={{ width: `${(paidCount / totalParticipants) * 100}%` }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}