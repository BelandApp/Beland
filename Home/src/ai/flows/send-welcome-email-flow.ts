'use server';

/**
 * @fileOverview Un flujo para enviar un correo de bienvenida a los nuevos suscriptores del boletín.
 *
 * - sendWelcomeEmail - Una función que maneja el envío del correo de bienvenida.
 * - WelcomeEmailInput - El tipo de entrada para la función sendWelcomeEmail.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { welcomeEmailTemplate } from '@/ai/templates/welcome-email';

// TODO: Reemplaza estas URL con tus URL de autenticación reales
const AUTH_URL_DEV = "/login"; // Ejemplo para desarrollo
const AUTH_URL_PROD = "https://your-production-auth-url.com/login"; // Ejemplo para producción
const REGISTER_URL_DEV = "/register";
const REGISTER_URL_PROD = "https://your-production-auth-url.com/register";

const getLoginUrl = () => process.env.NODE_ENV === 'production' ? AUTH_URL_PROD : AUTH_URL_DEV;
const getRegisterUrl = () => process.env.NODE_ENV === 'production' ? REGISTER_URL_PROD : REGISTER_URL_DEV;


const WelcomeEmailInputSchema = z.object({
  to: z.string().email().describe('La dirección de correo electrónico del destinatario.'),
});
export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  await sendWelcomeEmailFlow(input);
}

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: WelcomeEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // En una aplicación real, aquí integrarías un servicio de envío de correos como SendGrid, Resend, etc.
    // Para este ejemplo, simularemos el envío y registraremos el contenido en la consola.
    
    const emailHtml = welcomeEmailTemplate({
        loginUrl: getLoginUrl(),
        registerUrl: getRegisterUrl(),
    });

    console.log("===================================");
    console.log("Simulando envío de correo electrónico:");
    console.log(`Para: ${input.to}`);
    console.log(`Desde: belandproject@gmail.com`);
    console.log("Asunto: ¡Bienvenido a Beland!");
    console.log("Cuerpo (HTML):");
    console.log(emailHtml);
    console.log("===================================");
    
    // Aquí iría la llamada a la API del servicio de correo:
    // await emailService.send({
    //   from: 'belandproject@gmail.com',
    //   to: input.to,
    //   subject: '¡Bienvenido a Beland!',
    //   html: emailHtml,
    // });
  }
);
