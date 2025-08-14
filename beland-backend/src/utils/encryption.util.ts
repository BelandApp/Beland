//funcion que encripta en AES 256 CBC sin vector de inicializacion
export function encrypted_aes(optionalParameter4: string) {
    var key = CryptoJS.enc.Utf8.parse(process.env.PAYPHONE_CODIFICATION_PASSWORD);
    var iv = CryptoJS.enc.Utf8.parse('');
    var encrypted = CryptoJS.AES.encrypt(optionalParameter4, key,{ iv: iv });
    var result_aes = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    return result_aes;
}


// adaptacion de chatgpt

export function encryptedAES(text: string): string {
  const key = CryptoJS.enc.Utf8.parse(process.env.PAYPHONE_CODIFICATION_PASSWORD);
  const iv = CryptoJS.enc.Utf8.parse(''); // Si no usás IV, puede quedar vacío o con un valor fijo

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC, // CBC es el default, pero mejor ser explícitos
    padding: CryptoJS.pad.Pkcs7, // Igual que en el original
  });

  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}