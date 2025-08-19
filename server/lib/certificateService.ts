import PDFDocument from 'pdfkit';
import { ObjectStorageService } from '../objectStorage';

interface CertificateData {
  name: string;
  event: string;
  role: 'participant' | 'judge' | 'winner';
  date: string;
  eventId: number;
  userId?: string;
}

export class CertificateService {
  private objectStorage: ObjectStorageService;

  constructor() {
    this.objectStorage = new ObjectStorageService();
  }

  async generateCertificate(data: CertificateData): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50
        });

        // Collect the PDF data
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            
            // Upload to object storage
            const filename = `certificate-${data.eventId}-${data.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            const objectPath = await this.objectStorage.uploadBuffer(
              pdfBuffer,
              filename,
              'application/pdf'
            );
            
            // Return the full URL
            const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
            const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
            resolve(`${protocol}://${baseUrl}${objectPath}`);
          } catch (error) {
            reject(error);
          }
        });

        // Design the certificate
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Add gradient background (simulated with rectangles)
        doc.rect(0, 0, pageWidth, pageHeight)
           .fill('#f0f9ff');

        // Add border
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
           .lineWidth(3)
           .stroke('#3b82f6');

        // Add inner border
        doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
           .lineWidth(1)
           .stroke('#93c5fd');

        // Title - CERTIFICATE
        doc.fontSize(14)
           .fillColor('#6b7280')
           .text('CERTIFICATE OF', 0, 80, {
             align: 'center',
             width: pageWidth
           });

        // Role-based title
        const roleTitle = data.role === 'winner' ? 'EXCELLENCE' : 
                         data.role === 'judge' ? 'APPRECIATION' : 
                         'PARTICIPATION';
        
        doc.fontSize(36)
           .fillColor('#1e40af')
           .font('Helvetica-Bold')
           .text(roleTitle, 0, 110, {
             align: 'center',
             width: pageWidth
           });

        // Decorative line
        doc.moveTo(pageWidth / 2 - 100, 170)
           .lineTo(pageWidth / 2 + 100, 170)
           .lineWidth(2)
           .stroke('#3b82f6');

        // "This is to certify that"
        doc.fontSize(12)
           .fillColor('#6b7280')
           .font('Helvetica')
           .text('This is to certify that', 0, 200, {
             align: 'center',
             width: pageWidth
           });

        // Recipient name
        doc.fontSize(28)
           .fillColor('#1e293b')
           .font('Helvetica-Bold')
           .text(data.name, 0, 230, {
             align: 'center',
             width: pageWidth
           });

        // Participation text
        const participationText = data.role === 'winner' 
          ? 'has demonstrated exceptional performance and achieved outstanding results in'
          : data.role === 'judge'
          ? 'has served as a distinguished judge and contributed valuable expertise to'
          : 'has successfully participated in';

        doc.fontSize(12)
           .fillColor('#6b7280')
           .font('Helvetica')
           .text(participationText, 0, 280, {
             align: 'center',
             width: pageWidth
           });

        // Event name
        doc.fontSize(20)
           .fillColor('#1e40af')
           .font('Helvetica-Bold')
           .text(data.event, 0, 310, {
             align: 'center',
             width: pageWidth
           });

        // Date
        doc.fontSize(12)
           .fillColor('#6b7280')
           .font('Helvetica')
           .text(`Date: ${data.date}`, 0, 350, {
             align: 'center',
             width: pageWidth
           });

        // Add achievement badge for winners
        if (data.role === 'winner') {
          // Star symbol
          const starX = pageWidth / 2;
          const starY = 410;
          const starSize = 30;
          
          // Draw a simple star
          doc.fillColor('#fbbf24')
             .fontSize(40)
             .text('★', starX - 20, starY - 20);
          
          doc.fontSize(10)
             .fillColor('#6b7280')
             .text('WINNER', starX - 25, starY + 20);
        }

        // Signature lines
        const signatureY = pageHeight - 120;
        
        // Left signature
        doc.moveTo(100, signatureY)
           .lineTo(250, signatureY)
           .lineWidth(1)
           .stroke('#6b7280');
        
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('Event Organizer', 100, signatureY + 5, {
             width: 150,
             align: 'center'
           });

        // Right signature
        doc.moveTo(pageWidth - 250, signatureY)
           .lineTo(pageWidth - 100, signatureY)
           .lineWidth(1)
           .stroke('#6b7280');
        
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('Date of Issue', pageWidth - 250, signatureY + 5, {
             width: 150,
             align: 'center'
           });

        // Footer
        doc.fontSize(8)
           .fillColor('#9ca3af')
           .text('Powered by Fusion X Hackathon Platform', 0, pageHeight - 60, {
             align: 'center',
             width: pageWidth
           });

        // Certificate ID
        doc.fontSize(8)
           .fillColor('#9ca3af')
           .text(`Certificate ID: ${data.eventId}-${Date.now()}`, 0, pageHeight - 50, {
             align: 'center',
             width: pageWidth
           });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}