import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { gerarHashSenha } from './hash';

const FIREBASE_URL =
  'https://firestore.googleapis.com/v1/projects/gfhp-fdd48/databases/(default)/documents';

export default function Login({ voltar, irParaLocalizacao, irParaReset }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const fazerLogin = async () => {
    try {
      if (!email || !senha) {
        setMensagem('Preencha todos os campos ⚠️');
        return;
      }

      const resp = await fetch(`${FIREBASE_URL}/usuarios`);
      const data = await resp.json();

      const emailNormalizado = email.trim().toLowerCase();
      const senhaDigitadaHash = await gerarHashSenha(senha);

      const usuario = data.documents?.find(doc =>
        doc.fields?.email?.stringValue === emailNormalizado
      );

      if (!usuario) {
        setMensagem('Usuário não encontrado ❌');
        return;
      }

      const senhaSalva = usuario.fields.senha.stringValue;

      if (senhaDigitadaHash === senhaSalva) {
        setMensagem('Login realizado com sucesso ✅');

        setTimeout(() => {
          irParaLocalizacao();
        }, 500);

      } else {
        setMensagem('Senha incorreta ❌');
      }

    } catch (erro) {
      console.log(erro);
      setMensagem('Erro ao fazer login ❌');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔐 Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={fazerLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      {mensagem !== '' && (
        <Text style={styles.mensagem}>{mensagem}</Text>
      )}

      <TouchableOpacity style={styles.link} onPress={irParaReset}>
        <Text style={{ color: '#2F80ED' }}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voltar} onPress={voltar}>
        <Text style={{ color: '#fff' }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },

  titulo: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center'
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000' // ✅ TEXTO PRETO
  },

  botao: {
    backgroundColor: '#2F80ED',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold'
  },

  mensagem: {
    marginTop: 10,
    textAlign: 'center'
  },

  link: {
    marginTop: 10,
    alignItems: 'center'
  },

  voltar: {
    marginTop: 15,
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});