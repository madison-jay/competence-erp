// app/api/invoice/send-email/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const customer_email = formData.get('customer_email');
    const customer_name = formData.get('customer_name');
    const order_number = formData.get('order_number');
    const total_amount = formData.get('total_amount');
    const invoice_pdf = formData.get('invoice_pdf');

    // Validate required fields
    if (!customer_email || !customer_name || !order_number || !total_amount || !invoice_pdf) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Missing required fields" 
        },
        { status: 400 }
      );
    }

    // Convert the PDF blob to buffer
    const pdfBuffer = await invoice_pdf.arrayBuffer();
    const pdfData = Buffer.from(pdfBuffer);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Madison Jay Furniture <invoices@madisonjayng.com>',
      to: customer_email,
      subject: `Invoice for Order #${order_number} - Madison Jay Furniture`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #b88b1b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                .footer { text-align: center; margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 5px; }
                .amount { font-size: 24px; font-weight: bold; color: #b88b1b; text-align: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Madison Jay Furniture</h1>
                    <h2>Invoice for Order #${order_number}</h2>
                </div>
                
                <div class="content">
                    <p>Dear ${customer_name},</p>
                    
                    <p>Thank you for your order with Madison Jay Furniture. Your invoice for Order #${order_number} is ready and attached to this email.</p>
                    
                    <div class="amount">
                        Total Amount: ₦${parseFloat(total_amount).toLocaleString()}
                    </div>
                    
                    <p><strong>Order Details:</strong></p>
                    <ul>
                        <li><strong>Order Number:</strong> ${order_number}</li>
                        <li><strong>Total Amount:</strong> ₦${parseFloat(total_amount).toLocaleString()}</li>
                        <li><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    
                    <p>Please find your detailed invoice attached as a PDF document. If you have any questions about your order or the invoice, don't hesitate to contact us.</p>
                    
                    <p>We appreciate your business and look forward to serving you again!</p>
                </div>
                
                <div class="footer">
                    <p><strong>Madison Jay Furniture</strong></p>
                    <p>13, Alhaij Kanike Close, off Awolowo Road, Ikoyi - Lagos</p>
                    <p>Phone: +234-817-777-0017 | Email: sales@madisonjayng.com</p>
                    <p>Website: www.madisonjayng.com</p>
                </div>
            </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice_${order_number}.pdf`,
          content: pdfData.toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully via Resend:', data.id);

    return NextResponse.json({
      status: "success",
      message: "Invoice email sent successfully",
      data: {
        messageId: data.id,
        customer_email,
        order_number
      }
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to send invoice email",
        error: error.message 
      },
      { status: 500 }
    );
  }
}