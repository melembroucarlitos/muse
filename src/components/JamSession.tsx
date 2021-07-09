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
};

const JamSession: FC<JamSessionProps> = ({ socket, roomState, updateRoomState, messages }) => {
  const { user } = useContext(UserContext);
  const { username } = user;

  return (
    <div>
      {/* current session info... current player's turn, session history, chat, leave session (if you're the only player, then close session) */}
      <Chat socket={socket} messages={messages} roomId={roomState.id} />
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
  );
};

export default JamSession;
