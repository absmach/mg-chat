"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // adjust path if needed
import { LogOut } from "lucide-react"; // or wherever you're importing from
import { signOut } from "next-auth/react"; // assuming you're using next-auth

export const Logout = () => {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
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
