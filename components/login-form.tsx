"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FormField, Form, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";

const LoginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string()
});

export type LoginData = z.infer<typeof LoginSchema>;

interface LoadingFormProps {
  onSubmit: (data: LoginData) => void;
  onToggle: () => void;
  loading?: boolean;
}

const LoginForm = ({ onSubmit, onToggle, loading }: LoadingFormProps) => {
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
    <Card className="w-md">
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

          <CardFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              Login
              {loading && <Spinner />}
            </Button>
            <p className="ml-2">
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
