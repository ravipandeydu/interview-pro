"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  confirmPassword: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    {
      label: "Contains uppercase letter",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: "Contains lowercase letter",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    { label: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
  ];

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const isPasswordValid = passwordRequirements.every((req) =>
      req.test(values.password)
    );
    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      form.reset();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative z-10">
        <div className="absolute inset-0 bbg-gradient-to-b from-indigo-100/80 to-white/60 dark:from-indigo-900/30 dark:to-gray-900/30 rounded-t-lg border-b border-indigo-100/50 dark:border-indigo-900/50 pointer-events-none" />
        <CardHeader className="space-y-1 bg-gradient-to-b from-indigo-100/80 to-white/60 dark:from-indigo-900/30 dark:to-gray-900/30 rounded-t-lg border-b border-indigo-100/50 dark:border-indigo-900/50 shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create account
          </CardTitle>
          <CardDescription className="text-center text-indigo-700/70 dark:text-indigo-300/70">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-900/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-900/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div>
                        <div className="relative">
                          <Input
                            placeholder="Password"
                            className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-900/30"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {field.value && (
                          <div className="space-y-1 mt-2">
                            {passwordRequirements.map((req, index) => {
                              const isValid = req.test(field.value);
                              return (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 text-xs"
                                >
                                  {isValid ? (
                                    <Check className="h-3 w-3 text-indigo-500" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-500" />
                                  )}
                                  <span
                                    className={
                                      isValid
                                        ? "text-indigo-600 dark:text-indigo-400 font-medium"
                                        : "text-red-600 dark:text-red-400"
                                    }
                                  >
                                    {req.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div>
                        <div className="relative">
                          <Input
                            placeholder="Password"
                            className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-900/30"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {field.value && (
                          <div className="flex items-center space-x-2 text-xs mt-1">
                            {form.getValues().password === field.value ? (
                              <>
                                <Check className="h-3 w-3 text-indigo-500" />
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  Passwords match
                                </span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-red-500" />
                                <span className="text-red-600 dark:text-red-400">
                                  Passwords do not match
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="font-medium" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 relative z-10 bg-gradient-to-t from-indigo-50/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 rounded-b-lg border-t border-indigo-100/50 dark:border-indigo-900/50 pt-4">
              <Button
                type="submit"
                className="w-full backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Create account <UserPlus className="h-4 w-4" />
                  </span>
                )}
              </Button>
              <div className="text-center text-sm text-indigo-700/70 dark:text-indigo-300/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
