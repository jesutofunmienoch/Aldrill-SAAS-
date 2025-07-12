import { getCompanion } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
  params: { id: string }; // ✅ No need to wrap in Promise
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = params; // ✅ Removed await
  const companion = await getCompanion(id);
  const user = await currentUser();

  const { name } = companion;

  if (!user) redirect("/sign-in");
  if (!name) redirect("/companions");

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
