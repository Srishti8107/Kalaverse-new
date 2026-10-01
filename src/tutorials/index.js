// src/tutorials/index.js
// ──────────────────────────────────────────────────────────────
// Tutorial registry. Tutorials with `arPractice: true` have a craft rule
// engine (see craftLogic.js) and open in the AR practice page at
// /practice/:tutorialId.
// ──────────────────────────────────────────────────────────────

export const TUTORIALS = [
  {
    id: 'paper-strip-weaving',
    title: 'Paper Strip Weaving — Checkerboard',
    description: 'Weave green strips through a slit paper sheet in six guided steps, with live hand tracking and an AI coach.',
    duration: '20 min',
    type: 'free',
    thumbnail: '/tutorials/paper-weaving-steps.jpeg',
    studentsCount: 212,
    rating: 4.9,
    arPractice: true,
  },
  {
    id: 'tut-1',
    title: 'Introduction to Hand-Thrown Pottery',
    description: 'Learn the basics of centering clay on the wheel and pulling your first cylinder.',
    duration: '45 min',
    type: 'free',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop',
    studentsCount: 128,
    rating: 4.8,
  },
  {
    id: 'tut-2',
    title: 'Advanced Glazing Techniques',
    description: 'Explore layered glaze applications, wax resist, and trailing methods for unique effects.',
    duration: '1h 20min',
    type: 'paid',
    price: '₹499',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop',
    studentsCount: 64,
    rating: 4.9,
  },
  {
    id: 'tut-3',
    title: 'AR-Guided Wheel Throwing (Coming Soon)',
    description: 'Experience guided throwing with real-time AR overlay for hand positioning and pressure.',
    duration: '~2h',
    type: 'paid',
    price: '₹899',
    thumbnail: '',
    studentsCount: 0,
    rating: null,
    comingSoon: true,
  },
];

/** @returns {object|null} */
export function getTutorialById(tutorialId) {
  return TUTORIALS.find((t) => t.id === tutorialId) ?? null;
}

/** Practice route for a tutorial, or null if it has no AR practice yet. */
export function getPracticePath(tutorial) {
  return tutorial?.arPractice && !tutorial.comingSoon ? `/practice/${tutorial.id}` : null;
}

/**
 * Tutorials offered by an expert. Per-expert tutorials aren't stored in
 * Firestore yet, so every expert shows the shared catalogue.
 * @param {string} _expertId
 * @returns {Promise<Array>}
 */
export async function fetchTutorials(_expertId) {
  return TUTORIALS;
}

export default {
  TUTORIALS,
  getTutorialById,
  getPracticePath,
  fetchTutorials,
};
