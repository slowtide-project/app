// =========================================================================
// Shared utility functions
// =========================================================================

/**
 * Trigger haptic feedback on mobile devices
 * @param {number} ms - Duration in milliseconds
 */
export function pulse(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

/**
 * Generate a random maths question for parent verification
 * @returns {Object} Object containing question text and correct answer
 */
export function generateMathsQuestion() {
    const num1 = Math.floor(Math.random() * 4) + 1; // 1-4
    const num2 = Math.floor(Math.random() * 4) + 1; // 1-4
    const answer = num1 + num2;
    
    return {
        question: `${num1} + ${num2} = ?`,
        answer: answer
    };
}
