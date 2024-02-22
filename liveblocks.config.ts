import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
    publicApiKey: `${process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY}`,
});

export type Presence = {};

export type Storage = {
    ringing: boolean;
};

export const { RoomProvider, useRoom, useStorage, useMutation } =
    createRoomContext<Presence, Storage>(client);
