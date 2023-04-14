import { RouterOutputs } from "~/utils/api";
import { CardMin } from "./common/small";

export const UserRooms: React.FC<{
  userRooms: RouterOutputs["userRoom"]["getUserRooms"];
  onChatSelect?: (roomId: string) => void;
}> = ({ userRooms, onChatSelect }) => {
  return (
    <div>
      {userRooms.map(({ roomId, room }) => (
        <CardMin
          key={roomId}
          content={{
            name: room.name ?? "Unnamed Chat",
            image: room.image ?? "/inent.png",
          }}
          onClick={() => onChatSelect?.(roomId)}
        />
      ))}
    </div>
  );
};
