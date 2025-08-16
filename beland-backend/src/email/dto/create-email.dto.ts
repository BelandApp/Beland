export class CreateEmailDto {
    to: string; 
    subject: string;
    text: string; 
    html?: string;
}
