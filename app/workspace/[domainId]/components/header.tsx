"use client"

import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

export default function Header ({domainName}: {domainName: string}) {
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900 truncate">
                    {domainName}
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
