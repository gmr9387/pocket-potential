import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Application {
  id: string;
  status: string;
  created_at: string;
  programs: {
    title: string;
    amount: string;
    category: string;
  };
}

export const exportApplicationsToPDF = (
  applications: Application[],
  userName: string
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('FundFinder - Application Summary', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated for: ${userName}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
  
  // Stats summary
  const total = applications.length;
  const pending = applications.filter(a => ['submitted', 'in_review'].includes(a.status)).length;
  const approved = applications.filter(a => a.status === 'approved').length;
  
  doc.setFontSize(12);
  doc.text('Summary Statistics', 14, 46);
  doc.setFontSize(10);
  doc.text(`Total Applications: ${total}`, 14, 52);
  doc.text(`Pending Review: ${pending}`, 14, 58);
  doc.text(`Approved: ${approved}`, 14, 64);
  
  // Applications table
  const tableData = applications.map(app => [
    app.programs?.title || 'N/A',
    app.programs?.category || 'N/A',
    app.programs?.amount || 'N/A',
    app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('_', ' '),
    new Date(app.created_at).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    startY: 72,
    head: [['Program', 'Category', 'Amount', 'Status', 'Applied Date']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // primary color
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 35 },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`FundFinder_Applications_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSingleApplicationToPDF = (
  application: Application,
  userName: string,
  userEmail: string
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('FundFinder - Application Details', 14, 22);
  
  // Applicant info
  doc.setFontSize(12);
  doc.text('Applicant Information', 14, 35);
  doc.setFontSize(10);
  doc.text(`Name: ${userName}`, 14, 42);
  doc.text(`Email: ${userEmail}`, 14, 48);
  
  // Program details
  doc.setFontSize(12);
  doc.text('Program Information', 14, 60);
  doc.setFontSize(10);
  doc.text(`Program: ${application.programs?.title || 'N/A'}`, 14, 67);
  doc.text(`Category: ${application.programs?.category || 'N/A'}`, 14, 73);
  doc.text(`Amount: ${application.programs?.amount || 'N/A'}`, 14, 79);
  
  // Application status
  doc.setFontSize(12);
  doc.text('Application Status', 14, 91);
  doc.setFontSize(10);
  doc.text(`Status: ${application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}`, 14, 98);
  doc.text(`Applied Date: ${new Date(application.created_at).toLocaleDateString()}`, 14, 104);
  doc.text(`Application ID: ${application.id}`, 14, 110);
  
  // Footer
  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    doc.internal.pageSize.getHeight() - 10
  );
  
  // Save
  doc.save(`FundFinder_Application_${application.id}.pdf`);
};
