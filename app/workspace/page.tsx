
import { getServerSession } from "@/lib/nextauth";
import { MessageCircleMore } from "lucide-react";

export default async function Home() {
    const session = await getServerSession();
    const user = session?.user;
    return (
        <div className="flex min-h-svh flex-col items-center justify-center text-center p-6">
            <div className="flex items-center justify-center mb-6">
                <MessageCircleMore className="h-12 w-12 text-gray-900" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back{user?.username ? `, ${user.username}` : "user"}!
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose a workspace to continue your conversations, or create a new one to get started.
            </p>
        </div>
    )
}
