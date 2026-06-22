import * as Crypto from 'expo-crypto';

export async function gerarHashSenha(senha) {
  const senhaNormalizada = senha.trim();

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    senhaNormalizada
  );

  return hash;
}