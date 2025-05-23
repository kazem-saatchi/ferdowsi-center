import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
}

export function CustomSelect({
  options,
  value,
  onChange,
  label,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.id);
    setOpen(false);
  };

  const selectedOption = options.find((option) => option.id === value);

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-left font-normal"
        type="button"
      >
        {selectedOption ? selectedOption.label : `${label}`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader className="h-4">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <Input
            placeholder={`${labels.search}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {filteredOptions.map((option) => (
              <Button
                key={option.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(option)}
                type="button"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
