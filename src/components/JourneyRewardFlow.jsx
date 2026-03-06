import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore.js';
import StoryScrollModal from './StoryScrollModal.jsx';
import ItemChoiceModal from './ItemChoiceModal.jsx';

/**
 * JourneyRewardFlow — globally mounted orchestrator for the post-journey reward sequence.
 *
 * Step 1: Show StoryScrollModal (pergamino) — user reads the unlocked story.
 * Step 2: After closing the story, show ItemChoiceModal — user picks 1 of 3 items.
 *
 * Reads `pendingJourneyReward` from the store.
 * Calls `claimJourneyItems(chosenItemId)` when done.
 *
 * Renders nothing when there is no pending reward.
 */
export default function JourneyRewardFlow() {
  const pendingReward = useGameStore(s => s.pendingJourneyReward);
  const claimJourneyItems = useGameStore(s => s.claimJourneyItems);

  // 'story' | 'items' — which step we are currently showing
  const [step, setStep] = useState('story');

  // When a new reward arrives (pendingReward goes from null to a value),
  // reset the flow back to the story step.
  useEffect(() => {
    if (pendingReward) {
      setStep('story');
    }
  }, [pendingReward]);

  if (!pendingReward) return null;

  const { journeyNumber, story, itemChoices } = pendingReward;

  // ── Step 1: Story ──────────────────────────────────────────────
  if (step === 'story') {
    // If there's no story to show (pool exhausted), skip straight to items
    if (!story) {
      setStep('items');
      return null;
    }

    return (
      <StoryScrollModal
        story={story}
        journeyNumber={journeyNumber}
        onClose={() => setStep('items')}
      />
    );
  }

  // ── Step 2: Item choice ────────────────────────────────────────
  if (step === 'items') {
    return (
      <ItemChoiceModal
        journeyNumber={journeyNumber}
        itemChoices={itemChoices ?? []}
        onClaim={(chosenItemId) => {
          claimJourneyItems(chosenItemId);
        }}
      />
    );
  }

  return null;
}
