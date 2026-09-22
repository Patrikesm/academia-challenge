import Admin from "@/components/Admin";
import { getAuthenticatedParticipant } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const participant = await getAuthenticatedParticipant();
  if (!participant) redirect("/");

  return (
    <main>
      <div className="container">
        <Admin />
      </div>
    </main>
  );
}