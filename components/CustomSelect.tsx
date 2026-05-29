"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { labels } from "@/utils/label";

interface SelectOption {
  id: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  /**
   * Radix Popover portals to document.body by default; inside a modal Dialog that breaks dismiss,
   * focus and pointer layering. Inline mode renders the panel in-flow (no Portal).
   */
  inline?: boolean;
}

function OptionsList(props: {
  filteredOptions: SelectOption[];
  onSelect: (option: SelectOption) => void;
}) {
  const { filteredOptions, onSelect } = props;
  return (
    <div className="no-scrollbar mt-3 max-h-[min(400px,50vh)] overflow-y-auto">
      {filteredOptions.map((option) => (
        <Button
          key={option.id}
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onSelect(option)}
          type="button"
        >
          {option.label}
        </Button>
      ))}
      {filteredOptions.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {labels.noInformationFound}
        </p>
      )}
    </div>
  );
}

export function CustomSelect({
  options,
  value,
  onChange,
  label,
  disabled = false,
  inline = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, options]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.id);
    setOpen(false);
    setSearch("");
  };

  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    if (!inline || !open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const node = e.target;
      if (!root || !(node instanceof Node) || root.contains(node)) return;
      setOpen(false);
      setSearch("");
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [inline, open]);

  useEffect(() => {
    if (!inline || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only consume the event when the dropdown is open so the parent Dialog
        // still receives a subsequent Escape to close itself.
        e.preventDefault();
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [inline, open]);

  if (inline) {
    return (
      <div ref={rootRef} className="relative w-full space-y-0">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => {
            if (disabled) return;
            handleOpenChange(!open);
          }}
        >
          {selectedOption ? selectedOption.label : `${label}`}
        </Button>
        {open && (
          <div
            dir="rtl"
            className="fade-in animate-in zoom-in-95 mt-2 w-full min-w-0 max-w-[425px] rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none"
          >
            <Input
              placeholder={`${labels.search}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <OptionsList
              filteredOptions={filteredOptions}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          type="button"
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : `${label}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        dir="rtl"
        align="start"
        className="z-[110] w-[min(100vw-2rem,var(--radix-popover-trigger-width,24rem))] max-w-[425px] p-3 sm:w-auto"
      >
        <Input
          placeholder={`${labels.search}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus={open}
        />
        <OptionsList
          filteredOptions={filteredOptions}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
