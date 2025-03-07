import React from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VoiceSettingsProps {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  speed: number;
  onStabilityChange: (value: number) => void;
  onSimilarityBoostChange: (value: number) => void;
  onStyleChange: (value: number) => void;
  onSpeakerBoostChange: (value: boolean) => void;
  onSpeedChange: (value: number) => void;
  className?: string;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  stability,
  similarityBoost,
  style,
  useSpeakerBoost,
  speed,
  onStabilityChange,
  onSimilarityBoostChange,
  onStyleChange,
  onSpeakerBoostChange,
  onSpeedChange,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="stability" className="text-gray-300">
              Stability: {stability.toFixed(2)}
            </Label>
            <span className="text-xs text-gray-400">Consistency of voice</span>
          </div>
          <Slider
            id="stability"
            min={0}
            max={1}
            step={0.01}
            value={[stability]}
            onValueChange={(value) => onStabilityChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Creative</span>
            <span>Stable</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="similarity" className="text-gray-300">
              Clarity & Similarity: {similarityBoost.toFixed(2)}
            </Label>
            <span className="text-xs text-gray-400">Voice similarity</span>
          </div>
          <Slider
            id="similarity"
            min={0}
            max={1}
            step={0.01}
            value={[similarityBoost]}
            onValueChange={(value) => onSimilarityBoostChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Natural</span>
            <span>Clear</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="style" className="text-gray-300">
              Style Exaggeration: {style.toFixed(2)}
            </Label>
            <span className="text-xs text-gray-400">Expressiveness</span>
          </div>
          <Slider
            id="style"
            min={0}
            max={1}
            step={0.01}
            value={[style]}
            onValueChange={(value) => onStyleChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Natural</span>
            <span>Expressive</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="speed" className="text-gray-300">
              Speed: {speed.toFixed(2)}x
            </Label>
            <span className="text-xs text-gray-400">Playback rate</span>
          </div>
          <Slider
            id="speed"
            min={0.5}
            max={2.0}
            step={0.01}
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <Label htmlFor="speaker-boost" className="text-gray-300">
              Speaker Clarity Boost
            </Label>
            <p className="text-xs text-gray-400">Enhance the speaker's voice clarity</p>
          </div>
          <Switch
            id="speaker-boost"
            checked={useSpeakerBoost}
            onCheckedChange={onSpeakerBoostChange}
          />
        </div>
      </div>
    </div>
  );
};
