import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { gerarHashSenha } from './hash';

const FIREBASE_URL =
  'https://firestore.googleapis.com/v1/projects/gfhp-fdd48/databases/(default)/documents';

export default function ResetSenha({ voltar }) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const redefinirSenha = async () => {
    try {
      const resp = await fetch(`${FIREBASE_URL}/usuarios`);
      const data = await resp.json();

      const emailNormalizado = email.trim().toLowerCase();

      const usuario = data.documents?.find(doc =>
        doc.fields?.email?.stringValue === emailNormalizado
      );

      if (!usuario) {
        setMensagem('Usuário não encontrado');
        return;
      }

      const userId = usuario.name.split('/').pop();
      const senhaHash = await gerarHashSenha(novaSenha);

      await fetch(
        `${FIREBASE_URL}/usuarios/${userId}?updateMask.fieldPaths=senha`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              senha: { stringValue: senhaHash }
            }
          })
        }
      );

      setMensagem('Senha redefinida com sucesso ✅');

    } catch (erro) {
      console.log(erro);
      setMensagem('Erro ao redefinir senha');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔐 Resetar Senha</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        secureTextEntry
        onChangeText={setNovaSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={redefinirSenha}>
        <Text style={styles.textoBotao}>Redefinir</Text>
      </TouchableOpacity>

      {mensagem !== '' && <Text style={{ marginTop: 10 }}>{mensagem}</Text>}

      <TouchableOpacity style={styles.voltar} onPress={voltar}>
        <Text style={{ color: '#fff' }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  titulo: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  botao: {
    backgroundColor: '#1976D2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  voltar: {
    marginTop: 15,
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});