import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "../utils/utils";
import brain from "brain";

interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface Props {
  onSelect: (voice: Voice) => void;
  selectedVoiceId?: string;
  className?: string;
}

export const VoiceSelector: React.FC<Props> = ({
  onSelect,
  selectedVoiceId,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const response = await brain.list_voices();
        const data = await response.json();
        setVoices(data.voices);
      } catch (err) {
        console.error("Failed to fetch voices:", err);
        setError("Failed to load voices. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const selectedVoice = voices.find((voice) => voice.voice_id === selectedVoiceId);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
            disabled={loading}
          >
            {loading ? (
              "Loading voices..."
            ) : selectedVoice ? (
              <div className="flex flex-col items-start">
                <span>{selectedVoice.name}</span>
                {selectedVoice.category && (
                  <span className="text-xs text-gray-400">{selectedVoice.category}</span>
                )}
              </div>
            ) : (
              "Select a voice"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-900 border-gray-800">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search voices..." className="h-9 text-gray-200" />
            <CommandEmpty className="py-6 text-center text-gray-400">
              {error || "No voices found."}
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {voices.map((voice) => (
                <CommandItem
                  key={voice.voice_id}
                  onSelect={() => {
                    onSelect(voice);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start py-2 px-3 cursor-pointer hover:bg-gray-800",
                    selectedVoiceId === voice.voice_id && "bg-gray-800"
                  )}
                >
                  <div className="flex w-full justify-between items-center">
                    <div>
                      <span className="text-gray-200">{voice.name}</span>
                      {voice.category && (
                        <p className="text-xs text-gray-400">{voice.category}</p>
                      )}
                    </div>
                    {selectedVoiceId === voice.voice_id && (
                      <Check className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  {voice.description && (
                    <p className="text-xs text-gray-400 mt-1">{voice.description}</p>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
