"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Domain, User } from "@absmach/magistrala-sdk";
import { useParams, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { CreateWorkspaceForm } from "../workspace/[domainId]/components/add-workspace-dialog";

export type Props = {
    children: ReactNode;
    domains: Domain[];
    user: User;
};


export default function RootLayout({
    children, domains, user }: Props) {
    const router = useRouter();
    const params = useParams();
    const currentDomainId = params?.domainId as string;

    const switchWorkspace = (domainId: string) => {
        router.push(`/workspace/${domainId}`)
    }
    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2">
                <TooltipProvider>
                    <ScrollArea className="flex-1 w-full">
                        <div className="flex flex-col items-center space-y-2 px-2">
                            {domains?.map((domain) => (
                                <Tooltip key={domain.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`w-12 h-12 rounded-xl p-0 hover:rounded-lg transition-all duration-200 ${currentDomainId === domain.id
                                                ? 'bg-white text-gray-900 rounded-lg'
                                                : 'bg-gray-700 text-black hover:bg-gray-600'
                                                }`}
                                            onClick={() => switchWorkspace(domain.id as string)}
                                        >
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className="text-xs font-semibold">
                                                    {domain.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{domain.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CreateWorkspaceForm user={user}/>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Add Workspace</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </ScrollArea>
                </TooltipProvider>
            </div>

            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}
