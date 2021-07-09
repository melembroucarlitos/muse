/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-array-index-key */
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import UserContext from '@src/contexts/UserContext';
import { ChatMessage } from '@src/types';

const Chat: FC = () => {
  const { user } = useContext(UserContext);
  const { username } = user;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socket = useRef<any>();

  useEffect(() => {
    socket.current = io('http://localhost:8080');
    console.log('connected:', socket.current);
    // return socket.current.disconnect();
  }, []);

  if (typeof socket.current !== 'undefined') {
    socket.current.on('message', (chatMessage: ChatMessage) => {
      setMessages(messages.concat([chatMessage]));
    });
  }

  // TODO: Keep messages state recorded in redis, append to it when you send these messages
  return (
    <div className="block mt-2">
      <form
        className="flex w-full bg-white rounded-md"
        onSubmit={(ev) => {
          ev.preventDefault();

          if (input === '') return;

          console.log('sending:', {
            username,
            message: input,
          });

          socket.current.emit('message', {
            username,
            message: input,
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
        {messages.map((msg, idx) => (
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
