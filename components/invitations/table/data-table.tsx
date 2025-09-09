"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StatusButton from "@/components/custom/status-button";
import { DataTableViewOptions } from "@/components/invitations/table/column-toggle";
import { DataTablePagination } from "@/components/invitations/table/pagination";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function DataTable<TableData, TableValue>({
    columns,
    currentPage,
    limit,
    total,
    data,
    showStatusFilter,
}: {
    columns: ColumnDef<TableData, TableValue>[];
    currentPage: number;
    limit: number;
    total: number;
    // biome-ignore lint/suspicious/noExplicitAny: Data is a generic type
    data: any;
    showStatusFilter: boolean;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    useEffect(() => {
        const handlePaginationChange = (
            newPageIndex: number,
            newPageSize: number,
        ) => {
            setPagination((prevPagination) => ({
                ...prevPagination,
                pageIndex: newPageIndex - 1,
                pageSize: newPageSize,
            }));
        };
        handlePaginationChange(currentPage, limit);
    }, [currentPage, limit]);

    const table = useReactTable({
        data: data ? data : [],
        columns,
        rowCount: total,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
    });
    return (
        <QueryClientProvider client={queryClient}>
            {/* <div className="py-4 flex justify-end items-center">
                {showStatusFilter && <StatusButton />}
                <DataTableViewOptions table={table} />
            </div> */}
            <div className="rounded-md w-full border mb-3 bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 max-w-20 overflow-x-auto text-center text-muted-foreground"
                                >
                                    <span className="text-balance">
                                        No invitations sent. Get started by sending invitations.
                                    </span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* <DataTablePagination table={table} />  */}
        </QueryClientProvider>
    );
}
