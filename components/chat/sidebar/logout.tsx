"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { LogOut } from "lucide-react"; 
import { signOut } from "next-auth/react";

export const Logout = () => {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:bg-muted/50 cursor-pointer"
            onClick={async () => {
                const data = await signOut({
                    redirect: false,
                    callbackUrl: "/auth",
                });
                router.push(data.url);
            }}
        >
            <LogOut className="h-4 w-4" />
        </Button>
    );
};
