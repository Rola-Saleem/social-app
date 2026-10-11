import { Alert, Button, Input, Select, SelectItem } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { SignUpSchema } from "../schemas/singnUpSchema";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  dateOfBirth: string;
  gender: string;
};

export default function SignUp() {
  const [sucMsg, setSucMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
const navigate=useNavigate()

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<SignUpForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
    },
    resolver: zodResolver(SignUpSchema),
  });

  async function signUp(values: SignUpForm) {
    console.log("FORM DATA:", values);

    try {
      const response = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        values
      );

      console.log("SUCCESS:", response.data);

      setSucMsg(
        response.data?.message || "Account created successfully!"
      );
       setTimeout(() => {
      navigate("/signin");
    }, 2000);

      // إخفاء الـ error لو كان ظاهر
      setErrMsg("");
    } catch (error) {
      console.log(
        "ERROR:",
        axios.isAxiosError(error)
          ? error.response?.data
          : error
      );

      if (axios.isAxiosError(error)) {
        setErrMsg(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        setErrMsg("Something went wrong. Please try again.");
      }

      // إخفاء الـ success لو كان ظاهر
      setSucMsg("");
    }
  }

  function onError(errors: any) {
    console.log("VALIDATION ERRORS:", errors);
  }

  return (
    <form onSubmit={handleSubmit(signUp, onError)}>
      <div className="grid gap-4">

        {/* Header */}
        <div className="grid gap-3 text-center">
          <h1 className="text-2xl font-bold">
            Create Account
          </h1>

          <p className="text-gray-500">
            Sign up to start your journey
          </p>
        </div>

        {/* Name */}
        <Input
          {...register("name")}
          variant="bordered"
          type="text"
          label="Full Name"
          isInvalid={!!errors.name}
          errorMessage={errors.name?.message}
        />

        {/* Email */}
        <Input
          {...register("email")}
          variant="bordered"
          type="email"
          label="Email"
          autoComplete="email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
        />

        {/* Password */}
        <Input
          {...register("password")}
          variant="bordered"
          type="password"
          label="Password"
          autoComplete="new-password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
        />

        {/* Confirm Password */}
        <Input
          {...register("rePassword")}
          variant="bordered"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          isInvalid={!!errors.rePassword}
          errorMessage={errors.rePassword?.message}
        />

        {/* Date of Birth */}
        <Input
          {...register("dateOfBirth")}
          variant="bordered"
          type="date"
          label="Birth Date"
          isInvalid={!!errors.dateOfBirth}
          errorMessage={errors.dateOfBirth?.message}
        />

        {/* Gender */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              variant="bordered"
              label="Gender"
              selectedKeys={
                field.value ? [field.value] : []
              }
              onSelectionChange={(keys) => {
                field.onChange(Array.from(keys)[0]);
              }}
              onBlur={field.onBlur}
              isInvalid={!!errors.gender}
              errorMessage={errors.gender?.message}
            >
              <SelectItem key="male">
                Male
              </SelectItem>

              <SelectItem key="female">
                Female
              </SelectItem>
            </Select>
          )}
        />

        {/* Submit */}
        <Button
          color="primary"
          variant="solid"
          type="submit"
        >
          Sign Up
        </Button>

        {/* Login */}
        <p className="text-center">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-primary"
          >
            Login now
          </Link>
        </p>

        {/* Error Alert */}
        {errMsg && (
          <Alert
            hideIcon
            color="danger"
            variant="faded"
            title={errMsg}
            classNames={{
              base: "py-0 capitalize text-center",
            }}
          />
        )}

        {/* Success Alert */}
        {sucMsg && (
          <Alert
            hideIcon
            color="success"
            variant="faded"
            title={sucMsg}
            classNames={{
              base: "py-0 capitalize text-center",
            }}
          />
        )}

      </div>
    </form>
  );
}
