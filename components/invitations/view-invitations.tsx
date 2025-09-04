"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, Users } from "lucide-react"
import { Invitation } from "@absmach/magistrala-sdk"
import { AcceptInvitation, DeclineInvitation } from "@/lib/invitations"
import { toast } from "sonner"


export function NotificationsBell({ invitation }: { invitation: Invitation[] }) {
    const [invitations, setInvitations] = useState<Invitation[]>(invitation)
    const [processing, setProcessing] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleAccept = async (domainId: string) => {

        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading("Accepting invitation ...", {
            id: toastId,
        });
        const acceptResp = await AcceptInvitation(domainId)
        if (acceptResp.error === null) {
            toast.success("Invitation accepted successfully", {
                id: toastId
            });
        } else {
            toast.error(`Failed to accept invitation with error: ${acceptResp.error}`, { id: toastId });
            console.error(acceptResp.error);
        }
        setProcessing(false);
    }

    const handleDecline = async (domainId: string) => {
        setProcessing(true)
        const toastId = toast("Sonner");
        toast.loading("Accepting invitation ...", {
            id: toastId,
        });
        const declResp = await DeclineInvitation(domainId)
        if (declResp !== null) {
            toast.error(`Failed to decline invitation with error: ${declResp.error}`, { id: toastId });
        } else {
            toast.success("Invitation declined successfully", { id: toastId });
        }
        setProcessing(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {invitations.length > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {invitations.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <div className="border-b border-border p-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        <h3 className="font-semibold">Notifications</h3>
                        {invitations.length > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                                {invitations.length}
                            </Badge>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-96">
                    {invitations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No new notifications</p>
                            <p className="text-sm text-muted-foreground mt-1">You are all caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.role_id}
                                    className="border-b border-border last:border-b-0 p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="h-4 w-4 text-primary" />
                                            </div>
                                        </div>

                                        <div className="flex-3 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {invitation.domain_name}
                                                </Badge>
                                            </div>

                                            <span className="text-sm font-medium mb-4">
                                                Invitation to join <span className="text-primary">{invitation.domain_name}</span>
                                            </span>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleAccept(invitation.domain_id as string)}
                                                    disabled={processing}
                                                    className="h-7 px-3 text-xs"
                                                >
                                                    {processing === true ? (
                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <>
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Accept
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDecline(invitation.domain_id as string)}
                                                    disabled={processing}
                                                    className="h-7 px-3 text-xs"
                                                >
                                                    {processing === true ? (
                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <>
                                                            <X className="h-3 w-3 mr-1" />
                                                            Decline
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
