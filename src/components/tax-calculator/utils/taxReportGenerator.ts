/**
 * Finance Brunch - Tax Report Generation Utility
 * Generates isolated Print, client-side PDF (jsPDF), and Word (.docx) documents,
 * embedding the official Finance Brunch logo in the top-right corner of each format.
 */

import { GState, jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import { TaxBreakdown, TaxRegime, FinancialYear, DeductionsType } from './taxTypes';
import { TaxpayerType } from '../TaxpayerTypeSelector';
import { CountryCode, StateCode } from '../CountrySelector';
import {
  FINANCE_BRUNCH_LOGO_RAW,
  FINANCE_BRUNCH_LOGO_DATA_URL,
  LOGO_ASPECT_RATIO,
  FINANCE_BRUNCH_WATERMARK_DATA_URL,
} from './reportLogo';
import { registerReportFonts } from './reportFont';
import {
  drawPdfBackgroundWatermark,
  getDocxWatermarkHeader,
} from '@/utils/reportWatermark';

export const TAX_CALCULATOR_DISCLAIMER_TEXT =
  'This report provides an indicative estimate based on the information entered and the tax rules applicable to the selected financial year. It is intended for informational and planning purposes only and does not constitute professional tax, legal, or financial advice. Actual tax liability may vary depending on individual circumstances, eligible deductions, applicable legislation, and subsequent regulatory changes. For an accurate assessment of your tax position, please consult an independent qualified Chartered Accountant or other appropriately qualified tax professional.';

export interface TaxReportData {
  income: number;
  regime: TaxRegime;
  age: string;
  deductions: DeductionsType;
  financialYear: FinancialYear;
  assessmentYear: string;
  taxpayerType: TaxpayerType;
  country: CountryCode;
  state?: StateCode;
  taxResult: TaxBreakdown;
  regimeComparison?: {
    newRegime: TaxBreakdown;
    oldRegime: TaxBreakdown;
    difference: number;
    betterRegime: 'new' | 'old';
  } | null;
  generatedDateStr: string;
}

export function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatReportCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || !isFinite(amount)) return `${symbol}0`;
  const rounded = Math.round(amount);
  if (rounded < 0) {
    return `-${symbol}${Math.abs(rounded).toLocaleString('en-IN')}`;
  }
  return `${symbol}${rounded.toLocaleString('en-IN')}`;
}

export function formatReportPercent(rate: number): string {
  if (isNaN(rate) || !isFinite(rate)) return '0.00%';
  return `${rate.toFixed(2)}%`;
}

export function formatReportNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

export function getAssessmentYear(fy: FinancialYear): string {
  if (fy === '2024-2025') return 'AY 2025-2026';
  if (fy === '2025-2026') return 'AY 2026-2027';
  const parts = String(fy).split('-');
  if (parts.length === 2) {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    if (!isNaN(start) && !isNaN(end)) {
      return `AY ${start + 1}-${end + 1}`;
    }
  }
  return `AY ${fy}`;
}

export function getTaxpayerLabel(type: TaxpayerType): string {
  switch (type) {
    case 'individual':
      return 'Individual';
    case 'nri':
      return 'Non-Resident Indian (NRI)';
    case 'professional':
      return 'Professional/Freelancer';
    case 'startup':
      return 'Startup';
    default:
      return 'Individual';
  }
}

export function getAgeLabel(age: string): string {
  switch (age) {
    case 'below60':
      return 'Below 60 years (Individual)';
    case '60to80':
      return '60 to 80 years (Senior Citizen)';
    case 'above80':
      return 'Above 80 years (Super Senior Citizen)';
    default:
      return 'Below 60 years';
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * 1. PRINT ACTION
 * Opens a dedicated, clean print window or printable layout.
 * Ensures NO navbar, buttons, or page clutter is printed.
 * Features official Finance Brunch logo in the top-right corner.
 */
export function printTaxReport(data: TaxReportData) {
  const totalDeductions = Object.values(data.deductions || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const currency = data.taxResult.currencySymbol || '₹';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Income Tax Calculation Report - Finance Brunch</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
      font-size: 13px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0284c7;
      margin-bottom: 4px;
    }
    .report-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .report-meta {
      font-size: 12px;
      color: #64748b;
    }
    .logo-container {
      text-align: right;
    }
    .logo-img {
      max-width: 170px;
      height: auto;
      object-fit: contain;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 12.5px;
    }
    .info-label {
      color: #64748b;
    }
    .info-val {
      font-weight: 600;
      color: #0f172a;
    }
    .highlight-val {
      font-weight: 700;
      color: #0284c7;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 12.5px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
    }
    table.data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
    }
    table.data-table td.num {
      text-align: right;
      font-family: monospace, sans-serif;
      font-weight: 600;
    }
    .total-row {
      background: #eff6ff;
      font-weight: 700;
    }
    .comparison-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 14px;
    }
    .comparison-title {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      margin-bottom: 6px;
    }
    .disclaimer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.4;
    }
    .watermark-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 440px;
      max-width: 75%;
      opacity: 0.085;
      pointer-events: none;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .watermark-img {
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }
    .report-content {
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="watermark-overlay" aria-hidden="true">
    <img src="${FINANCE_BRUNCH_WATERMARK_DATA_URL}" alt="Finance Brunch" class="watermark-img" />
  </div>
  <div class="report-content">
  <div class="header-row">
    <div>
      <div class="brand-title">Finance Brunch Advisory Services</div>
      <h1 class="report-title">Income Tax Calculation Report</h1>
      <div class="report-meta">
        Financial Year: <strong>${data.financialYear}</strong> &bull; Assessment Year: <strong>${data.assessmentYear}</strong> &bull; Generated: ${data.generatedDateStr}
      </div>
    </div>
    <div class="logo-container">
      <img src="${FINANCE_BRUNCH_LOGO_DATA_URL}" alt="Finance Brunch" class="logo-img" />
    </div>
  </div>

  <div class="grid-2">
    <div class="info-card">
      <div class="card-title">Taxpayer & Assessment Profile</div>
      <div class="info-row">
        <span class="info-label">Taxpayer Type:</span>
        <span class="info-val">${getTaxpayerLabel(data.taxpayerType)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Country / Jurisdiction:</span>
        <span class="info-val">${data.country.toUpperCase()}${data.state && data.state !== 'default' ? ` - ${data.state.toUpperCase()}` : ''}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Age Category:</span>
        <span class="info-val">${getAgeLabel(data.age)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Chosen Regime:</span>
        <span class="info-val">${data.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
      </div>
    </div>

    <div class="info-card">
      <div class="card-title">Income & Tax Liability Summary</div>
      <div class="info-row">
        <span class="info-label">Gross Annual Income:</span>
        <span class="info-val">${currency}${data.income.toLocaleString('en-IN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Deductions Claimed:</span>
        <span class="info-val">${currency}${totalDeductions.toLocaleString('en-IN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Taxable Net Income:</span>
        <span class="info-val">${currency}${data.taxResult.taxableIncome.toLocaleString('en-IN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Tax Liability:</span>
        <span class="info-val highlight-val">${currency}${data.taxResult.totalTaxLiability.toLocaleString('en-IN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Effective Tax Rate:</span>
        <span class="info-val highlight-val">${data.taxResult.effectiveTaxRate.toFixed(2)}%</span>
      </div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Tax Component</th>
        <th style="text-align: right;">Rate / Specification</th>
        <th style="text-align: right;">Amount (${currency})</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Base Income Tax (Before Cess)</td>
        <td class="num">As per statutory slabs</td>
        <td class="num">${data.taxResult.taxBeforeCess.toLocaleString('en-IN')}</td>
      </tr>
      ${data.taxResult.rebate && data.taxResult.rebate > 0 ? `
      <tr style="color: #166534;">
        <td>Section 87A Tax Rebate</td>
        <td class="num">Rebate benefit</td>
        <td class="num">-${data.taxResult.rebate.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      ${data.taxResult.surcharge && data.taxResult.surcharge > 0 ? `
      <tr>
        <td>Surcharge</td>
        <td class="num">Applicable surcharge</td>
        <td class="num">${data.taxResult.surcharge.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      ${data.country === 'india' && data.taxResult.cessAmount > 0 ? `
      <tr>
        <td>Health & Education Cess</td>
        <td class="num">4%</td>
        <td class="num">${data.taxResult.cessAmount.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      ${data.taxResult.stateTax && data.taxResult.stateTax > 0 ? `
      <tr>
        <td>State / Provincial Tax</td>
        <td class="num">State slab</td>
        <td class="num">${data.taxResult.stateTax.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      <tr class="total-row">
        <td>Total Tax Payable</td>
        <td class="num">Effective: ${data.taxResult.effectiveTaxRate.toFixed(2)}%</td>
        <td class="num">${currency}${data.taxResult.totalTaxLiability.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  ${data.regimeComparison ? `
  <div class="comparison-box">
    <div class="comparison-title">Old vs New Tax Regime Comparison</div>
    <div class="info-row">
      <span class="info-label">Tax under New Regime:</span>
      <span class="info-val">${currency}${data.regimeComparison.newRegime.totalTaxLiability.toLocaleString('en-IN')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Tax under Old Regime:</span>
      <span class="info-val">${currency}${data.regimeComparison.oldRegime.totalTaxLiability.toLocaleString('en-IN')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Better Choice for You:</span>
      <span class="info-val" style="color: #15803d; font-weight: 700;">
        ${data.regimeComparison.betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'} 
        (Saves ${currency}${data.regimeComparison.difference.toLocaleString('en-IN')})
      </span>
    </div>
  </div>` : ''}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> ${TAX_CALCULATOR_DISCLAIMER_TEXT}
  </div>

  <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
    <strong style="color: #0f172a; font-size: 12px;">Finance Brunch</strong>
    <span>Email: admin@financebrunch.in &nbsp;|&nbsp; Phone: +91 7842-494-981 &nbsp;|&nbsp; Website: https://financebrunch.in</span>
  </div>
  </div>
</body>
</html>`;

  // Use a clean hidden iframe to prevent popup-blocker issues and guarantee ONLY the report prints
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    // Fallback: window.open
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);
}

/**
 * 2. DOWNLOAD AS PDF
 * Generates an actual, readable .pdf file using jsPDF with the Finance Brunch logo
 * embedded in the top-right corner, correct Indian currency formatting, and clean tables.
 */
export async function downloadTaxReportPdf(data: TaxReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Register TrueType Unicode fonts for native rupee symbol (₹) and proper kerning
  registerReportFonts(doc);

  const currency = data.taxResult.currencySymbol || '₹';
  const pageWidth = 210;
  const margin = 14;
  const pageHeight = 297;
  const contentWidth = pageWidth - 2 * margin;

  // Helper: Draw subtle, isolated background watermark using centralized utility
  const drawBackgroundWatermark = () => {
    drawPdfBackgroundWatermark(doc, pageWidth, pageHeight);
  };

  // 1. Draw background watermark first so it sits strictly behind all content
  drawBackgroundWatermark();

  // 2. Top-Right Logo: width 42mm, height = 42 / LOGO_ASPECT_RATIO (~13.2mm)
  const logoWidth = 42;
  const logoHeight = logoWidth / LOGO_ASPECT_RATIO;
  const logoX = pageWidth - margin - logoWidth;
  const logoY = 10;

  try {
    doc.addImage(FINANCE_BRUNCH_LOGO_RAW, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.warn('Failed to embed logo into PDF, falling back to text:', err);
    doc.setFont('ReportFont', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(2, 132, 199);
    doc.text('FINANCE BRUNCH', logoX, logoY + 10);
  }

  // 2. Left Header
  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text('FINANCE BRUNCH ADVISORY', margin, 15);

  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Income Tax Calculation Report', margin, 23);

  doc.setFont('ReportFont', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Financial Year: ${data.financialYear}  |  ${data.assessmentYear}  |  Generated: ${data.generatedDateStr}`, margin, 29);

  // Divider Line
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.6);
  doc.line(margin, 34, pageWidth - margin, 34);

  let currentY = 40;

  // 3. Profile & Summary Cards (Side by Side)
  const colWidth = (contentWidth - 6) / 2; // 88mm
  const boxHeight = 44;

  // Box 1: Profile
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Taxpayer Profile', margin + 5, currentY + 7);

  doc.setFont('ReportFont', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Taxpayer Type:', margin + 5, currentY + 14);
  doc.text('Country:', margin + 5, currentY + 20);
  doc.text('Age Category:', margin + 5, currentY + 26);
  doc.text('Regime Selected:', margin + 5, currentY + 32);
  doc.text('Assessment Year:', margin + 5, currentY + 38);

  doc.setFont('ReportFont', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(getTaxpayerLabel(data.taxpayerType), margin + colWidth - 5, currentY + 14, { align: 'right' });
  doc.text(data.country.toUpperCase() + (data.state && data.state !== 'default' ? ` - ${data.state.toUpperCase()}` : ''), margin + colWidth - 5, currentY + 20, { align: 'right' });
  doc.text(getAgeLabel(data.age), margin + colWidth - 5, currentY + 26, { align: 'right' });
  doc.text(data.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime', margin + colWidth - 5, currentY + 32, { align: 'right' });
  doc.text(data.assessmentYear, margin + colWidth - 5, currentY + 38, { align: 'right' });

  // Box 2: Financial Summary
  const box2X = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(box2X, currentY, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Financial Summary', box2X + 5, currentY + 7);

  const totalDeductions = Object.values(data.deductions || {}).reduce((s, v) => s + (Number(v) || 0), 0);

  doc.setFont('ReportFont', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Gross Annual Income:', box2X + 5, currentY + 14);
  doc.text('Deductions Claimed:', box2X + 5, currentY + 20);
  doc.text('Net Taxable Income:', box2X + 5, currentY + 26);
  doc.text('Total Tax Liability:', box2X + 5, currentY + 32);
  doc.text('Effective Tax Rate:', box2X + 5, currentY + 38);

  doc.setFont('ReportFont', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatReportCurrency(data.income, currency), box2X + colWidth - 5, currentY + 14, { align: 'right' });
  doc.text(formatReportCurrency(totalDeductions, currency), box2X + colWidth - 5, currentY + 20, { align: 'right' });
  doc.text(formatReportCurrency(data.taxResult.taxableIncome, currency), box2X + colWidth - 5, currentY + 26, { align: 'right' });
  doc.setTextColor(2, 132, 199);
  doc.text(formatReportCurrency(data.taxResult.totalTaxLiability, currency), box2X + colWidth - 5, currentY + 32, { align: 'right' });
  doc.text(formatReportPercent(data.taxResult.effectiveTaxRate), box2X + colWidth - 5, currentY + 38, { align: 'right' });

  currentY += boxHeight + 8;

  // 4. Tax Calculation Breakdown Table
  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Tax Liability Breakdown', margin, currentY);
  currentY += 4;

  // Table Header
  const colRuleX = margin + 115;
  const colAmtX = margin + contentWidth - 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Component / Tax Head', margin + 5, currentY + 5.2);
  doc.text('Calculation Rule', colRuleX, currentY + 5.2, { align: 'right' });
  doc.text(`Amount (${currency})`, colAmtX, currentY + 5.2, { align: 'right' });
  currentY += 8;

  const rows: Array<{ name: string; rule: string; val: string; isTotal?: boolean }> = [
    { name: 'Base Income Tax (Before Cess)', rule: 'Applicable slabs', val: formatReportCurrency(data.taxResult.taxBeforeCess, currency) },
  ];

  if (data.taxResult.rebate && data.taxResult.rebate > 0) {
    rows.push({ name: 'Section 87A Tax Rebate', rule: 'Rebate benefit', val: `-${formatReportCurrency(data.taxResult.rebate, currency)}` });
  }
  if (data.taxResult.surcharge && data.taxResult.surcharge > 0) {
    rows.push({ name: 'Surcharge', rule: 'High net worth surcharge', val: formatReportCurrency(data.taxResult.surcharge, currency) });
  }
  if (data.country === 'india' && data.taxResult.cessAmount > 0) {
    rows.push({ name: 'Health & Education Cess', rule: '4% on tax liability', val: formatReportCurrency(data.taxResult.cessAmount, currency) });
  }
  if (data.taxResult.stateTax && data.taxResult.stateTax > 0) {
    rows.push({ name: 'State/Provincial Tax', rule: 'State tax', val: formatReportCurrency(data.taxResult.stateTax, currency) });
  }
  rows.push({
    name: 'Total Tax Liability',
    rule: `Effective Rate: ${formatReportPercent(data.taxResult.effectiveTaxRate)}`,
    val: formatReportCurrency(data.taxResult.totalTaxLiability, currency),
    isTotal: true,
  });

  rows.forEach((r) => {
    // Check if table row fits on page
    if (currentY + 10 > pageHeight - margin - 20) {
      doc.addPage();
      drawBackgroundWatermark();
      currentY = margin + 10;
    }

    if (r.isTotal) {
      doc.setFillColor(239, 246, 255);
      doc.rect(margin, currentY, contentWidth, 8, 'F');
      doc.setFont('ReportFont', 'bold');
      doc.setTextColor(2, 132, 199);
    } else {
      doc.setFont('ReportFont', 'normal');
      doc.setTextColor(15, 23, 42);
    }

    doc.setFontSize(8);
    doc.text(r.name, margin + 5, currentY + 5.2);
    doc.text(r.rule, colRuleX, currentY + 5.2, { align: 'right' });
    doc.text(r.val, colAmtX, currentY + 5.2, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 8, margin + contentWidth, currentY + 8);
    currentY += 8;
  });

  currentY += 6;

  // 5. Old vs New Regime Comparison Box (if available)
  if (data.regimeComparison) {
    if (currentY + 32 > pageHeight - margin - 20) {
      doc.addPage();
      drawBackgroundWatermark();
      currentY = margin + 10;
    }

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

    doc.setFont('ReportFont', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(22, 101, 52);
    doc.text('Old Regime vs New Regime Analysis', margin + 5, currentY + 6);

    doc.setFont('ReportFont', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text(`Tax under New Regime: ${formatReportCurrency(data.regimeComparison.newRegime.totalTaxLiability, currency)}`, margin + 5, currentY + 12.5);
    doc.text(`Tax under Old Regime: ${formatReportCurrency(data.regimeComparison.oldRegime.totalTaxLiability, currency)}`, margin + 5, currentY + 18);

    const better = data.regimeComparison.betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime';
    doc.setFont('ReportFont', 'bold');
    doc.text(`Recommended: ${better} (Estimated Tax Savings: ${formatReportCurrency(data.regimeComparison.difference, currency)})`, margin + 5, currentY + 23.5);

    currentY += 32;
  }

  // 6. Disclaimer & Brand Footer
  const splitDisclaimer = doc.splitTextToSize(TAX_CALCULATOR_DISCLAIMER_TEXT, contentWidth);
  const disclaimerHeight = splitDisclaimer.length * 3.2;
  const neededBottomHeight = disclaimerHeight + 22;

  if (currentY + neededBottomHeight > pageHeight - margin) {
    doc.addPage();
    drawBackgroundWatermark();
    currentY = margin + 10;
  }

  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Disclaimer:', margin, currentY);

  doc.setFont('ReportFont', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(splitDisclaimer, margin, currentY + 3.8);

  const footerY = currentY + 5 + disclaimerHeight;

  // Divider above Brand Footer
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  // Professional Finance Brunch Brand Footer
  doc.setFont('ReportFont', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Finance Brunch', margin, footerY + 5);

  doc.setFont('ReportFont', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Email: admin@financebrunch.in   |   Phone: +91 7842-494-981   |   Website: https://financebrunch.in', margin + 26, footerY + 5);

  // Trigger immediate client-side download
  const blob = doc.output('blob');
  downloadBlob(blob, `Income_Tax_Calculation_Report_${data.financialYear}.pdf`);
}

/**
 * 3. DOWNLOAD AS WORD (.docx)
 * Generates an actual, readable .docx file that opens in Microsoft Word and compatible office software.
 * Embeds the Finance Brunch logo in the top-right corner of the first page.
 */
export async function downloadTaxReportDocx(data: TaxReportData) {
  const currency = data.taxResult.currencySymbol || 'Rs.';
  const totalDeductions = Object.values(data.deductions || {}).reduce((s, v) => s + (Number(v) || 0), 0);

  // Convert base64 logo to Uint8Array for docx ImageRun
  const rawBytes = Uint8Array.from(atob(FINANCE_BRUNCH_LOGO_RAW), (c) => c.charCodeAt(0));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        headers: {
          default: getDocxWatermarkHeader(),
        },
        children: [
          // Header Table: Title on left, Logo in top-right corner
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: '0284c7' },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'FINANCE BRUNCH ADVISORY',
                            size: 18,
                            bold: true,
                            color: '0284c7',
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Income Tax Calculation Report',
                            size: 32,
                            bold: true,
                            color: '0f172a',
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `FY ${data.financialYear}  |  ${data.assessmentYear}  |  Generated on ${data.generatedDateStr}`,
                            size: 18,
                            color: '64748b',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new ImageRun({
                            type: 'png',
                            data: rawBytes,
                            transformation: {
                              width: 150,
                              height: Math.round(150 / LOGO_ASPECT_RATIO),
                            },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Profile & Summary Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f8fafc', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Taxpayer Profile', bold: true, size: 22, color: '1e293b' })],
                        spacing: { after: 100 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Taxpayer Type: ', color: '64748b', size: 19 }),
                          new TextRun({ text: getTaxpayerLabel(data.taxpayerType), bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Country: ', color: '64748b', size: 19 }),
                          new TextRun({ text: data.country.toUpperCase() + (data.state && data.state !== 'default' ? ` - ${data.state.toUpperCase()}` : ''), bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Age Category: ', color: '64748b', size: 19 }),
                          new TextRun({ text: getAgeLabel(data.age), bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Regime: ', color: '64748b', size: 19 }),
                          new TextRun({ text: data.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime', bold: true, size: 19 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'f8fafc', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Financial Summary', bold: true, size: 22, color: '1e293b' })],
                        spacing: { after: 100 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Gross Annual Income: ', color: '64748b', size: 19 }),
                          new TextRun({ text: `${currency} ${data.income.toLocaleString('en-IN')}`, bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Deductions Claimed: ', color: '64748b', size: 19 }),
                          new TextRun({ text: `${currency} ${totalDeductions.toLocaleString('en-IN')}`, bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Net Taxable Income: ', color: '64748b', size: 19 }),
                          new TextRun({ text: `${currency} ${data.taxResult.taxableIncome.toLocaleString('en-IN')}`, bold: true, size: 19 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Effective Tax Rate: ', color: '64748b', size: 19 }),
                          new TextRun({ text: `${data.taxResult.effectiveTaxRate.toFixed(2)}%`, bold: true, color: '0284c7', size: 19 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 250 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Tax Liability Breakdown', bold: true, size: 24, color: '0f172a' })],
            spacing: { after: 100 },
          }),

          // Breakdown Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'f1f5f9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tax Component', bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'f1f5f9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Rule / Details', bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'f1f5f9', type: ShadingType.CLEAR },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Amount (${currency})`, bold: true, size: 19 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Base Income Tax', size: 19 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Statutory Slabs', size: 19 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.taxResult.taxBeforeCess.toLocaleString('en-IN'), size: 19 })] })] }),
                ],
              }),
              ...(data.taxResult.rebate && data.taxResult.rebate > 0
                ? [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Section 87A Rebate', size: 19, color: '15803d' })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Rebate benefit', size: 19 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `-${data.taxResult.rebate.toLocaleString('en-IN')}`, size: 19, color: '15803d' })] })] }),
                      ],
                    }),
                  ]
                : []),
              ...(data.country === 'india' && data.taxResult.cessAmount > 0
                ? [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Health & Education Cess (4%)', size: 19 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '4%', size: 19 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.taxResult.cessAmount.toLocaleString('en-IN'), size: 19 })] })] }),
                      ],
                    }),
                  ]
                : []),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'eff6ff', type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Tax Liability', bold: true, size: 20, color: '0284c7' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'eff6ff', type: ShadingType.CLEAR },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Effective: ${data.taxResult.effectiveTaxRate.toFixed(2)}%`, bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'eff6ff', type: ShadingType.CLEAR },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${currency} ${data.taxResult.totalTaxLiability.toLocaleString('en-IN')}`, bold: true, size: 20, color: '0284c7' })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Regime Comparison (if applicable)
          ...(data.regimeComparison
            ? [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 8, color: '86efac' },
                    bottom: { style: BorderStyle.SINGLE, size: 8, color: '86efac' },
                    left: { style: BorderStyle.SINGLE, size: 8, color: '86efac' },
                    right: { style: BorderStyle.SINGLE, size: 8, color: '86efac' },
                  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          shading: { fill: 'f0fdf4', type: ShadingType.CLEAR },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: 'Old Regime vs New Regime Comparison', bold: true, size: 21, color: '15803d' })],
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({ text: `New Regime Tax: ${currency} ${data.regimeComparison.newRegime.totalTaxLiability.toLocaleString('en-IN')}  |  Old Regime Tax: ${currency} ${data.regimeComparison.oldRegime.totalTaxLiability.toLocaleString('en-IN')}`, size: 18, color: '166534' }),
                              ],
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `Recommended: ${data.regimeComparison.betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'} (Saves ${currency} ${data.regimeComparison.difference.toLocaleString('en-IN')})`,
                                  bold: true,
                                  size: 19,
                                  color: '15803d',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new Paragraph({ text: '', spacing: { after: 200 } }),
              ]
            : []),

          // Disclaimer
          new Paragraph({
            children: [
              new TextRun({
                text: 'Disclaimer: ',
                bold: true,
                size: 16,
                color: '64748b',
              }),
              new TextRun({
                text: TAX_CALCULATOR_DISCLAIMER_TEXT,
                size: 16,
                color: '64748b',
                italics: true,
              }),
            ],
            spacing: { before: 200, after: 140 },
          }),

          // Divider
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [new TableRow({ children: [new TableCell({ children: [] })] })],
          }),

          // Professional Finance Brunch Brand Footer
          new Paragraph({
            children: [
              new TextRun({
                text: 'Finance Brunch',
                bold: true,
                size: 18,
                color: '0f172a',
              }),
              new TextRun({
                text: '   |   Email: admin@financebrunch.in   |   Phone: +91 7842-494-981   |   Website: https://financebrunch.in',
                size: 16,
                color: '64748b',
              }),
            ],
            spacing: { before: 120 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `Income_Tax_Calculation_Report_${data.financialYear}.docx`);
}

/**
 * 4. SHARE ACTION
 * Uses Web Share API where supported with fallback to copying summary to clipboard.
 */
export async function shareTaxReport(data: TaxReportData): Promise<{ shared: boolean; method: 'web-share' | 'clipboard' }> {
  const currency = data.taxResult.currencySymbol || '₹';
  const textSummary = `Finance Brunch - Income Tax Calculation (${data.financialYear}, ${data.assessmentYear}):
Gross Annual Income: ${currency}${data.income.toLocaleString('en-IN')}
Taxable Income: ${currency}${data.taxResult.taxableIncome.toLocaleString('en-IN')}
Regime: ${data.regime === 'new' ? 'New Regime' : 'Old Regime'}
Total Tax Liability: ${currency}${data.taxResult.totalTaxLiability.toLocaleString('en-IN')}
Effective Tax Rate: ${data.taxResult.effectiveTaxRate.toFixed(2)}%

Plan your taxes accurately on Finance Brunch:`;

  const sharePayload = {
    title: 'Income Tax Calculation Report - Finance Brunch',
    text: textSummary,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(sharePayload)) {
    try {
      await navigator.share(sharePayload);
      return { shared: true, method: 'web-share' };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { shared: false, method: 'web-share' };
      }
    }
  }

  // Fallback to clipboard
  await navigator.clipboard.writeText(`${textSummary}\n${window.location.href}`);
  return { shared: true, method: 'clipboard' };
}
