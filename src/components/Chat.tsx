/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-array-index-key */
import { FC, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import UserContext from '@src/contexts/UserContext';
import { ChatMessage } from '@src/types';

type ChatProps = {
  roomId: string;
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  messages: ChatMessage[];
};

const Chat: FC<ChatProps> = ({ socket, messages, roomId }) => {
  const { user } = useContext(UserContext);
  const { username } = user;

  const [input, setInput] = useState<string>('');

  console.log("chat's messages:", messages);

  return (
    <div className="block mt-2">
      <form
        className="flex w-full bg-white rounded-md"
        onSubmit={(ev) => {
          ev.preventDefault();

          if (input === '') return;

          socket.emit('message room', {
            id: roomId,
            username,
            message: input,
            time: new Date(),
          });

          setInput('');
        }}
      >
        <input
          className="flex-auto bg-transparent"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="h-full pl-3 pr-2 ml-1 bg-yellow-600 rounded-md justify-self-end" type="submit">
          Send
        </button>
      </form>
      {/* TODO: Style the little bubble speaks and colour according to who sent it */}
      <div className="flex flex-col h-48 mt-2 overflow-y-scroll bg-gray-300 rounded-md">
        {messages &&
          messages.map((msg, idx) => (
            <div className="flex flex-col px-2 py-1 mt-2 text-black bg-yellow-500 rounded-md" key={idx}>
              <span className="font-semibold">{msg.username}</span>
              <span className="font-light">{msg.message}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Chat;
