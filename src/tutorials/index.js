// src/tutorials/index.js
// ──────────────────────────────────────────────────────────────
// AR Tutorial Integration — STUBBED OUT
// This directory is reserved for future AR tutorial logic.
// Do NOT implement any tutorial execution or AR endpoints here yet.
// ──────────────────────────────────────────────────────────────

/**
 * @stub
 * Fetch available tutorials for an expert.
 * @param {string} expertId
 * @returns {Promise<Array>}
 */
export async function fetchTutorials(expertId) {
  // TODO: Implement AR tutorial fetch logic
  console.warn('[tutorials] fetchTutorials is not yet implemented.');
  return [];
}

/**
 * @stub
 * Launch an AR tutorial session.
 * @param {string} tutorialId
 */
export async function launchARTutorial(tutorialId) {
  // TODO: Implement AR tutorial launch logic
  console.warn('[tutorials] launchARTutorial is not yet implemented.');
}

/**
 * @stub
 * Create a new tutorial record for an expert.
 * @param {Object} tutorialData
 */
export async function createTutorial(tutorialData) {
  // TODO: Implement tutorial creation logic
  console.warn('[tutorials] createTutorial is not yet implemented.');
}

export default {
  fetchTutorials,
  launchARTutorial,
  createTutorial,
};
