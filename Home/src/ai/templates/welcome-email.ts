interface WelcomeEmailProps {
  loginUrl: string;
  registerUrl: string;
}

export const welcomeEmailTemplate = ({ loginUrl, registerUrl }: WelcomeEmailProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Beland</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #eaeaea;
        }
        .header {
          background-color: #14a37f; /* Color primario de Beland */
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
          line-height: 1.6;
        }
        .content p {
          margin: 0 0 15px;
        }
        .cta-button {
          display: inline-block;
          background-color: #14a37f;
          color: #ffffff;
          padding: 12px 25px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 10px;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Beland!</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Gracias por unirte a la comunidad de Beland. Estamos construyendo el ecosistema circular del mañana, y nos alegra tenerte a bordo.</p>
          <p>Con Beland, puedes participar en eventos de reciclaje, ganar incentivos, comprar productos sostenibles y mucho más. ¡Cada acción cuenta!</p>
          <p>¿Estás listo para empezar?</p>
          <a href="${registerUrl}" class="cta-button">Regístrate Ahora</a>
          <p style="margin-top: 20px;">¿Ya tienes una cuenta?</p>
          <a href="${loginUrl}">Inicia Sesión aquí</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Beland. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
