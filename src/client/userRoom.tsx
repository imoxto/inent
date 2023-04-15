import { RouterOutputs } from "~/utils/api";
import { CardMin } from "./common/small";
import Link from "next/link";

export const UserRooms: React.FC<{
  userRooms: RouterOutputs["userRoom"]["getUserRooms"];
  onChatSelect?: (roomId: string) => void;
}> = ({ userRooms, onChatSelect }) => {
  return (
    <div>
      {userRooms.map(({ roomId, room }) => (
        <Link href={`room/${roomId}`} key={roomId}>
          <CardMin
            content={{
              name: room.name ?? "Unnamed Chat",
              image: room.image ?? "/inent.png",
            }}
            onClick={() => onChatSelect?.(roomId)}
          />
        </Link>
      ))}
    </div>
  );
};
