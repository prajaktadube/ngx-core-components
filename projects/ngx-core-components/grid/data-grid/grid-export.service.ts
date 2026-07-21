import { Injectable } from '@angular/core';
import { GridColumnDef, GridGroupState } from './models';

/**
 * Standalone injectable service for exporting grid data to JSON, CSV, and Excel formats.
 * Extracted from DataGridComponent to enable reuse and reduce component size.
 */
@Injectable({ providedIn: 'root' })
export class GridExportService {

  /**
   * Export data as a JSON file download.
   */
  exportToJson<T>(data: T[], filename = 'grid-data.json'): void {
    if (data.length === 0 || typeof window === 'undefined' || typeof document === 'undefined') return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    this.triggerDownload(dataStr, filename);
  }

  /**
   * Export data as a CSV file download.
   */
  exportToCsv<T extends object>(
    data: T[],
    columns: GridColumnDef<T>[],
    filename = 'grid-data.csv',
    groupBy?: GridGroupState | null
  ): void {
    if (data.length === 0 || typeof window === 'undefined' || typeof document === 'undefined') return;
    const headers = columns.map(c => c.title);
    const fields = columns.map(c => c.field);
    const lines: string[] = [headers.join(',')];

    if (groupBy) {
      const field = groupBy.field;
      const groupsMap = new Map<string, T[]>();
      data.forEach(row => {
        const val = (row as Record<string, unknown>)[field] ?? '';
        const key = String(val === '' || val == null ? '(Blank)' : val);
        const groupItems = groupsMap.get(key) || [];
        groupItems.push(row);
        groupsMap.set(key, groupItems);
      });

      groupsMap.forEach((items, key) => {
        lines.push(`"${groupBy.field.toUpperCase()}: ${key} (${items.length} items)"` + ','.repeat(columns.length - 1));
        items.forEach(row => {
          const r = row as Record<string, unknown>;
          const rowVals = fields.map(f => {
            const val = r[f] ?? '';
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${valStr.replace(/"/g, '""')}"`;
          });
          lines.push(rowVals.join(','));
        });
      });
    } else {
      const rows = data.map(row => {
        const r = row as Record<string, unknown>;
        return fields.map(field => {
          const val = r[field] ?? '';
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${valStr.replace(/"/g, '""')}"`;
        });
      });
      lines.push(...rows.map(e => e.join(',')));
    }

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, filename);
  }

  /**
   * Export data as an Excel (.xls) file download using an HTML table template.
   */
  exportToExcel<T extends object>(
    data: T[],
    columns: GridColumnDef<T>[],
    filename = 'grid-data.xls',
    groupBy?: GridGroupState | null
  ): void {
    if (data.length === 0 || typeof window === 'undefined' || typeof document === 'undefined') return;

    let tableHtml = '<table><thead><tr>';
    columns.forEach(c => {
      tableHtml += `<th>${c.title}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    if (groupBy) {
      const field = groupBy.field;
      const groupsMap = new Map<string, T[]>();
      data.forEach(row => {
        const val = (row as Record<string, unknown>)[field] ?? '';
        const key = String(val === '' || val == null ? '(Blank)' : val);
        const groupItems = groupsMap.get(key) || [];
        groupItems.push(row);
        groupsMap.set(key, groupItems);
      });

      groupsMap.forEach((items, key) => {
        tableHtml += `
          <tr class="group-header">
            <td colspan="${columns.length}" style="background-color: #e2e8f0; font-weight: 700; color: #1e293b; border: 1px solid #cbd5e1; padding: 6px;">
              ${groupBy.field.toUpperCase()}: ${key} (${items.length} items)
            </td>
          </tr>
        `;
        items.forEach(row => {
          const r = row as Record<string, unknown>;
          tableHtml += '<tr>';
          columns.forEach(c => {
            const val = r[c.field] ?? '';
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            const alignClass = c.align ? ` class="text-${c.align}"` : '';
            const indentStyle = c === columns[0] ? ' style="padding-left: 20px;"' : '';
            tableHtml += `<td${alignClass}${indentStyle}>${valStr}</td>`;
          });
          tableHtml += '</tr>';
        });
      });
    } else {
      data.forEach(row => {
        const r = row as Record<string, unknown>;
        tableHtml += '<tr>';
        columns.forEach(c => {
          const val = r[c.field] ?? '';
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          const alignClass = c.align ? ` class="text-${c.align}"` : '';
          tableHtml += `<td${alignClass}>${valStr}</td>`;
        });
        tableHtml += '</tr>';
      });
    }
    tableHtml += '</tbody></table>';

    const worksheetName = 'Grid Export';
    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <!--[if gte mso 9]>
      <xml>
       <x:ExcelWorkbook>
        <x:ExcelWorksheets>
         <x:ExcelWorksheet>
          <x:Name>${worksheetName}</x:Name>
          <x:WorksheetOptions>
           <x:DisplayGridlines/>
          </x:WorksheetOptions>
         </x:ExcelWorksheet>
        </x:ExcelWorksheets>
       </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: sans-serif; font-size: 11pt; }
        th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px; }
        td { border: 1px solid #cbd5e1; padding: 6px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
      </style>
      </head>
      <body>
      ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, filename);
  }

  exportToPdf<T extends object>(
    data: T[],
    columns: GridColumnDef<T>[],
    title = 'Data Grid Export',
    groupBy?: GridGroupState | null
  ): void {
    if (data.length === 0 || typeof window === 'undefined' || typeof document === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented printing. Please allow pop-ups for this site.');
      return;
    }

    let tableHtml = '<table><thead><tr>';
    columns.forEach(c => {
      tableHtml += `<th>${c.title}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    if (groupBy) {
      const field = groupBy.field;
      const groupsMap = new Map<string, T[]>();
      data.forEach(row => {
        const val = (row as Record<string, unknown>)[field] ?? '';
        const key = String(val === '' || val == null ? '(Blank)' : val);
        const groupItems = groupsMap.get(key) || [];
        groupItems.push(row);
        groupsMap.set(key, groupItems);
      });

      groupsMap.forEach((items, key) => {
        tableHtml += `
          <tr class="group-header">
            <td colspan="${columns.length}" style="background-color: #f1f5f9; font-weight: bold; color: #1e293b; border: 1px solid #cbd5e1; padding: 10px 8px;">
              ${groupBy.field.toUpperCase()}: ${key} (${items.length} items)
            </td>
          </tr>
        `;
        items.forEach(row => {
          const r = row as Record<string, unknown>;
          tableHtml += '<tr>';
          columns.forEach(c => {
            const val = r[c.field] ?? '';
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            const alignClass = c.align ? ` class="text-${c.align}"` : '';
            const indentStyle = c === columns[0] ? ' style="padding-left: 24px;"' : '';
            tableHtml += `<td${alignClass}${indentStyle}>${valStr}</td>`;
          });
          tableHtml += '</tr>';
        });
      });
    } else {
      data.forEach(row => {
        const r = row as Record<string, unknown>;
        tableHtml += '<tr>';
        columns.forEach(c => {
          const val = r[c.field] ?? '';
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          const alignClass = c.align ? ` class="text-${c.align}"` : '';
          tableHtml += `<td${alignClass}>${valStr}</td>`;
        });
        tableHtml += '</tr>';
      });
    }
    tableHtml += '</tbody></table>';

    const printTemplate = `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10pt; }
          th { background-color: #f8fafc; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; color: #334155; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="date">${new Date().toLocaleString()}</div>
        </div>
        ${tableHtml}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printTemplate);
    printWindow.document.close();
  }

  /**
   * Create a temporary anchor element, trigger a download, and clean up.
   */
  private triggerDownload(href: string, filename: string): void {
    if (typeof document === 'undefined') return;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', href);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
