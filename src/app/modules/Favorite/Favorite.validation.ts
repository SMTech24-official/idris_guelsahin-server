import { FavoriteType } from "@prisma/client";
import { z } from "zod";

export const FavoriteSchema = z.object({
    body: z.object({
        itemId: z.string(),
        itemType: z.nativeEnum(FavoriteType)
    }),
});
