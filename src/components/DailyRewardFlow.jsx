import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore.js';
import { ITEMS } from '../data/items.js';

function DailyItemChoiceModal({ dailyName, itemChoices = [], onClaim }) {
  const [visible, setVisible] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handlePick(itemId) {
    if (confirming) return;
    setChosen(itemId);
  }

  function handleConfirm() {
    if (!chosen || confirming) return;
    setConfirming(true);
    setVisible(false);
    setTimeout(() => {
      onClaim(chosen);
    }, 260);
  }

  const items = itemChoices.map(id => ITEMS[id]).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-xl bg-quest-card border border-quest-gold shadow-[0_0_60px_rgba(0,0,0,0.7)] transformation ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`}
        style={{ borderWidth: 3 }}>
        <div className="px-6 py-5 text-center">
          <h3 className="text-xs uppercase tracking-[0.35em] text-quest-gold mb-1">Daily completado</h3>
          <p className="font-pixel text-[10px] leading-tight text-quest-text">{dailyName}</p>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePick(item.id)}
              className={`flex-1 rounded-2xl border-2 p-4 text-center transition-all ${chosen === item.id ? 'border-quest-gold ring-2 ring-quest-gold/30' : 'border-quest-border'}`}
              style={{ background: 'rgba(10,10,10,0.7)' }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-pixel text-[8px] text-quest-text">{item.name}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center px-6 pb-6">
          <button
            onClick={handleConfirm}
            disabled={!chosen}
            className={`btn-pixel text-[10px] px-6 py-2 ${chosen ? 'bg-quest-gold text-black' : 'opacity-40 cursor-not-allowed'}`}
          >
            {confirming ? 'RECLAMANDO...' : 'RECLAMAR OBJETO'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DailyRewardFlow() {
  const pendingReward = useGameStore(s => s.pendingDailyReward);
  const claimDailyItem = useGameStore(s => s.claimDailyItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (pendingReward) setMounted(true);
  }, [pendingReward]);

  if (!pendingReward) return null;

  return (
    <DailyItemChoiceModal
      dailyName={pendingReward.dailyName}
      itemChoices={pendingReward.itemChoices}
      onClaim={claimDailyItem}
    />
  );
}
