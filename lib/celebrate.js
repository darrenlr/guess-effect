// Confetti is a nicety, so it is only downloaded the first time it's needed.
export async function celebrate(won) {
  try {
    const { default: confetti } = await import("canvas-confetti");
    const fire = confetti.create(undefined, { resize: true, useWorker: true });
    if (won) {
      fire({ zIndex: 101, particleCount: 600, spread: 80, origin: { y: 0.4, x: 0.5 }, scalar: 0.6 });
    } else {
      fire({
        zIndex: 101,
        particleCount: 300,
        spread: 80,
        colors: ["#FF4500", "#FF6347", "#FFD700", "#FF8C00"],
        origin: { y: 0.4, x: 0.5 },
        scalar: 0.4,
        drift: 0.5,
      });
    }
  } catch (error) {
    console.warn("Confetti failed to load:", error);
  }
}
