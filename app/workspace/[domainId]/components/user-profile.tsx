"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, UserInfo } from "@/types/auth";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserProfile({user}: {user: UserInfo}) {
    const router = useRouter();
    const handleLogout = async () => {
            const data = await signOut({
                redirect: false,
                callbackUrl: '/login',
            })
            router.push(data.url)
        }
    return (
        <div className="p-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.image } />
                    <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {user.email || "user@example.com"}
                    </p>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
