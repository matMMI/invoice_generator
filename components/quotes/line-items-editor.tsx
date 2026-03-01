// components/quotes/line-items-editor.tsx
"use client";
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
import { Textarea } from "@/components/ui/textarea";
import { QuoteItem } from "@/lib/api/quotes";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
type ItemError = Merge<
  FieldError,
  FieldErrorsImpl<{
    description: FieldError;
    quantity: FieldError;
    unit_price: FieldError;
  }>
>;

interface LineItemsEditorProps {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
  currency: string;
  itemErrors?: (ItemError | undefined)[];
}

export function LineItemsEditor({
  items,
  onChange,
  currency,
  itemErrors,
}: LineItemsEditorProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    () =>
      new Set(
        items
          .map((item, i) => (item.detailed_description != null ? i : -1))
          .filter((i) => i !== -1)
      )
  );

  const toggleDetailedDescription = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

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
    setExpandedRows((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
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
    } else if (field === "detailed_description") {
      item.detailed_description = value as string;
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Libellé</TableHead>
              <TableHead className="w-[15%] text-right">Quantité</TableHead>
              <TableHead className="w-[20%] text-right">
                Prix unitaire
              </TableHead>
              <TableHead className="w-[20%] text-right">Total</TableHead>
              <TableHead className="w-[5%]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => {
              const rowError = itemErrors?.[index];
              const isExpanded = expandedRows.has(index);

              return (
                <React.Fragment key={index}>
                  <TableRow
                    className={
                      rowError ? "bg-red-50/50 dark:bg-red-950/10" : ""
                    }
                  >
                    {/* Description */}
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleChange(index, "description", e.target.value)
                          }
                          placeholder="Libellé de l'article"
                          className={
                            rowError?.description ? "border-red-500" : ""
                          }
                        />
                        {rowError?.description?.message && (
                          <p className="text-xs text-red-500">
                            {String(rowError.description.message)}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Quantité */}
                    <TableCell className="text-right">
                      <div className="relative flex items-center">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className={`text-right pr-7 ${
                            rowError?.quantity ? "border-red-500" : ""
                          }`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "quantity",
                              Math.round(Number(e.target.value)) || 0
                            )
                          }
                        />
                        <div className="absolute right-0 inset-y-0 flex flex-col border-l border-border w-6">
                          <button
                            type="button"
                            tabIndex={-1}
                            className="flex-1 flex items-center justify-center hover:bg-accent rounded-tr-md transition-colors"
                            onClick={() =>
                              handleChange(index, "quantity", item.quantity + 1)
                            }
                          >
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <div className="border-t border-border" />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="flex-1 flex items-center justify-center hover:bg-accent rounded-br-md transition-colors"
                            onClick={() =>
                              handleChange(
                                index,
                                "quantity",
                                Math.max(0, item.quantity - 1)
                              )
                            }
                          >
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Prix unitaire */}
                    <TableCell className="text-right">
                      <div className="relative flex items-center">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className={`text-right pr-7 ${
                            rowError?.unit_price ? "border-red-500" : ""
                          }`}
                          value={item.unit_price}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unit_price",
                              Math.round(Number(e.target.value)) || 0
                            )
                          }
                        />
                        <div className="absolute right-0 inset-y-0 flex flex-col border-l border-border w-6">
                          <button
                            type="button"
                            tabIndex={-1}
                            className="flex-1 flex items-center justify-center hover:bg-accent rounded-tr-md transition-colors"
                            onClick={() =>
                              handleChange(
                                index,
                                "unit_price",
                                item.unit_price + 1
                              )
                            }
                          >
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <div className="border-t border-border" />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="flex-1 flex items-center justify-center hover:bg-accent rounded-br-md transition-colors"
                            onClick={() =>
                              handleChange(
                                index,
                                "unit_price",
                                Math.max(0, item.unit_price - 1)
                              )
                            }
                          >
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="text-right font-medium">
                      {(
                        (item.quantity || 0) * (item.unit_price || 0)
                      ).toLocaleString("fr-FR", {
                        style: "currency",
                        currency,
                      })}
                    </TableCell>

                    {/* Suppression */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Ligne description détaillée */}
                  <TableRow>
                    <TableCell colSpan={5} className="p-3">
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleDetailedDescription(index)}
                        >
                          {isExpanded
                            ? "Masquer la description détaillée"
                            : "Ajouter / modifier la description détaillée"}
                        </Button>

                        {isExpanded && (
                          <>
                            <Textarea
                              value={item.detailed_description ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "detailed_description",
                                  e.target.value
                                )
                              }
                              placeholder="Description détaillée (Markdown supporté)..."
                              className="min-h-[100px] resize-y"
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                              Support Markdown : **gras**, *italique*, listes,
                              liens...
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
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
        Ajouter une ligne
      </Button>
    </div>
  );
}
