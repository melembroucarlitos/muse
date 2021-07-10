export type ChatMessage = {
  username: string;
  message: string;
  time: Date;
};

export type GameState = {
  player: string; // uuid
  grid: boolean[][];
  bpm: number;
  playbackRate: number;
};

export type RoomState = {
  id: string; // uuid
  playersCap: number;
  // add moves limit
  players: string[];
  currentPlayers: string[];
  playersHistory: { username: string; type: 'create' | 'join' | 'leave' | 'close'; time: Date }[];
  currentTurn: string;
  gameStates: GameState[];
  messages: ChatMessage[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
};

export type Room = { id: string; playersCap: number; currentPlayers: string[] };

export type RoomPlayersUpdate = {
  currentPlayers: string[];
  playersHistory: { username: string; type: 'create' | 'join' | 'leave' | 'close'; time: Date }[];
};
