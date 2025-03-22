'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, ArrowLeft } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ResetValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      setIsSubmitted(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for a link to reset your password",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? "Check your email for a reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        {!isSubmitted ? (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="name@example.com" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending link..." : "Send reset link"}
                </Button>
              </form>
            </Form>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50 text-center">
              <p className="text-sm">
                We've sent a password reset link to your email. Please check your inbox and follow the instructions.
              </p>
              <p className="text-sm mt-2">
                Didn't receive the email? Check your spam folder or{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={() => setIsSubmitted(false)}
                >
                  try again
                </Button>
              </p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full">
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                className="w-full flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 