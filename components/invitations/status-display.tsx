import { CircleDashed, ShieldBan, ShieldCheck, ShieldMinus } from "lucide-react";

export function DisplayStatusWithIcon({ status }: { status: string }) {
    const currentStatus = statusSchema.find((state) => state.value === status);
    if (!currentStatus) {
        return <span className="text-center flex items-center">Unknown</span>;
    }

    return (
        <span className="flex items-center">
            {currentStatus.icon && (
                <currentStatus.icon
                    className="mr-2 size-4 text-muted-foreground"
                    color={currentStatus.colour}
                />
            )}
            <span className="text-center">
                {currentStatus.label}
            </span>
        </span>
    );
}

const statusSchema = [
    {
        value: "accepted",
        label: "Accepted",
        icon: ShieldCheck,
        colour: "green",
    },
    {
        value: "rejected",
        label: "Rejected",
        icon: ShieldBan,
        colour: "red",
    },
    {
        value: "all",
        label: "All",
        icon: ShieldMinus,
        colour: "grey",
    },
    {
        value: "pending",
        label: "Pending",
        icon: CircleDashed,
        colour: "#7ec0ee",
    },
];
