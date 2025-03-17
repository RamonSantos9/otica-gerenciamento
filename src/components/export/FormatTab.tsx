
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface IncludeFields {
  customerName: boolean;
  date: boolean;
  paymentMethod: boolean;
  status: boolean;
  total: boolean;
}

interface FormatTabProps {
  documentTitle: string;
  setDocumentTitle: React.Dispatch<React.SetStateAction<string>>;
  paperSize: string;
  setPaperSize: React.Dispatch<React.SetStateAction<string>>;
  orientation: string;
  setOrientation: React.Dispatch<React.SetStateAction<string>>;
  includeFields: IncludeFields;
  setIncludeFields: React.Dispatch<React.SetStateAction<IncludeFields>>;
  headerText: string;
  setHeaderText: React.Dispatch<React.SetStateAction<string>>;
  footerText: string;
  setFooterText: React.Dispatch<React.SetStateAction<string>>;
}

export function FormatTab({
  documentTitle,
  setDocumentTitle,
  paperSize,
  setPaperSize,
  orientation,
  setOrientation,
  includeFields,
  setIncludeFields,
  headerText,
  setHeaderText,
  footerText,
  setFooterText
}: FormatTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Título do documento</Label>
          <Input 
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Relatório de Vendas"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tamanho do papel</Label>
          <Select value={paperSize} onValueChange={setPaperSize}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Carta</SelectItem>
              <SelectItem value="legal">Ofício</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Orientação</Label>
        <RadioGroup value={orientation} onValueChange={setOrientation} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="portrait" id="portrait" />
            <Label htmlFor="portrait">Retrato</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="landscape" id="landscape" />
            <Label htmlFor="landscape">Paisagem</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label>Campos a incluir</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="customerName" 
              checked={includeFields.customerName}
              onCheckedChange={(checked) => 
                setIncludeFields(prev => ({ ...prev, customerName: checked === true }))
              }
            />
            <Label htmlFor="customerName">Nome do cliente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="date" 
              checked={includeFields.date}
              onCheckedChange={(checked) => 
                setIncludeFields(prev => ({ ...prev, date: checked === true }))
              }
            />
            <Label htmlFor="date">Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="paymentMethod" 
              checked={includeFields.paymentMethod}
              onCheckedChange={(checked) => 
                setIncludeFields(prev => ({ ...prev, paymentMethod: checked === true }))
              }
            />
            <Label htmlFor="paymentMethod">Método de pagamento</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="status" 
              checked={includeFields.status}
              onCheckedChange={(checked) => 
                setIncludeFields(prev => ({ ...prev, status: checked === true }))
              }
            />
            <Label htmlFor="status">Status</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="total" 
              checked={includeFields.total}
              onCheckedChange={(checked) => 
                setIncludeFields(prev => ({ ...prev, total: checked === true }))
              }
            />
            <Label htmlFor="total">Valor total</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Texto do cabeçalho</Label>
        <Input 
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          placeholder="Relatório de Vendas - Ótica"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Texto do rodapé</Label>
        <Input 
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="Gerado em {{date}}"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {'{{date}}'} para inserir a data atual
        </p>
      </div>
    </div>
  );
}
