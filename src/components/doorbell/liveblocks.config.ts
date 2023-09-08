import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
    publicApiKey:
        "pk_prod_9TiyTWR-55DbLFR_CwB8F70P61daBNJI5SuPgh92zV_2xV47lMeZKnqGfZyeBW-C",
});

export type Presence = {};

export type Storage = {
    ringing: boolean;
};

export const { RoomProvider, useRoom, useStorage, useMutation } =
    createRoomContext<Presence, Storage>(client);
