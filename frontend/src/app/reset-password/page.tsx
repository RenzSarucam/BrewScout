"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
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
import { resetPassword } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email, password: "", password_confirmation: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await resetPassword(values);
      toast.success("Password reset. You can log in now.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (!token || !email) {
    return (
      <p className="text-sm text-muted-foreground">
        This password reset link is invalid or incomplete. Please request a new one from the{" "}
        <Link href="/forgot-password" className="font-medium text-[#6F4E37] hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-[#2B1D17]">Reset password</h1>
        <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

      <React.Suspense fallback={null}>
        <ResetPasswordForm />
      </React.Suspense>
    </main>
  );
}