import React, { CSSProperties, useTransition } from "react";

import {
  Cell,
  ColumnDef,
  Header,
  SortingState,
  flexRender,
  getCoreRowModel,
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
import { ArrowDown, ArrowDownUp, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "../button";

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
    state: {
      sorting,
      columnOrder,
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
    });
  }

  return (
    <>
      <div
        className="w-full flex justify-end"
        {...{ style: { width: table.getCenterTotalSize() } }}
      >
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
          <Table {...{ style: { width: table.getCenterTotalSize() } }}>
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
              {table.getRowModel().rows.map((row) => (
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
              ))}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </>
  );
}
