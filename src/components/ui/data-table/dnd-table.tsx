import React, { CSSProperties, useMemo, useTransition } from "react";

import {
  Cell,
  ColumnDef,
  Header,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { makeData, ZodPerson } from "../../../lib/makeData";

// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDownIcon,
  GripVertical,
} from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { z } from "zod";
import { format } from "date-fns";

const DraggableTableHeader = ({
  header,
}: {
  header: Header<z.infer<typeof ZodPerson>, unknown>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    minWidth: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <>
      <TableHead colSpan={header.colSpan} ref={setNodeRef} style={style}>
        <div className="flex justify-between item-center">
          <div className="space-x-2 items-center flex">
            <span className={"cursor-grab"} {...attributes} {...listeners}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </span>
            <Button
              onClick={header.column.getToggleSortingHandler()}
              variant={"ghost"}
              title={
                header.column.getCanSort()
                  ? header.column.getNextSortingOrder() === "asc"
                    ? "Sort ascending"
                    : header.column.getNextSortingOrder() === "desc"
                    ? "Sort descending"
                    : "Clear sort"
                  : undefined
              }
            >
              {{
                asc: <ArrowUp className="size-4" />,
                desc: <ArrowDown className="size-4" />,
              }[header.column.getIsSorted() as string] ?? (
                <ArrowDownUp className="size-4" />
              )}
            </Button>
          </div>

          {header.column.getCanResize() ? (
            <Button variant={"ghost"} onClick={(e) => e.stopPropagation()}>
              <GripVertical
                {...{
                  onDoubleClick: () => header.column.resetSize(),
                  onMouseDown: header.getResizeHandler(),
                  onTouchStart: header.getResizeHandler(),
                  className: `resizer ltr cursor-ew-resize ${
                    header.column.getIsResizing() ? "isResizing" : ""
                  }`,
                }}
              />
            </Button>
          ) : (
            <></>
          )}
        </div>
      </TableHead>
    </>
  );
};

const DragAlongCell = ({
  cell,
}: {
  cell: Cell<z.infer<typeof ZodPerson>, unknown>;
}) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

export default function DndTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [isPending, startTransition] = useTransition();

  const columns = React.useMemo<ColumnDef<z.infer<typeof ZodPerson>>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <span>ID</span>,
        id: "id",
        size: 120,
      },
      {
        accessorKey: "name",
        header: () => <span>Name</span>,
        id: "name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: () => <span>Email</span>,
        id: "email",
        size: 150,
      },
      {
        accessorKey: "age",
        header: () => <span>Age</span>,
        id: "age",
        size: 120,
      },
      {
        accessorKey: "registrationDate",
        header: () => <span>Registration Date</span>,
        cell: ({ row }) => (
          <span>
            {format(new Date(row.getValue("registrationDate")), "MM/dd/yyyy")}
          </span>
        ),
        id: "registrationDate",
        size: 120,
        enableResizing: false,
      },
    ],
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = useMemo(() => makeData(20), []);
  console.log({ data });
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data,
    columns,
    columnResizeDirection: "ltr",
    columnResizeMode: "onChange",
    defaultColumn: {
      minSize: 50,
      maxSize: 600,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnOrder,
      columnVisibility,
    },
    onColumnOrderChange: setColumnOrder,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function resetFilters() {
    startTransition(() => {
      const colOrder = columns.map((c) => c.id!);
      setColumnOrder(colOrder);
      setSorting([]);
      setColumnVisibility({});
      table.getColumn("name")?.setFilterValue("");
      table.getColumn("email")?.setFilterValue("");
    });
  }

  return (
    <div className="w-full">
      <div className="py-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <Input
          placeholder="Search Name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Search Email"
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={"outline"}
            disabled={isPending}
            onClick={() => resetFilters()}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell key={cell.id} cell={cell} />
                      </SortableContext>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
