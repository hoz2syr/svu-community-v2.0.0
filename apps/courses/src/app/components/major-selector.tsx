import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type MajorSelectorProps = {
  majors: string[];
  selectedMajor: string;
  onSelectMajor: (major: string) => void;
};

export function MajorSelector({ majors, selectedMajor, onSelectMajor }: MajorSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-slate-300 text-lg">التخصص:</label>
      <Select value={selectedMajor} onValueChange={onSelectMajor}>
        <SelectTrigger className="w-[280px] bg-slate-800/50 backdrop-blur-xl border-white/10 text-white rounded-xl h-12 px-4 hover:bg-slate-800/70 transition-all">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 backdrop-blur-xl border-white/10 text-white rounded-xl">
          {majors.map((major) => (
            <SelectItem 
              key={major} 
              value={major}
              className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
            >
              {major}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
