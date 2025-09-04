import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { SearchUsers } from "@/lib/users";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/entities";
import { ChevronsUpDown, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";

// biome-ignore lint/suspicious/noExplicitAny: This infiniteSelect component is meant to be used by any dataType.
type InfiniteSelectController = ControllerRenderProps<any>;
interface UserSearchInputProps {
    field: InfiniteSelectController;
    defaultValues?: Option[];
    disabled?: boolean;
    className?: string;
    badgeClassName?: string;
    hideClearAllButton?: boolean;
    multipleSelect?: boolean;
}

export default function UserSearchInput({
    field,
    defaultValues,
    disabled,
    className,
    badgeClassName,
    hideClearAllButton = false,
    multipleSelect = true,
}: UserSearchInputProps) {
    const [open, setOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<Option[]>(
        defaultValues || [],
    );

    const [data, setData] = useState<Option[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
        async (searchValue: string): Promise<Option[]> => {
            if (searchValue.trim() === "") {
                return [];
            }

            const delay = (ms: number) =>
                new Promise((resolve) => setTimeout(resolve, ms));
            await delay(500);

            const response = await SearchUsers({ username: searchValue });
            if (response.error !== null) {
                toast.error(`Failed to search for user with error: ${response.error}`);
                return [];
            }
            if (response.data?.total === 0) {
                return [];
            }

            const dataOptions: Option[] = response.data?.users.map((user) => ({
                value: user.id as string,
                label: user.credentials?.username as string,
            })) as Option[];

            return dataOptions;
        },
        [],
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const options = await handleSearch(searchTerm);
            setData(options);
            setIsLoading(false);
        };

        if (searchTerm.trim().length >= 3) {
            fetchData();
        } else {
            setData([]);
        }
    }, [searchTerm, handleSearch]);

    const handleUnselect = useCallback(
        (option: Option) => {
            const newOptions = selectedValues?.filter(
                (s) => s.value !== option.value,
            );
            updateSelection(newOptions);
        },
        [selectedValues],
    );

    const updateSelection = (newOptions: Option[]) => {
        setSelectedValues(newOptions);
        const fieldArray: string[] = newOptions.map((option) => option.value);
        field?.onChange(fieldArray);
    };

    const selectables = useMemo(() => {
        return data.filter(
            (item) =>
                !selectedValues?.some((selected) => selected.value === item.value),
        );
    }, [data, selectedValues]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <FormControl>
                <PopoverTrigger asChild={true} className="md:min-w-32">
                    {multipleSelect ? (
                        <div
                            // biome-ignore lint/a11y/useSemanticElements: intentional
                            role="button"
                            tabIndex={disabled ? -1 : 0}
                            className={cn(
                                "min-h-10 rounded-md w-full border border-input text-sm",
                                {
                                    "px-3 py-2": selectedValues?.length > 0,
                                    "cursor-pointer": !disabled,
                                },
                                className,
                            )}
                            onClick={() => !disabled && setOpen(true)}
                            onKeyDown={(e) => {
                                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                                    e.preventDefault();
                                    setOpen(true);
                                }
                            }}
                        >
                            {selectedValues?.length === 0 ? (
                                <span className="text-muted-foreground flex h-full items-center px-3 py-2">
                                    Search for user(s)
                                </span>
                            ) : (
                                <div className="relative flex flex-wrap gap-1">
                                    {selectedValues?.map((option) => {
                                        return (
                                            <Badge
                                                key={option.value}
                                                className={cn(
                                                    "data-disabled:bg-muted-foreground data-disabled:text-muted data-disabled:hover:bg-muted-foreground",
                                                    "data-fixed:bg-muted-foreground data-fixed:text-muted data-fixed:hover:bg-muted-foreground",
                                                    badgeClassName,
                                                )}
                                                variant="outline"
                                                data-fixed={option.fixed}
                                                data-disabled={disabled || undefined}
                                            >
                                                {option.label}
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                        (disabled || option.fixed) && "hidden",
                                                    )}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleUnselect(option);
                                                        }
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={() => handleUnselect(option)}
                                                >
                                                    <X className="h-3 w-3 hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateSelection([]);
                                        }}
                                        className={cn(
                                            "absolute right-0 size-6 p-0",
                                            hideClearAllButton ||
                                            disabled ||
                                            (selectedValues && selectedValues?.length === 0),
                                        )}
                                    >
                                        <X />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            // biome-ignore lint/a11y/useSemanticElements: intentional
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between truncate"
                        >
                            {selectedValues?.[0]?.label || "Search for a user"}
                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                    )}
                </PopoverTrigger>
            </FormControl>
            <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                <Command>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 size-4 shrink-0 opacity-50" />
                        <Input
                            ref={(node: HTMLInputElement) => node?.focus()}
                            placeholder={"Search user by name"}
                            onChange={(e) => {
                                e.stopPropagation();
                                setSearchTerm(e.target.value);
                            }}
                            value={searchTerm}
                            className="w-full p-0 focus-visible:ring-0 text-sm border-none bg-transparent focus-visible:ring-transparent focus-visible:ring-offset-0 outline-none"
                        />
                    </div>
                    <Button
                        className="my-2 w-full"
                        variant="ghost"
                        type="button"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            updateSelection([]);
                        }}
                    >
                        Clear selection
                    </Button>
                    <CommandList>
                        {!isLoading && (
                            <CommandEmpty>No user found</CommandEmpty>
                        )}
                        <CommandGroup>
                            {selectables?.length > 0 &&
                                selectables.map((option: Option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        disabled={option.disable}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onSelect={() => {
                                            if (multipleSelect) {
                                                const newOptions = [...selectedValues, option].filter(
                                                    (v, i, arr) =>
                                                        arr.findIndex((o) => o.value === v.value) === i,
                                                );
                                                updateSelection(newOptions);
                                            } else {
                                                updateSelection([option]);
                                                setOpen(false);
                                            }
                                        }}
                                    >
                                        {option.label}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                        {isLoading && (
                            <div className="flex justify-center p-2">
                                <Spinner />
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
