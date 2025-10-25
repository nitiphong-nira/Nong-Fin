// ชุดคำถามสำหรับเก็บข้อมูลภาษี
export const taxQuestions = {
  // ข้อมูลส่วนตัว
  personal: [
    {
      id: 'income_type',
      question: '💰 รายได้หลักของคุณมาจากช่องทางใด?',
      type: 'choice',
      options: ['เงินเดือน', 'ฟรีแลนซ์', 'ธุรกิจส่วนตัว', 'อื่นๆ']
    }
  ],

  // ข้อมูลรายได้
  income: [
    {
      id: 'salary',
      question: '💵 รายได้ต่อปี (บาท):',
      type: 'number'
    },
    {
      id: 'extra_income', 
      question: '📈 มีรายได้เสริมอื่นๆ หรือไม่? (บาท):',
      type: 'number'
    }
  ],

  // ข้อมูลหักลดหย่อน
  deductions: [
    {
      id: 'insurance',
      question: '🛡️ เบี้ยประกันชีวิตที่จ่าย (บาท):',
      type: 'number'
    },
    {
      id: 'parent_allowance',
      question: '👨‍👩‍👧 ให้เงินพ่อแม่/ผู้ปกครอง (บาท):',
      type: 'number'  
    },
    {
      id: 'interest',
      question: '🏠 ดอกเบี้ยกู้ซื้อบ้าน (บาท):',
      type: 'number'
    }
  ]
};

// Flow การถาม
export const questionFlow = [
  'personal', 'income', 'deductions'
];
