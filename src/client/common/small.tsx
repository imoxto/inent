import { User } from "@prisma/client";
import Image from "next/image";

export const CardMin: React.FC<{
  content: Pick<User, "name" | "image">;
  onClick?: () => void;
}> = ({ content, ...otherProps }) => {
  return (
    <div
      className="flex flex-row items-center gap-2 rounded p-2 hover:bg-white/5"
      {...otherProps}
    >
      <Image
        className="rounded-full"
        src={content.image || "/favicon.ico"}
        alt="content image"
        width={40}
        height={40}
      />
      {content.name}
    </div>
  );
};
