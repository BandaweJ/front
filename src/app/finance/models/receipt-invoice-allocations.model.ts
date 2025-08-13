import { InvoiceModel } from './invoice.model';

export interface ReceiptInvoiceAllocationsModel {
  id: number;
  receiptId: number;
  invoice: InvoiceModel;
  amountApplied: number;
  allocationDate: Date;
}
