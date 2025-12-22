"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { QuoteItem } from "@/lib/api/quotes";

interface LineItemsEditorProps {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
  currency: string;
}

export function LineItemsEditor({
  items,
  onChange,
  currency,
}: LineItemsEditorProps) {
  const handleAddItem = () => {
    const newItem: QuoteItem = {
      description: "",
      quantity: 1,
      unit_price: 0,
      order: items.length,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleChange = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "description") {
      item.description = value as string;
    } else if (field === "quantity") {
      item.quantity = Number(value);
    } else if (field === "unit_price") {
      item.unit_price = Number(value);
    } else if (field === "order") {
      item.order = Number(value);
    }

    newItems[index] = item;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Quantity</TableHead>
              <TableHead className="w-[20%] text-right">Unit Price</TableHead>
              <TableHead className="w-[20%] text-right">Total</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="text-right"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="text-right"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleChange(index, "unit_price", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(
                    (item.quantity || 0) * (item.unit_price || 0)
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: currency,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddItem}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}
