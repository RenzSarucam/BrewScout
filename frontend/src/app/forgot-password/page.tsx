"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { forgotPassword } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await forgotPassword(values);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-[#2B1D17]">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-[#6F4E37]">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Form>
      )}

      <Link href="/login" className="text-sm font-medium text-[#6F4E37] hover:underline">
        Back to log in
      </Link>
    </main>
  );
}