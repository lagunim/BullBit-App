/**
 * JourneyRewardFlow - Orquestador de recompensas de viaje/nivel
 * 
 * Este componente globale gestiona la secuencia de recompensas
 * al completar un viaje (subir de nivel):
 * 
 * Paso 1: Muestra el modal de historia (si hay una nueva historia)
 * Paso 2: Al cerrar la historia, otorga automáticamente los objetos
 * 
 * Lee `pendingJourneyReward` del store y llama a `claimJourneyItems()`
 * cuando el usuario cierra el modal de historia.
 * 
 * @component
 * @returns {JSX.Element|null} Modal de historia o null si no hay recompensa pendiente
 */
import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore.js';
import StoryScrollModal from './StoryScrollModal.jsx';

/**
 * JourneyRewardFlow — globally mounted orchestrator for the post-journey reward sequence.
 *
 * Step 1: Show StoryScrollModal (pergamino) — user reads the unlocked story.
 * Step 2: After closing the story, all 3 items are granted automatically.
 *
 * Reads `pendingJourneyReward` from the store.
 * Calls `claimJourneyItems()` when the story is closed.
 *
 * Renders nothing when there is no pending reward.
 */
export default function JourneyRewardFlow() {
  const pendingReward = useGameStore(s => s.pendingJourneyReward);
  const claimJourneyItems = useGameStore(s => s.claimJourneyItems);

  // 'story' | null — whether we should show the story modal
  const [showStory, setShowStory] = useState(false);

  // When a new reward arrives, show the story modal
  useEffect(() => {
    if (pendingReward) {
      setShowStory(true);
    }
  }, [pendingReward]);

  if (!pendingReward) return null;

  const { journeyNumber, story, itemChoices } = pendingReward;

  // If there's no story to show, grant items immediately
  if (!story) {
    claimJourneyItems();
    return null;
  }

  // Show story modal
  if (showStory) {
    return (
      <StoryScrollModal
        story={story}
        journeyNumber={journeyNumber}
        onClose={() => {
          setShowStory(false);
          claimJourneyItems();
        }}
      />
    );
  }

  return null;
}
