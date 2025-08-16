export function verificationEmailTemplate(nombre: string, codigo: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Verificación de Seguridad</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f7fa; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td align="center" style="background:linear-gradient(90deg, #ff7a18, #21c97a); padding:20px 0;">
                <h1 style="margin:0; font-size:32px; font-weight:bold; font-family: Arial, sans-serif; color:#ffffff;">
                  <span style="color:#ff7a18;">B</span><span style="color:#21c97a;">eland</span>
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding:40px 30px; text-align:left;">
                <h2 style="margin-top:0; font-size:22px; font-weight:600; color:#333;">Hola ${nombre},</h2>
                <p style="font-size:16px; line-height:1.6; color:#555;">
                  Gracias por registrarte en <strong>Beland</strong>.  
                  Para continuar, por favor utiliza el siguiente código de verificación:
                </p>
                <div style="margin:30px 0; text-align:center;">
                  <span style="display:inline-block; font-size:28px; font-weight:bold; color:#21c97a; letter-spacing:6px; background:#f0fdf6; padding:12px 24px; border-radius:8px; border:2px dashed #21c97a;">
                    ${codigo}
                  </span>
                </div>
                <p style="font-size:14px; color:#777;">
                  Este código expira en unos minutos. Si no solicitaste esta verificación, puedes ignorar este mensaje.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#f9fafb; padding:20px; font-size:12px; color:#999;">
                © ${new Date().getFullYear()} Beland. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
