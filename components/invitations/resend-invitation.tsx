import type { UserBasicInfo } from "@absmach/magistrala-sdk";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { GetUserBasicInfo } from "@/lib/workspace";
import { SendInvitation } from "@/lib/invitations";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ResendInvitation({
    roleId,
    userId,
    domainId,
}: {
    roleId: string;
    userId: string;
    domainId: string;
}) {
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState<UserBasicInfo | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await GetUserBasicInfo(userId);
            setUser(response as UserBasicInfo);
        };
        fetchUser();
    }, [userId]);

    const handleSend = async () => {
        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading("Resending invitation...", {
            id: toastId,
        });

        const result = await SendInvitation(userId, roleId, domainId, true);
        setProcessing(false);
        if (result.error === null) {
            toast.success(
                `Invitation resent successfully to "${user?.credentials?.username}"`,
                {
                    id: toastId,
                },
            );
        } else {
            toast.error(
                `Failed to resend invitation to "${user?.credentials?.username}" with error "${result.error}"`,
                {
                    id: toastId,
                },
            );
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild={true}>
                <Button variant="outline">
                    Resend
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Resend Invitation</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <p>
                    This will resend the Invitation to{" "}
                    <span className="font-bold">
                        {user?.credentials?.username ?? "user"}
                    </span>
                </p>
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <DialogClose asChild={true}>
                        <Button disabled={processing} type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button disabled={processing} type="button" onClick={handleSend}>
                        Resend
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
