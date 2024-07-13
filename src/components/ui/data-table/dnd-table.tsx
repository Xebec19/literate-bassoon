import React, { CSSProperties, useTransition } from "react";

import {
  Cell,
  ColumnDef,
  Header,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { makeData, Person } from "../../../lib/makeData";

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

const DraggableTableHeader = ({
  header,
}: {
  header: Header<Person, unknown>;
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
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <>
      <TableHead colSpan={header.colSpan} ref={setNodeRef} style={style}>
        <div className="flex justify-between item-center">
          <div className="space-x-2 items-center flex">
            <span
              className={
                header.column.getCanSort() ? "cursor-pointer select-none" : ""
              }
              title={
                header.column.getCanSort()
                  ? header.column.getNextSortingOrder() === "asc"
                    ? "Sort ascending"
                    : header.column.getNextSortingOrder() === "desc"
                    ? "Sort descending"
                    : "Clear sort"
                  : undefined
              }
              {...attributes}
              {...listeners}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </span>
            <button onClick={header.column.getToggleSortingHandler()}>
              {{
                asc: <ArrowUp className="size-4" />,
                desc: <ArrowDown className="size-4" />,
              }[header.column.getIsSorted() as string] ?? (
                <ArrowDownUp className="size-4" />
              )}
            </button>
          </div>

          <GripVertical
            {...{
              onDoubleClick: () => header.column.resetSize(),
              onMouseDown: header.getResizeHandler(),
              onTouchStart: header.getResizeHandler(),
              className: `resizer ltr cursor-ew-resize ${
                header.column.getIsResizing() ? "isResizing" : ""
              }`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </TableHead>
    </>
  );
};

const DragAlongCell = ({ cell }: { cell: Cell<Person, unknown> }) => {
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

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: () => <span>First Name</span>,
        cell: (info) => info.getValue(),
        id: "firstName",
        size: 150,
      },
      {
        accessorFn: (row) => row.lastName,
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        id: "lastName",
        size: 150,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        id: "age",
        size: 120,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        id: "visits",
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Status",
        id: "status",
        size: 150,
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        id: "progress",
        size: 180,
      },
    ],
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = React.useState(() => makeData(20));
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
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={
            (table.getColumn("firstName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
        &nbsp;&nbsp;
        <Button
          variant={"outline"}
          disabled={isPending}
          onClick={() => resetFilters()}
        >
          Reset
        </Button>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s).
        </div>
        <div className="space-x-2">
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
    </div>
  );
}
