"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FormField, Form, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const LoginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required")
});

export type LoginData = z.infer<typeof LoginSchema>;

interface LoadingFormProps {
  onSubmit: (data: LoginData) => void;
  onGoogleLogon: () => void;
  onToggle: () => void;
  loading?: boolean;
}

const LoginForm = ({
  onSubmit,
  onGoogleLogon,
  onToggle,
  loading
}: LoadingFormProps) => {
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const { control } = form;

  const handleSubmit = (data: LoginData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full md:w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <FormField
              name="email"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="Email" {...field}></Input>
                    <FormMessage />
                  </div>
                );
              }}
            ></FormField>

            <FormField
              name="password"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                    ></Input>
                    <FormMessage />
                  </div>
                );
              }}
            ></FormField>
          </CardContent>

          <CardFooter className="mt-4 flex-col items-center gap-4">
            <Button type="submit" disabled={loading} className="w-full md:w-sm">
              Login
              {loading && <Spinner />}
            </Button>

            <Button
              variant={"secondary"}
              type="button"
              onClick={onGoogleLogon}
              className="w-full md:w-sm"
            >
              <Image src="/google.svg" alt="google" width={20} height={20} />
              Sign in with Google
            </Button>

            <p className="ml-1">
              Don&apos;t have an account ?{" "}
              <Button type="button" variant={"link"} onClick={onToggle}>
                Sign Up
              </Button>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
