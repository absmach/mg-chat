import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Pencil, Trash2 } from "lucide-react";

export function SaveButton({ disabled }: { disabled?: boolean }) {
    return (
        <Button
            disabled={disabled}
            type="submit"
            variant="outline"
            size="icon"
            className="text-enabled hover:text-enabled"
        >
            <span className="sr-only">Save</span>
            <CircleCheck className="size-5" />
        </Button>
    );
}

export function CancelButton({
    disabled,
    onClick,
}: {
    disabled?: boolean;
    onClick?: () => void;
}) {
    return (
        <Button
            disabled={disabled}
            type="button"
            variant="outline"
            size="icon"
            className="text-disabled hover:text-disabled"
            onClick={onClick}
        >
            <span className="sr-only">Cancel</span>
            <CircleX className="size-5" />
        </Button>
    );
}

export function EditButton({
    disabled,
    onClick,
}: {
    disabled?: boolean;
    onClick?: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClick}
            className="hover:bg-primary/10"
            disabled={disabled}
        >
            <span className="sr-only">Edit</span>
            <Pencil className="size-4" />
        </Button>
    );
}

export function DeleteButton({
    disabled,
    onClick,
}: {
    disabled?: boolean;
    onClick?: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClick}
            className="hover:bg-primary/10"
            disabled={disabled}
        >
            <span className="sr-only">Delete</span>
            <Trash2 className="size-4" />
        </Button>
    );
}
