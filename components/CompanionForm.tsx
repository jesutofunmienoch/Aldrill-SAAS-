"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { subjects } from "@/constants";
import { createCompanion } from "@/lib/actions/companion.actions";

const formSchema = z.object({
  name: z.string().min(1, { message: "Companion is required." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  voice: z.string().min(1, { message: "Voice is required." }),
  style: z.string().min(1, { message: "Style is required." }),
  duration: z.coerce.number().min(1, { message: "Duration is required." }),
});

const CompanionForm = () => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const companion = await createCompanion(values);

    if (companion) {
      router.push(`/companions/${companion.id}`);
    } else {
      console.log("Failed to create a companion");
      router.push("/");
    }
  };

  return (
    <>
      {/* Loading Spinner Overlay - only on client to avoid hydration issues */}
      {isClient && loading && (
        <div className="fixed inset-0 z-50 bg-white/80 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Companion name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the companion name"
                    {...field}
                    className="input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input capitalize">
                      <SelectValue placeholder="Select the subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem
                          value={subject}
                          key={subject}
                          className="capitalize"
                        >
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Topic */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What should the companion help with?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex. Derivatives & Integrals"
                    {...field}
                    className="input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Voice */}
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select the voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Style */}
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="input">
                      <SelectValue placeholder="Select the style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated session duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="15"
                    {...field}
                    className="input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload Field */}
<div className="space-y-2">
  <FormLabel>Import File for AI Teaching</FormLabel>
  <Input
    type="file"
    accept=".pdf,.doc,.docx,.txt,image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      let parsedText = '';

      if (file.type === 'application/pdf') {
        const { extractTextFromPDF } = await import('@/lib/fileParser.client');
        parsedText = await extractTextFromPDF(file);
      } else if (file.name.endsWith('.docx')) {
        const { extractTextFromDocx } = await import('@/lib/fileParser.client');
        parsedText = await extractTextFromDocx(file);
      } else if (file.type.startsWith('image/')) {
        const { extractTextFromImage } = await import('@/lib/fileParser.client');
        parsedText = await extractTextFromImage(file);
      } else if (file.type === 'text/plain') {
        parsedText = await file.text();
      }

      // Store for access in the session page
      localStorage.setItem('parsedContent', parsedText);
    }}
  />
</div>

{/* Submit Button */}
<Button type="submit" className="w-full cursor-pointer">
  Build Your Companion
</Button>

        </form>
      </Form>
    </>
  );
};

export default CompanionForm;
