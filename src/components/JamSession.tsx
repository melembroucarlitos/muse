/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import { FC, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import UserContext from '@src/contexts/UserContext';
import { ChatMessage, RoomState } from '@src/types';
import Chat from './Chat';

type JamSessionProps = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  roomState: RoomState;
  // eslint-disable-next-line no-unused-vars
  updateRoomState: (newRoomState: RoomState | null) => void;
  messages: ChatMessage[];
  grid: boolean[][];
  bpm: number;
  playbackRate: number;
};

const JamSession: FC<JamSessionProps> = ({ socket, roomState, updateRoomState, messages, grid, bpm, playbackRate }) => {
  const { user } = useContext(UserContext);
  const { username } = user;

  return (
    <div>
      {/* current session info... current player's turn, session history, */}
      <div className="flex flex-col">
        {roomState.currentTurn === username ? <span>Your Turn!</span> : <span>Frozen!</span>}
        <button
          type="button"
          onClick={() => {
            socket.emit('play turn', {
              id: roomState.id,
              username,
              gameState: {
                grid,
                bpm,
                playbackRate,
                player: roomState.currentTurn,
              },
            });
          }}
        >
          Submit Turn
        </button>
      </div>
      <div className="flex">
        <Chat socket={socket} messages={messages} roomId={roomState.id} />
        <div className="flex flex-col ml-8">
          <h4>Current Players</h4>
          <div className="flex flex-col mt-2">
            {roomState.currentPlayers.map((player) => (
              <span
                className={`${player === roomState.currentTurn ? 'bg-yellow-300' : ''} px-2 py-1 rounded-md`}
                key={player}
              >
                {player}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/*
        <div className="flex">
          {roomState?.gameStates.map((gameState, idx) => (
            <div className={`${idx !== 0 ? 'ml-2' : ''} flex flex-col px-2 py-1 justify-items-center`}>
              <span>{idx}</span>
              <span className="text-sm">{gameState.player}</span>
            </div>
          ))}
        </div>
          */}
        {roomState?.currentPlayers.length === 1 ? (
          <button
            type="button"
            onClick={() => {
              console.log('We are now closing the room');
              socket.emit('close room', {
                id: roomState.id,
                username,
              });
              updateRoomState(null);
            }}
          >
            Close Session
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              console.log('We are now leaving the room');
              socket.emit('leave room', {
                username,
                id: roomState?.id,
              });
              updateRoomState(null);
            }}
          >
            Leave Session
          </button>
        )}
      </div>
    </div>
  );
};

export default JamSession;
