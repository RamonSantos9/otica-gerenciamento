
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PeriodTabProps {
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
  selectedPeriod: string;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<string>>;
  selectedMonth: string;
  setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
  calendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PeriodTab({
  dateRange,
  setDateRange,
  selectedPeriod,
  setSelectedPeriod,
  selectedMonth,
  setSelectedMonth,
  calendarOpen,
  setCalendarOpen
}: PeriodTabProps) {
  // Função para aplicar período predefinido
  const handlePredefinedPeriod = (period: string) => {
    setSelectedPeriod(period);
    const today = new Date();
    let fromDate = new Date();
    
    switch (period) {
      case "7days":
        fromDate.setDate(today.getDate() - 7);
        break;
      case "15days":
        fromDate.setDate(today.getDate() - 15);
        break;
      case "30days":
        fromDate.setDate(today.getDate() - 30);
        break;
      case "90days":
        fromDate.setDate(today.getDate() - 90);
        break;
      case "custom":
        // Não faz nada, mantém as datas atuais
        return;
    }
    
    setDateRange({ from: fromDate, to: today });
  };

  // Função para definir mês
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setSelectedPeriod("month");
    
    const [year, month] = value.split("-").map(Number);
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0); // Último dia do mês
    
    setDateRange({ from: fromDate, to: toDate });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Períodos pré-definidos</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            type="button" 
            variant={selectedPeriod === "7days" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePredefinedPeriod("7days")}
          >
            7 dias
          </Button>
          <Button 
            type="button" 
            variant={selectedPeriod === "15days" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePredefinedPeriod("15days")}
          >
            15 dias
          </Button>
          <Button 
            type="button" 
            variant={selectedPeriod === "30days" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePredefinedPeriod("30days")}
          >
            30 dias
          </Button>
          <Button 
            type="button" 
            variant={selectedPeriod === "90days" ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePredefinedPeriod("90days")}
          >
            90 dias
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Selecionar mês</Label>
        <Input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)} 
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Período personalizado</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from) {
                  setDateRange({ 
                    from: range.from, 
                    to: range.to || range.from // If to is undefined, use from
                  });
                  if (range.from && range.to) {
                    setSelectedPeriod("custom");
                  }
                }
              }}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
