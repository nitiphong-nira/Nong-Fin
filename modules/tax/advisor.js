import { calculateTax, getTaxAdvice } from './calculator.js';

export function generateTaxReport(userData) {
  const taxResult = calculateTax(userData);
  const advice = getTaxAdvice(taxResult, userData);

  const report = `
📊 *รายงานภาษีของคุณ*

💰 รายได้รวม: ${taxResult.totalIncome.toLocaleString()} บาท
📉 หักลดหย่อน: ${taxResult.totalDeductions.toLocaleString()} บาท
🎯 รายได้สุทธิ: ${taxResult.netIncome.toLocaleString()} บาท
💸 ภาษีที่ต้องชำระ: ${taxResult.tax.toLocaleString()} บาท
${taxResult.taxRefund > 0 ? `🤑 ได้รับเงินคืน: ${taxResult.taxRefund.toLocaleString()} บาท` : ''}

💡 *คำแนะนำ*:
${advice.map(a => `• ${a}`).join('\n')}

📋 *ขั้นตอนต่อไป*:
1. เตรียมเอกสารการหักลดหย่อน
2. ตรวจสอบความถูกต้องของข้อมูล
3. ยื่นภาษีผ่าน www.rd.go.th
  `;

  return report;
}
