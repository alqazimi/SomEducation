"use client";

import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  teacherRequestSchema,
  type TeacherRequestValues,
} from "@/schemas";

export function BecomeTeacherForm() {
  const existingRequest = useQuery(api.teacherRequests.getMyRequest);
  const submitRequest = useMutation(api.teacherRequests.submitRequest);

  const form = useForm<TeacherRequestValues>({
    resolver: zodResolver(teacherRequestSchema),
  });

  async function onSubmit(data: TeacherRequestValues) {
    try {
      await submitRequest(data);
      toast.success("Request submitted successfully");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit");
    }
  }

  if (existingRequest?.status === "pending") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Badge variant="warning" className="mb-4">
            Pending Review
          </Badge>
          <p>Your teacher request is being reviewed by our admin team.</p>
        </CardContent>
      </Card>
    );
  }

  if (existingRequest?.status === "approved") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Badge variant="success" className="mb-4">
            Approved
          </Badge>
          <p>You are now a teacher! Visit your teacher dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Become a Teacher</h1>
      <p className="mt-1 text-slate-500">
        Request access to create and publish courses
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Teacher Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reason">Why do you want to teach?</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              className="mt-1"
              rows={4}
            />
            {form.formState.errors.reason && (
              <p className="mt-1 text-sm text-danger">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="experience">Experience (optional)</Label>
            <Textarea
              id="experience"
              {...form.register("experience")}
              className="mt-1"
              rows={4}
            />
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
            Submit Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
