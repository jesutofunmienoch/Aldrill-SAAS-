'use client';



import { useEffect, useRef, useState } from 'react'
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from "@/lib/actions/companion.actions";
import CompanionCard from './CompanionCard';
import { Pencil } from 'lucide-react';
import ComponentSidebar from './ComponentSidebar';
// adjust path if needed

interface Chat {
  id: string;
  name: string;
}


import Vapi from '@vapi-ai/web';



import { extractTextFromPDF, extractTextFromDocx, extractTextFromImage } from "@/lib/fileParser.client";






enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [fileTitle, setFileTitle] = useState<string>('');
  const [parsedContent, setParsedContent] = useState<string>('');
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
  const savedContent = localStorage.getItem('parsedContent');
  if (savedContent) {
    setParsedContent(savedContent);
  }
}, []);


const vapiRef = useRef<Vapi | null>(null);

useEffect(() => {
  if (!vapiRef.current) {
    vapiRef.current = vapi;
  }
}, []);

const [chats, setChats] = useState<Chat[]>([
  { id: "1", name: "Intro to AI" },
  { id: "2", name: "Math Notes" }
]);

const handleNewChat = () => {
  const newChat = { id: Date.now().toString(), name: "New Chat" };
  setChats((prev) => [newChat, ...prev]);
};

const handleSelectChat = (id: string) => {
  console.log("Selected Chat:", id);
};

const handleRenameChat = (id: string, newName: string) => {
  setChats((prev) =>
    prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
  );
};

const handleDeleteChat = (id: string) => {
  setChats((prev) => prev.filter((chat) => chat.id !== id));
};


  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

 useEffect(() => {
  const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
  const onCallEnd = () => {
    setCallStatus(CallStatus.FINISHED);
    addToSessionHistory(companionId);
  };
  
const onMessage = async (message: Message) => {
  if (message.type === 'transcript' && message.transcriptType === 'final') {
    const newMessage = { role: message.role, content: message.transcript };
    setMessages((prev) => [newMessage, ...prev]);

    if (message.role === "user") {
      const userInput = message.transcript.toLowerCase();

      // SMART INTENT CHECKING
      const wantsToRead =
        userInput.includes("read") ||
        userInput.includes("go through") ||
        userInput.includes("explain") ||
        userInput.includes("teach");

      const wantsQuestions =
        userInput.includes("quiz") ||
        userInput.includes("ask") ||
        userInput.includes("question") ||
        userInput.includes("test");

      if (wantsToRead) {
        // AI will summarize or read note
        const summaryResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                sender: 'user',
                content: `Please summarize or teach the following content:\n\n${parsedContent}`,
              },
            ],
          }),
        });

        const summaryData = await summaryResponse.json();

        const newConfig = configureAssistant(voice, style, subject, topic);
        newConfig.firstMessage = summaryData.reply;

        if (newConfig.model?.messages) {
          newConfig.model.messages.push({
            role: "user",
            content: parsedContent.slice(0, 1000),
          });
        }

        vapiRef.current?.start(newConfig);
        return;
      }

      if (wantsQuestions) {
        // AI will quiz the user
        const questionsResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                sender: 'user',
                content: `Based on this note:\n\n${parsedContent}\n\nAsk me interactive quiz-style questions one at a time.`,
              },
            ],
          }),
        });

        const questionsData = await questionsResponse.json();

        const newConfig = configureAssistant(voice, style, subject, topic);
        newConfig.firstMessage = questionsData.reply;

        if (newConfig.model?.messages) {
          newConfig.model.messages.push({
            role: "user",
            content: parsedContent.slice(0, 1000),
          });
        }

        vapiRef.current?.start(newConfig);
        return;
      }

      // FALLBACK
      const openEndedResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      {
        sender: 'user',
        content: message.transcript,
      },
    ],
  }),
});

const openData = await openEndedResponse.json();

vapiRef.current?.send({
  type: "say",
  message: openData.reply || "Could you please rephrase your question?",
});

    }
  }
};





const onSpeechStart = () => {
  setIsSpeaking(true);
};

const onSpeechEnd = () => {
  setIsSpeaking(false);
};




   const onError = async (error: any) => {
  console.log("Vapi Error:", error);

  // ✅ Handle wallet balance error (HTTP 400 with specific message)
  if (
    error?.response?.status === 400 &&
    error?.response?.data?.message?.includes("Wallet Balance")
  ) {
    console.warn("Vapi wallet balance is too low. Upgrade your plan to continue using voice features.");
    alert("❌ Your Vapi wallet balance is too low. Please top up or upgrade your plan.");
    setCallStatus(CallStatus.FINISHED); // Optional: end session
    return;
  }

  // ✅ Fallback error logging for other cases
  if (error?.error instanceof Response) {
    const text = await error.error.text();
    console.error("Vapi Response Error Body:", text);
  }
};


  if (vapiRef.current) {
    vapiRef.current.on('call-start', onCallStart);
    vapiRef.current.on('call-end', onCallEnd);
    vapiRef.current.on('message', onMessage);
    vapiRef.current.on('error', onError);
    vapiRef.current.on('speech-start', onSpeechStart);
    vapiRef.current.on('speech-end', onSpeechEnd);
  }

  return () => {
    if (vapiRef.current) {
      vapiRef.current.off('call-start', onCallStart);
      vapiRef.current.off('call-end', onCallEnd);
      vapiRef.current.off('message', onMessage);
      vapiRef.current.off('error', onError);
      vapiRef.current.off('speech-start', onSpeechStart);
      vapiRef.current.off('speech-end', onSpeechEnd);
    }
  };
}, []);


  const toggleMicrophone = () => {
    const isMuted = vapiRef.current?.isMuted();
    vapiRef.current?.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapiRef.current?.stop();

  };

 const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setUploadedFile(file);
    setFileTitle(file.name);
    let text = '';

    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    } else if (file.name.endsWith('.docx')) {
      text = await extractTextFromDocx(file);
    } else if (file.type.startsWith('image/')) {
      text = await extractTextFromImage(file);
      const url = URL.createObjectURL(file);
      setFileURL(url);
    } else if (file.type === 'text/plain') {
      text = await file.text();
    }

    setParsedContent(text);
  }
};


  const [isEditingTitle, setIsEditingTitle] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);


   const handleUserInterrupt = async (question: string) => {
  if (!voice || !style) {
    alert("Missing assistant voice or style configuration.");
    return;
  }

  const assistantConfig = configureAssistant(voice, style, subject, topic);
 assistantConfig.firstMessage = `Hello ${userName}! Welcome to this teaching lesson on "${name}". Would you like me to *read through the note* or *ask you questions* based on it?`;


  if (assistantConfig.model?.messages) {
    assistantConfig.model.messages.push({
      role: "user",
      content: parsedContent || "",
    });
  }

  setMessages((prev) => [
    ...prev,
    { role: "user", content: question },
  ]);

  vapiRef.current?.start(assistantConfig);
  setCallStatus(CallStatus.ACTIVE);
};

const handleCall = async () => {
  if (!parsedContent?.trim()) {
    alert("Please upload and wait for the document to be processed before starting.");
    return;
  }

  if (!voice || !style) {
    alert("Missing assistant voice or style configuration.");
    return;
  }

  setCallStatus(CallStatus.CONNECTING);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            sender: 'user',
            content: `I have uploaded a document. Based on this content:\n\n${parsedContent}\n\nTeach or summarize it like you're tutoring me.`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!data.reply || typeof data.reply !== 'string') {
      alert("Assistant could not generate a valid reply.");
      setCallStatus(CallStatus.FINISHED);
      return;
    }

    const assistantConfig = configureAssistant(voice, style, subject, topic);

    const firstSpokenMessage = `Hello ${userName}! Welcome to this teaching lesson on "${name}". Would you like me to *read the note* or *ask you questions* based on it?`;

    if (assistantConfig.model?.messages) {
      assistantConfig.model.messages.push({
        role: "user",
        content: parsedContent,
      });
    }

    const assistantOverrides = {
      variableValues: {
        subject: subject || "General",
        topic: topic || "Topic",
        style: style || "Default",
      },
    };

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `I uploaded a document. Here is the content:\n\n${parsedContent}` },
      { role: 'assistant', content: `Hello, I have scanned the document. Let's get started.` },
    ]);

    // Start the voice session without speaking the first message yet
    await vapiRef.current?.start(assistantConfig, assistantOverrides);
    setCallStatus(CallStatus.ACTIVE);

    // Now speak the welcome message with interruption enabled
 setTimeout(() => {
  vapiRef.current?.send({
    type: "say",
    message: firstSpokenMessage
  });
}, 100);



  } catch (error) {
    console.error("[handleCall error]", error);
    alert("An error occurred while starting the session.");
    setCallStatus(CallStatus.FINISHED);
  }
};







if (!hasMounted) return null;


  return (
  <div className="flex h-screen overflow-hidden">
    {/* Sidebar */}
<ComponentSidebar
  chats={chats}
  userName={userName}           // <-- make sure you're passing these props
  userImage={userImage}         // <-- required!
  onNewChat={handleNewChat}
  onSelectChat={handleSelectChat}
  onRenameChat={handleRenameChat}
  onDeleteChat={handleDeleteChat}
  onLogout={() => console.log('Logout clicked')} // or your actual logout function
/>


    {/* Main Content */}
    <div className="flex-1 overflow-y-auto px-6 sm:px-12 no-scrollbar">

        <section className="flex flex-col h-[70vh] relative">
         
      <div className="flex flex-wrap gap-6 pt-6 ">
        <CompanionCard
          id={companionId}
          name={name}
          topic={topic}
          subject={subject}
          duration={0}
          color={getSubjectColor(subject)}
          bookmarked={false}
        />
       

        {uploadedFile && (
  <div
    className="p-4 rounded-xl shadow-md text-black w-full sm:max-w-xs border border-black relative"
    style={{ backgroundColor: getSubjectColor(subject) }}
  >
    <div className="flex items-center justify-between mb-2">
      {isEditingTitle ? (
        <input
          ref={inputRef}
          className="text-lg font-bold bg-white border rounded px-2 py-1 outline-none w-full"
          value={fileTitle}
          onChange={(e) => setFileTitle(e.target.value)}
          onBlur={() => setIsEditingTitle(false)} // close on click outside
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsEditingTitle(false); // close on enter
            }
          }}
          autoFocus
        />
      ) : (
        <>
          <span className="text-lg font-bold truncate w-full">{fileTitle}</span>
          <Pencil
            className="w-4 h-4 ml-2 text-white cursor-pointer"
            onClick={() => setIsEditingTitle(true)}
          />
        </>
      )}
    </div>

    <p className="text-sm break-words italic mb-2">{uploadedFile.name}</p>

    {fileURL && uploadedFile.type.startsWith('image/') && (
      <div className="mb-4">
        <Image src={fileURL} alt="Uploaded" width={300} height={300} className="rounded-md object-contain" />
      </div>
    )}

    <div className="flex justify-center mt-6">
      <button
  disabled={callStatus === CallStatus.CONNECTING}
  onClick={() => handleUserInterrupt(`I have uploaded a document. Based on this content:\n\n${parsedContent}\n\nTeach or summarize it like you're tutoring me.`)}

  className="bg-orange-500 mt-32 h-13 w-100 text-white font-semibold py-2 px-4 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
>
  {callStatus === CallStatus.CONNECTING ? 'Processing...' : 'Scan & Start Session'}
</button>

    </div>
  </div>
)}

      </div>

      <section className="flex gap-8 max-sm:flex-col pt-6">
        <div className="companion-section">
          <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject) }}>
            <div className={cn('absolute transition-opacity duration-1000', callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-100' : 'opacity-0', callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse')}>
              <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit" />
            </div>
            <div className={cn('absolute transition-opacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0')}>
              <Lottie lottieRef={lottieRef} animationData={soundwaves} autoplay={false} className="companion-lottie" />
            </div>
          </div>
          <p className="font-bold text-2xl">{name}</p>
        </div>

        <div className="user-section">
          <div className="user-avatar">
            <Image src={userImage} alt={userName} width={130} height={130} className="rounded-lg" />
            <p className="font-bold text-2xl">{userName}</p>
          </div>
          <button className="btn-mic" onClick={toggleMicrophone} disabled={callStatus !== CallStatus.ACTIVE}>
            <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={36} height={36} />
            <p className="max-sm:hidden">{isMuted ? 'Turn on microphone' : 'Turn off microphone'}</p>
          </button>
          <button
            className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white', callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary', callStatus === CallStatus.CONNECTING && 'animate-pulse')}
            onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
          >
            {callStatus === CallStatus.ACTIVE ? 'End Session' : callStatus === CallStatus.CONNECTING ? 'Connecting' : 'Start Session'}
          </button>
        </div>
      </section>

      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {messages.map((message, index) => (
            message.role === 'assistant' ? (
              <p key={index} className="max-sm:text-sm">{name.split(' ')[0].replace(/[.,]/g, '')}: {message.content}</p>
            ) : (
              <p key={index} className="text-primary max-sm:text-sm">{userName}: {message.content}</p>
            )
          ))}
        </div>
        <div className="transcript-fade" />
      </section>

      

 



    </section>
    </div>
  </div>
);

};

export default CompanionComponent;
