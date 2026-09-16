export const EAGLEEYE_ID = "eagleeye";

export function logEagleEyeReady(foundryVersion: string): void {
  console.log(`${EAGLEEYE_ID} | ready (Foundry v${foundryVersion})`);
}
