# Inent

This is a full stack realtime messaging web-app project.

## Tech Stack

It uses the following tools and technologies:

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Requirements

The following requirements are fullfilled by this project:
- User
  - can search for user
  - can search for rooms (messaging groups or rooms)
  - can see user profiles if they are public
  - can update their information
  - persist changes in database

- Special user named `AI chatbot v0`
  - can communicate only in DMs
  - replies intellegently when DM'ed (doesnt work in [prod](https://inent.imoxto.me) because vercel doesnt allow requests to last more than 10s)
  - follows regular DM rules
  - cant join groups

- Rooms
  - users can join rooms
  - user can create rooms
  - users can update rooms
  - can create private DM rooms with only 1 user
  - can see his joined or created rooms
  - should not see private rooms if he doesnt have member or admin access
  - persist changes in database

- Messaging
  - users can create messages
  - users can delete their own messages
  - admins can delete any messages of a room
  - users can update their own messages
  - users can see messages in the room
  - persist changes in database

- User-Room role
  - users are admins when they create room
  - users are members when they join a room
  - both admin and members can leave a room
  - admins can change the role of a member
  - admins can remove any member from a room
  - persist changes in database

- Realtime communication system
  - adding a new message should be multicasted to all members of a room
  - updating a message should be multicasted to all members of a room
  - deleting a message should be multicasted to all members of a room
  - user-room roles should be followed while multicasting
