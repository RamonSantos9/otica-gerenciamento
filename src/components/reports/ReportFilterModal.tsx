
import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ReportFilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    thisMonth: boolean;
    lastMonth: boolean;
    thisYear: boolean;
  };
  setFilters: (filters: {
    thisMonth: boolean;
    lastMonth: boolean;
    thisYear: boolean;
  }) => void;
  dateFilter: {
    start: string;
    end: string;
  };
  setDateFilter: (dateFilter: {
    start: string;
    end: string;
  }) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export const ReportFilterModal: React.FC<ReportFilterModalProps> = ({
  isOpen,
  onOpenChange,
  filters,
  setFilters,
  dateFilter,
  setDateFilter,
  applyFilters,
  resetFilters
}) => {
  // Handler for start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter({
      start: e.target.value,
      end: dateFilter.end
    });
  };

  // Handler for end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter({
      start: dateFilter.start,
      end: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar relatórios</DialogTitle>
          <DialogDescription>
            Selecione os filtros para refinar sua pesquisa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Período pré-definido</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="thisMonth" 
                  checked={filters.thisMonth} 
                  onCheckedChange={(checked) => {
                    setFilters({
                      thisMonth: !!checked,
                      lastMonth: false,
                      thisYear: false
                    });
                  }}
                />
                <label 
                  htmlFor="thisMonth"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mês atual
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lastMonth" 
                  checked={filters.lastMonth} 
                  onCheckedChange={(checked) => {
                    setFilters({
                      thisMonth: false,
                      lastMonth: !!checked,
                      thisYear: false
                    });
                  }}
                />
                <label 
                  htmlFor="lastMonth"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mês anterior
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="thisYear" 
                  checked={filters.thisYear} 
                  onCheckedChange={(checked) => {
                    setFilters({
                      thisMonth: false,
                      lastMonth: false,
                      thisYear: !!checked
                    });
                  }}
                />
                <label 
                  htmlFor="thisYear"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ano atual
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Período personalizado</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">De</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.start}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">Até</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.end}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={applyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

