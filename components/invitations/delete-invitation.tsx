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
import { DeleteInvitation } from "@/lib/invitations";
import { useState } from "react";
import { toast } from "sonner";

export function Delete({
    domainId,
    userId,
}: {
    domainId: string;
    userId: string;
}) {
    const [processing, setProcessing] = useState(false);
    const handleDelete = async () => {
        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading("Deleting invitation ...", { id: toastId });

        const result = await DeleteInvitation({ domainId, userId });
        setProcessing(false);
        if (result.error === null) {
            toast.success("Invitation deleted successfully", {
                id: toastId,
            });
        } else {
            toast.error(
                `Failed to delete invitation with error "${result.error
                }"`,
                {
                    id: toastId,
                },
            );
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild={true}>
                <Button variant="destructive">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle> Delete Invitation</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <p>
                    Are you sure you want to
                    <span className="text-red-600 font-bold">
                        {" "}
                        delete
                        {" "}
                    </span>
                    the invitation
                </p>
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <DialogClose asChild={true}>
                        <Button disabled={processing} type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={processing}
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
