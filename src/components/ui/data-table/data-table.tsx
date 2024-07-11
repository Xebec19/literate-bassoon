"use client";

import {
  Cell,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Header,
  Table as TanStackTable,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { defaultColumnSizing } from "../../../constants/columns";
import { GripVertical } from "lucide-react";

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
import { useState } from "react";

const DraggableTableHeader = ({
  header,
  table,
}: {
  header: Header<any, unknown>;
  table: TanStackTable<any>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  return (
    <TableHead
      className=""
      key={header.id}
      {...{
        colSpan: header.colSpan,
        style: {
          width: header.getSize(),
          opacity: isDragging ? 0.8 : 1,
          position: "relative",
          transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
          transition: "width transform 0.2s ease-in-out",
          whiteSpace: "nowrap",
          // width: header.column.getSize(),
          zIndex: isDragging ? 1 : 0,
        },
      }}
      ref={setNodeRef}
    >
      <div className="flex justify-between items-center">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <GripVertical
          {...{
            onDoubleClick: () => header.column.resetSize(),
            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: `resizer size-4 muted cursor-col-resize ${
              table.options.columnResizeDirection
            } ${header.column.getIsResizing() ? "isResizing" : ""}`,
            // style: {
            //   transform:
            //     columnResizeMode === "onEnd" &&
            //     header.column.getIsResizing()
            //       ? `translateX(${
            //           (table.options.columnResizeDirection ===
            //           "rtl"
            //             ? -1
            //             : 1) *
            //           (table.getState().columnSizingInfo
            //             .deltaOffset ?? 0)
            //         }px)`
            //       : "",
            // },
          }}
        />
        <button {...attributes} {...listeners}>
          🟰
        </button>
      </div>
    </TableHead>

    // <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
    //   {header.isPlaceholder
    //     ? null
    //     : flexRender(header.column.columnDef.header, header.getContext())}
    //   <button {...attributes} {...listeners}>
    //     🟰
    //   </button>
    // </th>
  );
};

const DragAlongCell = ({ cell }: { cell: Cell<any, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  return (
    <TableCell
      key={cell.id}
      {...{
        style: {
          opacity: isDragging ? 0.8 : 1,
          position: "relative",
          transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
          transition: "width transform 0.2s ease-in-out",
          width: cell.column.getSize(),
          zIndex: isDragging ? 1 : 0,
        },
      }}
      ref={setNodeRef}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const columnResizeMode = "onChange";
  const columnResizeDirection = "ltr";

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    defaultColumn: {
      size: defaultColumnSizing.size, //starting column size
      minSize: defaultColumnSizing.minSize, //enforced during column resizing
      maxSize: defaultColumnSizing.maxSize, //enforced during column resizing
    },
  });

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

  return (
    <div className="rounded-md border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table
          {...{
            style: {
              width: table.getCenterTotalSize(),
            },
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <DraggableTableHeader
                        key={header.id}
                        header={header}
                        table={table}
                      />
                    );
                  })}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
  );
}
