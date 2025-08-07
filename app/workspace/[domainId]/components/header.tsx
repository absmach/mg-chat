"use client"

import { Button } from "@/components/ui/button";
import { Domain } from "@absmach/magistrala-sdk";
import { Bell, Settings } from "lucide-react";
import { useParams } from "next/navigation";

export default function Header () {
    const params = useParams();
    const domainId = params?.domainId as string
    const currentDomain: Domain = {
        id: domainId,
        name: 'Current Workspace'
    }
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900 truncate">
                    {currentDomain.name}
                </h2>
                <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
