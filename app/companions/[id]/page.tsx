import { getCompanion } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
  params: { id: string };
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = params;

  // Get companion data from your DB or source
  const companion = await getCompanion(id);

  // Try to get current user (may be null if public user)
  const user = await currentUser();

  // Redirect only if the companion was not found
  if (!companion?.name) redirect("/companions");

  return (
    <main className="w-full h-screen p-0 m-0 overflow-hidden">
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user?.firstName || "friend"}
        userImage={user?.imageUrl || "/images/default-avatar.png"}
      />
    </main>
  );
};

export default CompanionSession;
