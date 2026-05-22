// Minimal stubs for the PF2e system API exposed on `game.pf2e`.
// Expand these as you use more of the system API.

interface PF2eSystem {
  rollItemMacro(itemId: string): void;
  gm: {
    // GM-only utilities
  };
}

declare global {
  interface Game {
    pf2e: PF2eSystem;
  }
}

export {};
