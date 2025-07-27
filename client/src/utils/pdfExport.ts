import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import ReactDOM from 'react-dom';
import { PDFDashboardLayout } from '@/components/PDFDashboardLayout';
import { CallsSummaryMetricsWithTrends } from '@/types/analytics';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  margin?: number;
}

export const exportToPDF = async (
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> => {
  const {
    filename = 'dashboard-report.pdf',
    title = 'Dashboard Report',
    subtitle = 'Generated on ' + new Date().toLocaleDateString(),
    orientation = 'portrait',
    format = 'a4',
    margin = 20
  } = options;

  try {
    // Show loading state
    console.log('Generating PDF...');
    
    // Add a small delay to ensure the UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      logging: false,
    });

    // Create PDF with higher quality settings
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add title and subtitle
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, margin + 10);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(subtitle, margin, margin + 20);

    // Add the image with better quality
    const imgData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
    pdf.addImage(imgData, 'PNG', margin, margin + 30, imgWidth, imgHeight, undefined, 'FAST');

    // Handle multiple pages if content is too long
    let heightLeft = imgHeight;
    let position = margin + 30;

    while (heightLeft >= pdfHeight) {
      position = heightLeft - pdfHeight + margin + 30;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Save the PDF
    pdf.save(filename);

    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const exportDashboardToPDF = async (
  currentFilter: string,
  metrics?: CallsSummaryMetricsWithTrends,
  options: PDFExportOptions = {}
): Promise<void> => {
  // Create a temporary container for the PDF layout
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1600px'; // Larger width for better quality
  tempContainer.style.height = 'auto';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.fontSize = '16px'; // Larger font size for better readability
  document.body.appendChild(tempContainer);

  try {
    // If metrics are provided, use the PDF layout component
    if (metrics) {
      ReactDOM.render(
        React.createElement(PDFDashboardLayout, { metrics }),
        tempContainer
      );
      
      // Wait for the component to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const defaultOptions: PDFExportOptions = {
        filename: `dashboard-report-${currentFilter.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        title: `Dashboard Report - ${currentFilter}`,
        subtitle: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        orientation: 'portrait',
        format: 'a4',
        margin: 15
      };

      await exportToPDF(tempContainer, { ...defaultOptions, ...options });
    } else {
      // Fallback to original method
      const dashboardContent = document.querySelector('[data-dashboard-content]') as HTMLElement;
      
      if (!dashboardContent) {
        throw new Error('Dashboard content not found');
      }

      // Temporarily hide any elements that shouldn't be in the PDF
      const elementsToHide = dashboardContent.querySelectorAll('[data-no-pdf]');
      const originalDisplays: string[] = [];
      
      elementsToHide.forEach((el) => {
        const element = el as HTMLElement;
        originalDisplays.push(element.style.display);
        element.style.display = 'none';
      });

      try {
        const defaultOptions: PDFExportOptions = {
          filename: `dashboard-report-${currentFilter.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
          title: `Dashboard Report - ${currentFilter}`,
          subtitle: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          orientation: 'portrait',
          format: 'a4',
          margin: 15
        };

        await exportToPDF(dashboardContent, { ...defaultOptions, ...options });
      } finally {
        // Restore hidden elements
        elementsToHide.forEach((el, index) => {
          const element = el as HTMLElement;
          element.style.display = originalDisplays[index];
        });
      }
    }
  } finally {
    // Clean up
    ReactDOM.unmountComponentAtNode(tempContainer);
    document.body.removeChild(tempContainer);
  }
}; 