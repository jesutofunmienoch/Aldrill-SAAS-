import { getCompanion } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
  params: { id: string };
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = params;

  const companion = await getCompanion(id);
  const user = await currentUser();

  if (!user) redirect("/sign-in");
  if (!companion?.name) redirect("/companions");

  return (
    <main className="w-full h-screen p-0 m-0 overflow-hidden">
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default CompanionSession;
