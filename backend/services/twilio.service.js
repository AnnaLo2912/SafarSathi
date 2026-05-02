import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+14155238886' // Fallback to Twilio sandbox

const client = twilio(accountSid, authToken)

// Send SMS or WhatsApp message
export async function sendMessage(toPhoneNumber, message, isWhatsApp = false) {
  try {
    if (!toPhoneNumber || !message) {
      throw new Error('Phone number and message are required')
    }

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not set - skipping message send')
      return { sid: 'mock_' + Date.now() }
    }

    // Normalize phone number to E.164 format if needed
    let normalizedPhone = toPhoneNumber
    if (!toPhoneNumber.startsWith('+')) {
      // Assume India if no country code
      if (toPhoneNumber.length === 10) {
        normalizedPhone = `+91${toPhoneNumber}`
      } else {
        normalizedPhone = `+${toPhoneNumber}`
      }
    }

    const messageData = {
      body: message,
      from: isWhatsApp ? `whatsapp:${phoneNumber}` : phoneNumber,
      to: isWhatsApp ? `whatsapp:${normalizedPhone}` : normalizedPhone,
    }

    const result = await client.messages.create(messageData)
    console.log(`Message sent to ${normalizedPhone}:`, result.sid)
    return result
  } catch (err) {
    console.error('Error sending message:', err.message)
    throw err
  }
}

// Send SMS
export async function sendSMS(toPhoneNumber, message) {
  return sendMessage(toPhoneNumber, message, false)
}

// Send WhatsApp
export async function sendWhatsApp(toPhoneNumber, message) {
  return sendMessage(toPhoneNumber, message, true)
}

// Send wallet top-up confirmation SMS
export async function sendTopUpConfirmationSMS(toPhoneNumber, amount, currency, inrAmount) {
  const message = `✓ SafarSathi Wallet
Amount added: ${currency === 'INR' ? '₹' : '$'}${amount} (₹${inrAmount})
Your wallet has been topped up. Enjoy your trip!`

  return sendSMS(toPhoneNumber, message)
}

// Send payment request SMS
export async function sendPaymentRequestSMS(toPhoneNumber, amount, currency, inrAmount) {
  const message = `💳 SafarSathi Payment Request
Amount: ${currency === 'INR' ? '₹' : '$'}${amount} (₹${inrAmount})
Please complete your payment to proceed with the booking.`

  return sendSMS(toPhoneNumber, message)
}

// Send payment notification SMS to guide
export async function sendPaymentNotificationToGuide(guidePhone, touristName, amount, tripDate, location) {
  const message = `💰 Payment Received - SafarSathi
Tourist: ${touristName}
Amount: ₹${amount}
Date: ${tripDate}
Location: ${location}`

  return sendWhatsApp(guidePhone, message)
}

// Send SOS alert to guide
export async function sendSOSAlertToGuide(guidePhone, touristName, location, emergencyContact) {
  const message = `🚨 EMERGENCY ALERT
Tourist: ${touristName}
Location: ${location}
Emergency Contact: ${emergencyContact}
Please respond immediately!`

  return sendWhatsApp(guidePhone, message)
}
