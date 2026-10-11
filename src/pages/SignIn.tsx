import { Alert, Button, Input } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useContext, useState } from "react";

import { SignInSchema } from "../schemas/signInSchema";
import { authContext } from "../contexts/authContext";
import { authService } from "../services/authService";

type SignInForm = {
  email: string;
  password: string;
};

export default function SignIN() {
  const [sucMsg, setSucMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const {
    setIsUserLogedIn,
    setUserData,
  } = useContext(authContext);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(SignInSchema),
  });

  async function signIn(values: SignInForm) {
    try {
      setIsSubmitting(true);
      setErrMsg("");
      setSucMsg("");

      const response = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        values
      );

      const responseData = response.data?.data;
      const token = responseData?.token;

      if (!token) {
        throw new Error("The server did not return an authentication token.");
      }

      // Save token first
      localStorage.setItem("token", token);

      // Get current user's profile
      const profileResponse = await authService.getUserData();

      const profileData =
        profileResponse?.user ??
        profileResponse?.data?.user ??
        profileResponse?.data ??
        profileResponse;

      if (!profileData || typeof profileData !== "object") {
        throw new Error("Could not load user profile.");
      }

      // Update Context immediately
      setUserData(profileData);
      setIsUserLogedIn(true);

      setSucMsg(response.data?.message || "Login successful!");

      // Navigate after profile data is ready
      navigate("/");
    } catch (error) {
      console.error(
        "Sign in error:",
        axios.isAxiosError(error)
          ? error.response?.data
          : error
      );

      setSucMsg("");

      if (axios.isAxiosError(error)) {
        setErrMsg(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else if (error instanceof Error) {
        setErrMsg(error.message);
      } else {
        setErrMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(signIn)}>
      <div className="grid gap-4">
        <div className="grid gap-3 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-slate-500">
            Sign in to continue your journey
          </p>
        </div>

        <Input
          {...register("email")}
          variant="bordered"
          type="email"
          label="Email"
          autoComplete="email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
        />

        <Input
          {...register("password")}
          variant="bordered"
          type="password"
          label="Password"
          autoComplete="current-password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
        />

        <Button
          color="primary"
          variant="solid"
          type="submit"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          You don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Register now
          </Link>
        </p>

        {errMsg && (
          <Alert
            hideIcon
            color="danger"
            variant="faded"
            title={errMsg}
          />
        )}

        {sucMsg && (
          <Alert
            hideIcon
            color="success"
            variant="faded"
            title={sucMsg}
          />
        )}
      </div>
    </form>
  );
}