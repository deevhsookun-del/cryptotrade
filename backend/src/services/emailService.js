async function sendEmail({ to, subject, text, html }) {
  console.log("📧 Email (dev mode):", { to, subject, text, html });
  return { simulated: true };
}

module.exports = { sendEmail };
