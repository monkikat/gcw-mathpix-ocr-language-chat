import Latex from 'react-latex-next';

type Message = {
  type: 'text' | 'file' | 'system';
  content: string;
  fileName?: string;
  fileType?: string;
};

type ChatMessageProps = {
  message: Message;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  if (message.type === 'system') {
    return (
      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-md">
        {message.fileName && (
          <p className="text-xs font-semibold mb-2 text-gray-600">
            {message.fileName}
          </p>
        )}
        <div className="whitespace-pre-wrap">
          <Latex>{message.content}</Latex>
        </div>
      </div>
    );
  }

  if (message.type === 'text') {
    return (
      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto">
        {message.content}
      </div>
    );
  }

  if (message.fileType?.startsWith('image/')) {
    return (
      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto">
        <p className="text-sm mb-2">{message.fileName}</p>
        <img
          src={message.content}
          alt={message.fileName}
          className="max-w-full rounded"
        />
      </div>
    );
  }

  return (
    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md ml-auto">
      <p className="text-sm mb-1">📎 {message.fileName}</p>
      <p className="text-xs opacity-75">File uploaded</p>
    </div>
  );
};
