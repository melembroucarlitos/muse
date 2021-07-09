/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-array-index-key */
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import UserContext from '@src/contexts/UserContext';
import { ChatMessage, Room as RoomType, RoomPlayersUpdate, RoomState } from '@src/types';
import JamSession from './JamSession';

// TODO: Have something going where joining a room and creating a room can't both be open at once and a sweet side slide transition
// TODO: Have timer that automatically logs someone off a room in they haven't messed around in their turn for a certain amount of time
// TODO: socket useState refactor, or better yet just const
const Room: FC = () => {
  const { user } = useContext(UserContext);
  const { username } = user;
  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>(io('http://localhost:8080'));

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [currentRooms, setCurrentRooms] = useState<RoomType[]>([]);

  const [roomCap, setRoomCap] = useState<number>(2);

  const updateRoomState = (newRoomState: RoomState | null) => {
    if (newRoomState === null) {
      setRoomState(null);
      setRoomMessages([]);
    } else {
      console.log('updating roomMessages:', newRoomState.messages);
      setRoomState(newRoomState);
      setRoomMessages(newRoomState.messages);
    }
  };

  useEffect(() => {
    socket.current.emit('current rooms');
  }, []);

  // Socket event listeners
  if (typeof socket.current !== 'undefined') {
    socket.current.on('live rooms updated', (rooms: RoomType[]) => {
      console.log('live rooms were updated', rooms);
      setCurrentRooms(rooms);
    });

    socket.current.on('room init', (roomData: RoomState) => {
      console.log('room was initialized');
      updateRoomState(roomData);
    });

    socket.current.on('room players update', ({ currentPlayers, playersHistory }: RoomPlayersUpdate) => {
      // Check why this shit doesnt type check
      const ready = {
        ...roomState,
        currentPlayers,
        playersHistory,
      } as RoomState;

      updateRoomState(ready);
    });

    socket.current.on('room messaged', (messages: ChatMessage[]) => {
      console.log('room was messaged', messages);
      if (roomState !== null) {
        updateRoomState({
          ...roomState,
          messages,
        });
      }
    });
  }

  return (
    <div className="block mt-2">
      <div className={`${roomState !== null ? 'hidden' : 'block'}`}>
        <div>
          <h4>Rooms</h4>
          <form
            className="block"
            onSubmit={(ev) => {
              ev.preventDefault();
              socket.current.emit('create room', {
                username,
                playersCap: roomCap,
              });
            }}
          >
            {/* max number of players select */}
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="roomCap">Max Players</label>
            <select
              onChange={(e) => setRoomCap(parseFloat(e.target.value))}
              value={roomCap}
              name="roomCap"
              id="roomCap"
              className="ml-2"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button className="ml-2 btn" type="submit">
              Create Room
            </button>
          </form>
          <table>
            <tr>
              <th>Room ID</th>
              <th>Room Capacity</th>
              <th>Join?</th>
            </tr>
            {currentRooms.length !== 0 ? (
              currentRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td className="text-center">
                    {room.currentPlayers.length >= room.playersCap
                      ? 'FULL'
                      : `${room.currentPlayers.length}/${room.playersCap}`}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        socket.current.emit('join room', {
                          id: room.id,
                          username,
                        })
                      }
                    >
                      Join Room
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            )}
          </table>
        </div>
      </div>
      {roomState === null ? null : (
        <JamSession
          roomState={roomState}
          messages={roomMessages}
          updateRoomState={updateRoomState}
          socket={socket.current}
        />
      )}
    </div>
  );
};

export default Room;
