/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-array-index-key */
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import UserContext from '@src/contexts/UserContext';
import { Room as RoomType, RoomPlayersUpdate, RoomState } from '@src/types';
import Chat from './Chat';

// TODO: Have something going where joining a room and creating a room can't both be open at once and a sweet side slide transition
// TODO: Have timer that automatically logs someone off a room in they haven't messed around in their turn for a certain amount of time
const Room: FC = () => {
  const { user } = useContext(UserContext);
  const { username } = user;
  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>(io('http://localhost:8080'));

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentRooms, setCurrentRooms] = useState<RoomType[]>([]);

  const [roomCap, setRoomCap] = useState<number>(2);

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
      setRoomState(roomData);
    });

    socket.current.on('room players update', ({ currentPlayers, playersHistory }: RoomPlayersUpdate) => {
      // Check why this shit doesnt type check
      const ready = {
        ...roomState,
        currentPlayers,
        playersHistory,
      } as RoomState;

      setRoomState(ready);
    });

    socket.current.on('session update', () => {
      console.log('session state was updated');
      // Update session history
      // Update who's turn it is
      // Update the gui
      // If it's your turn, unlock the gui
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
      <div className={`${roomState !== null ? 'block' : 'hidden'}`}>
        {/* current session info... current player's turn, session history, chat, leave session (if you're the only player, then close session) */}
        <Chat />
        {roomState?.currentPlayers.length === 1 ? (
          <button
            type="button"
            onClick={() => {
              console.log('We are now closing the room');

              socket.current.emit('close room', {
                id: roomState.id,
                username,
              });

              setRoomState(null);
            }}
          >
            Close Session
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              console.log('We are now leaving the room');

              socket.current.emit('leave room', {
                username,
                id: roomState?.id,
              });

              setRoomState(null);
            }}
          >
            Leave Session
          </button>
        )}
      </div>
    </div>
  );
};

export default Room;
