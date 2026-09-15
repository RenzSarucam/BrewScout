"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequireAuth } from "@/components/navigation/require-auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import {
  updatePasswordSchema,
  updateProfileSchema,
  type UpdatePasswordValues,
  type UpdateProfileValues,
} from "@/lib/validation/auth";

function ProfileForm() {
  const { user, updateProfile } = useAuth();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  async function onSubmit(values: UpdateProfileValues) {
    try {
      await updateProfile(values);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Email</span>
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-fit">
          {form.formState.isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}

function PasswordForm() {
  const { updatePassword } = useAuth();

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  async function onSubmit(values: UpdatePasswordValues) {
    try {
      await updatePassword(values);
      toast.success("Password updated.");
      form.reset();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);

        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (field in form.getValues()) {
            form.setError(field as keyof UpdatePasswordValues, { message: messages[0] });
          }
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-fit">
          {form.formState.isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </Form>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-10">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-foreground">Account details</h2>
          <ProfileForm />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-foreground">Change password</h2>
          <PasswordForm />
        </section>
      </main>
    </RequireAuth>
  );
}
