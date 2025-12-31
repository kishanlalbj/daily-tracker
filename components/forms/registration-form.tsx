"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FormField, Form, FormMessage } from "../ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const RegistrationSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
    gender: z.enum(["male", "female", "other", "unknown"], {
      message: "Gender is required"
    }),
    height: z.number().min(30).max(250)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type RegistrationData = z.infer<typeof RegistrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onToggle: () => void;
  loading?: boolean;
}

const RegistrationForm = ({
  onSubmit,
  onToggle,
  loading
}: RegistrationFormProps) => {
  const form = useForm<RegistrationData>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "male",
      height: 0
    }
  });
  const { control, handleSubmit } = form;

  const onSubmitInternal = (data: RegistrationData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-md">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitInternal)}>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="firstName"
                control={control}
                render={({ field }) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label>First Name</Label>
                      <Input
                        type="text"
                        placeholder="First Name"
                        {...field}
                      ></Input>
                      <FormMessage />
                    </div>
                  );
                }}
              ></FormField>

              <FormField
                name="lastName"
                control={control}
                render={({ field }) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label>Last Name</Label>
                      <Input
                        type="text"
                        placeholder="Last Name"
                        {...field}
                      ></Input>
                      <FormMessage />
                    </div>
                  );
                }}
              ></FormField>
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                name="confirmPassword"
                control={control}
                render={({ field }) => {
                  return (
                    <div className="flex flex-col gap-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                      ></Input>
                      <FormMessage />
                    </div>
                  );
                }}
              ></FormField>
            </div>

            <FormField
              name="gender"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label>Gender</Label>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                );
              }}
            ></FormField>

            <FormField
              name="height"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      placeholder="Height in centimeters"
                      {...field}
                      value={Number(field.value)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    ></Input>
                    <FormMessage />
                  </div>
                );
              }}
            ></FormField>
          </CardContent>

          <CardFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Spinner></Spinner>}
              Register
            </Button>
            <span className="ml-2">
              Already have an account ?
              <Button
                type="button"
                onClick={onToggle}
                variant="link"
                className="p-0 ml-1"
              >
                Signin
              </Button>
            </span>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default RegistrationForm;
