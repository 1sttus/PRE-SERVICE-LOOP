/**
 * Pure timeline and scene transition calculations for Morningstar Pre-Service Experience
 */

export interface SceneDurationInfo {
  id: string;
  duration: number; // in seconds
  isManualHold?: boolean;
}

/**
 * Computes next scene index taking into account loop mode and manual hold.
 */
export function getNextSceneIndex(
  currentIndex: number,
  totalScenes: number,
  isLooping: boolean
): number {
  if (totalScenes <= 0) return 0;

  // The last scene (Scene 12) is manual hold by rule, it should not loop automatically
  const lastIndex = totalScenes - 1;
  if (currentIndex >= lastIndex) {
    return lastIndex;
  }

  const next = currentIndex + 1;
  if (next >= totalScenes) {
    return isLooping ? 0 : lastIndex;
  }
  return next;
}

/**
 * Computes previous scene index
 */
export function getPreviousSceneIndex(
  currentIndex: number,
  totalScenes: number
): number {
  if (totalScenes <= 0) return 0;
  if (currentIndex <= 0) return 0;
  return currentIndex - 1;
}

/**
 * Determines whether a scene should auto-advance given elapsed seconds
 */
export function shouldAutoAdvance(
  elapsedSeconds: number,
  sceneDuration: number,
  isManualHold: boolean = false
): boolean {
  if (isManualHold) return false;
  if (sceneDuration <= 0) return false;
  return elapsedSeconds >= sceneDuration;
}

/**
 * Checks whether countdown lead-in should take over presentation
 */
export function shouldTransitionToCountdown(
  remainingSeconds: number,
  leadInSeconds: number,
  currentSceneIndex: number,
  countdownSceneIndex: number
): boolean {
  // If we have passed zero or already at or past countdown, don't trigger again
  if (remainingSeconds <= 0) return false;
  if (currentSceneIndex >= countdownSceneIndex) return false;
  return remainingSeconds <= leadInSeconds;
}
