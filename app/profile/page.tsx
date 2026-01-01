"use client";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { toast, Toaster } from "sonner";
import { paths } from "@/constants";
import { Pencil } from "lucide-react";
import PageTitle from "@/components/page-title";

const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  gender: z.enum(["male", "female", "other", "unknown"]),
  height: z.number().min(30).max(250).optional()
});

type ProfileData = z.infer<typeof ProfileSchema>;

const ProfilePage = () => {
  const user = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      gender:
        (user?.gender as "male" | "female" | "other" | "unknown") || "unknown",
      height: user?.height ? Number(user.height) : undefined
    }
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: ProfileData) => {
    try {
      setLoading(true);
      const res = await fetch(paths.USERS_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully", { richColors: true });
        setIsEditOpen(false);
        // Reload to update user context
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to update profile", {
          richColors: true
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    reset({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      gender:
        (user?.gender as "male" | "female" | "other" | "unknown") || "unknown",
      height: user?.height ? Number(user.height) : undefined
    });
    setIsEditOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Toaster />
      <PageTitle
        title="Profile"
        subtitle="Manage your account settings and preferences"
        actionSlot={
          <Button onClick={handleEditClick} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        }
      />

      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold">
              Personal Information
            </CardTitle>
            <CardDescription className="text-base">
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  First Name
                </Label>
                <p className="mt-2 text-base">{user?.first_name || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Name
                </Label>
                <p className="mt-2 text-base">{user?.last_name || "-"}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <p className="mt-2 text-base">{user?.email || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold">
              Health Information
            </CardTitle>
            <CardDescription className="text-base">
              Your health-related data and measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Gender
                </Label>
                <p className="mt-2 text-base capitalize">
                  {user?.gender === "unknown"
                    ? "Prefer not to say"
                    : user?.gender || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Height
                </Label>
                <p className="mt-2 text-base">
                  {user?.height ? `${user.height} cm` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-base">
              Make changes to your profile information
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          First Name
                        </Label>
                        <Input placeholder="First name" {...field} />
                        <FormMessage />
                      </div>
                    )}
                  />

                  <FormField
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input placeholder="Last name" {...field} />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>

                <FormField
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input type="email" placeholder="Email" {...field} />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-sm font-semibold">Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Gender</Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="unknown">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    )}
                  />

                  <FormField
                    name="height"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Height (cm)
                        </Label>
                        <Input
                          type="number"
                          placeholder="Height"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Spinner />}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
