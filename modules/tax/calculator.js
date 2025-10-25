// คำนวณภาษีแบบง่ายๆ
export function calculateTax(userData) {
  const { salary = 0, extra_income = 0, insurance = 0, parent_allowance = 0, interest = 0 } = userData;
  
  // รายได้รวม
  const totalIncome = salary + extra_income;
  
  // หักลดหย่อน
  const personalAllowance = 60000; // ลดหย่อนส่วนตัว
  const totalDeductions = Math.min(insurance, 100000) + 
                         Math.min(parent_allowance, 30000) + 
                         Math.min(interest, 100000) + 
                         personalAllowance;

  // รายได้สุทธิ
  const netIncome = Math.max(0, totalIncome - totalDeductions);

  // คำนวณภาษี (แบบขั้นบันได)
  let tax = 0;
  if (netIncome > 1500000) {
    tax = (netIncome - 1500000) * 0.35 + 365000;
  } else if (netIncome > 1000000) {
    tax = (netIncome - 1000000) * 0.30 + 215000;
  } else if (netIncome > 750000) {
    tax = (netIncome - 750000) * 0.25 + 65000;
  } else if (netIncome > 500000) {
    tax = (netIncome - 500000) * 0.20 + 27500;
  } else if (netIncome > 300000) {
    tax = (netIncome - 300000) * 0.15 + 7500;
  } else if (netIncome > 150000) {
    tax = (netIncome - 150000) * 0.10 + 2500;
  } else {
    tax = netIncome * 0.05;
  }

  return {
    totalIncome,
    totalDeductions,
    netIncome,
    tax: Math.max(0, tax),
    taxRefund: tax < 0 ? Math.abs(tax) : 0
  };
}

// ให้คำแนะนำ
export function getTaxAdvice(taxResult, userData) {
  const advice = [];
  
  if (taxResult.tax > 50000) {
    advice.push('💡 คุณอาจพิจารณาลดหย่อนเพิ่มผ่านกองทุน RMF/SSF');
  }
  
  if (userData.insurance < 50000) {
    advice.push('🛡️ เพิ่มเบี้ยประกันชีวิตเพื่อลดหย่อนภาษี');
  }
  
  if (taxResult.tax === 0) {
    advice.push('🎉 ยินดีด้วย! คุณไม่ต้องเสียภาษีปีนี้');
  }

  return advice;
}
