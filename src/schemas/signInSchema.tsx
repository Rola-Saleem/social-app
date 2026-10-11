import { Regex } from "../utils/regex";
import * as zod from "zod";

export const SignInSchema = zod
  .object({
    email: zod
      .string()
      .nonempty("email is required")
      .regex(Regex.email, "enter valid email"),

    password: zod
      .string()
      .nonempty("password is required"),
  })
 