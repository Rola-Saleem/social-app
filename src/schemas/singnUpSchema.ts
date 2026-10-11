import { getAge } from "../utils/helpers";
import { Regex } from "../utils/regex";
import * as zod from "zod";

export const SignUpSchema = zod
  .object({
    name: zod
      .string()
      .nonempty("name is required")
      .min(3, "name must be at least 3 chars"),

    email: zod
      .string()
      .nonempty("email is required")
      .regex(Regex.email, "enter valid email"),

    password: zod
      .string()
      .nonempty("password is required"),

    rePassword: zod
      .string()
      .nonempty("rePassword is required"),

    dateOfBirth: zod
      .string()
      .nonempty("dateOfBirth is required")
      .refine(
        (date) => getAge(date) >= 18,
        "age must be at least 18"
      ),

    gender: zod
      .string()
      .nonempty("gender is required"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "rePassword must match password",
    path: ["rePassword"],
  });
