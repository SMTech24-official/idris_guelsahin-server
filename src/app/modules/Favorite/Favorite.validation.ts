
import { z } from "zod";

export const FavoriteSchema = z.object({
  body: z.object({
    productId: z.string(),
  }),
});
