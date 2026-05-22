import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { fetchBuildings, fetchCategories, type SortKey } from "@/lib/reports";

export type FilterState = {
  q: string;
  building: string | undefined;
  category: string | undefined;
  sort: SortKey;
  dir: "asc" | "desc";
};

export function FilterBar({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const { data: buildings } = useQuery({ queryKey: ["buildings"], queryFn: fetchBuildings });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="Search for a report…"
          className="pl-9 h-11 bg-white/5 border-border"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 gap-2 bg-white/5 border-border">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Building</Label>
            <Select value={value.building ?? "__all"} onValueChange={(v) => onChange({ ...value, building: v === "__all" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="All buildings" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All buildings</SelectItem>
                {buildings?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={value.category ?? "__all"} onValueChange={(v) => onChange({ ...value, category: v === "__all" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All categories</SelectItem>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      <Select value={value.sort} onValueChange={(v) => onChange({ ...value, sort: v as SortKey })}>
        <SelectTrigger className="h-11 w-[150px] bg-white/5 border-border"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Created</SelectItem>
          <SelectItem value="updated_at">Updated</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="votes">Votes</SelectItem>
          <SelectItem value="comments">Comments</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="h-11 bg-white/5 border-border"
        onClick={() => onChange({ ...value, dir: value.dir === "asc" ? "desc" : "asc" })}>
        <ArrowUpDown className="h-4 w-4" />
        <span className="ml-1 text-xs">{value.dir === "asc" ? "Asc" : "Desc"}</span>
      </Button>
    </div>
  );
}
