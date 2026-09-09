"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", password_confirmation: "" },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await register(values);
      router.push("/");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);

        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (field in form.getValues()) {
            form.setError(field as keyof RegisterValues, { message: messages[0] });
          }
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-[#2B1D17]">Create your account</h1>
        <p className="text-sm text-muted-foreground">Save coffee shops and share reviews.</p>
      </div>

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#6F4E37] hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}