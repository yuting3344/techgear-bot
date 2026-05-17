import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TO = 'ylin8266@gmail.com'

export async function POST(req: NextRequest) {
  const { name, email, phone, topic, message, ticketId } = await req.json()

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"TechGear Bot" <${process.env.SMTP_USER}>`,
      to: TO,
      subject: `[TechGear] 新客服諮詢 ${ticketId} — ${topic}`,
      html: `
        <h2>有新客服諮詢請求</h2>
        <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td><b>案件編號</b></td><td>${ticketId}</td></tr>
          <tr><td><b>姓名</b></td><td>${name}</td></tr>
          <tr><td><b>Email</b></td><td>${email}</td></tr>
          <tr><td><b>電話</b></td><td>${phone || '未填'}</td></tr>
          <tr><td><b>問題類別</b></td><td>${topic}</td></tr>
          <tr><td><b>問題描述</b></td><td>${message}</td></tr>
        </table>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email send failed:', err)
    // Don't block the user flow if email fails
    return NextResponse.json({ ok: false })
  }
}
