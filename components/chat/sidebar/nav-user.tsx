import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Session } from "@/types/auth";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  session: Session;
}
export function NavUser({ session }: Props) {
  const user = session?.user;
  const route = useRouter();
  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={user?.image || "/placeholder.svg"} />
          <AvatarFallback className="bg-purple-600 text-white">
            {user?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.username || "User"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user?.email || "user@example.com"}
          </p>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            onClick={async () => {
              const data = await signOut({
                redirect: false,
                callbackUrl: "/auth",
              });
              route.push(data.url);
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
