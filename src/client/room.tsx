import Image from "next/image";
import { api } from "~/utils/api";

export const RoomDetails: React.FC<{
  roomId: string;
  onClick?: () => void;
}> = ({ roomId }) => {
  const { data: messages = [] } = api.message.getAll.useQuery({ roomId });
  return (
    <div className="flex-column justify-end gap-2 rounded p-2">
      {messages.map((message) => (
        <div key={message.id}>
          <Image
            src={message.user.image ?? "/inent.png"}
            alt={`${message.userId} user's profile image`}
          />
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
};
