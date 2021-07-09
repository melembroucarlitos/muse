export type ChatMessage = {
  username: string;
  message: string;
  // Add room to this
  // Add time to this
};

export type RoomState = {
  id: string; // uuid
  playersCap: number;
  players: string[];
  currentPlayers: string[];
  playersHistory: { username: string; type: 'create' | 'join' | 'leave' | 'close'; time: Date }[];
  currentTurn: string;
  gameStates: Array<boolean[][]>;
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
