
import { getServerSession } from "@/lib/nextauth";
import { GetDomains } from "@/lib/domains";
import { MessageCircleMore } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();
  const basePath = process.env.MG_UI_BASE_PATH || "";
  const response = await GetDomains ({
    queryParams: {
      offset: 0,
      limit: 10,
      dir: "desc",
    },
  });
  return (
    <div className="flex flex-center">
      <MessageCircleMore />
      <span>Click on a workspace or create a new one to chat</span>
    </div>
  )
}
