import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};

export const configureAssistant = (
  voice: string,
  style: string,
  subject: string,
  topic: string
): CreateAssistantDTO => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[style as keyof typeof voices[keyof typeof voices]] || "sarah";

  return {
    name: "Companion",
    firstMessage: `Hello! Welcome to this teaching lesson on "${topic}". Would you like me to *read the note* or *ask you questions* based on it?`,

    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },

    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },

    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a highly knowledgeable, friendly voice tutor in a real-time session with a student.

Instructions:
- If the student wants help with the uploaded note, summarize or quiz them.
- If the student asks general questions (even unrelated to the note), do your best to answer helpfully.
- Do not restrict yourself to just the uploaded content.
- Use a style that matches: ${style}. Keep answers short unless a long answer is needed.
- Let the student guide the session. Always be ready to switch between note explanation and free Q&A.`,
        },
      ],
    },

    clientMessages: [
      "transcript",
      "function-call",
      "speech-update",
      "status-update",
      "conversation-update",
      "metadata",
    ] as unknown as CreateAssistantDTO["clientMessages"],

    serverMessages: [
      "model-output",
      "speech-update",
      "status-update",
    ] as unknown as CreateAssistantDTO["serverMessages"],
  };
};


