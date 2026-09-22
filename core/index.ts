export const FLIGHT_CONTROL_ID = "eagle-flight-control";

export function logFlightControlReady(foundryVersion: string): void {
  console.log(`${FLIGHT_CONTROL_ID} | ready (Foundry v${foundryVersion})`);
}
