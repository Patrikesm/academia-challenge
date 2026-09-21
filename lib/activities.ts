export const ACTIVITIES = {
  GYM: { name: "Academia", points: 10, emoji: "🏋️" },
  RUNNING: { name: "Corrida 5km", points: 8, emoji: "🏃" },
  CYCLING: { name: "Bicicleta 10km", points: 8, emoji: "🚴" },
  WALKING: { name: "Caminhada 3km", points: 6, emoji: "🚶" },
} as const;

export type ActivityType = keyof typeof ACTIVITIES;

export function isActivityType(value: string): value is ActivityType {
  return value in ACTIVITIES;
}