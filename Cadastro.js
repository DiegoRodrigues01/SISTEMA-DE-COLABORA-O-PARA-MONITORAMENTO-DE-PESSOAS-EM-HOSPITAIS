import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { gerarHashSenha } from './hash';

const FIREBASE_URL =
  'https://firestore.googleapis.com/v1/projects/gfhp-fdd48/databases/(default)/documents';

export default function Cadastro({ voltar }) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const cadastrar = async () => {
    try {
      if (!email || !nome || !senha) {
        setMensagem('Preencha todos os campos ⚠️');
        return;
      }

      const emailNormalizado = email.trim().toLowerCase();
      const nomeNormalizado = nome.trim();
      const senhaHash = await gerarHashSenha(senha);

      await fetch(`${FIREBASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            nome: { stringValue: nomeNormalizado },
            email: { stringValue: emailNormalizado },
            senha: { stringValue: senhaHash }
          }
        })
      });

      setMensagem('Usuário cadastrado com sucesso ✅');

      setNome('');
      setEmail('');
      setSenha('');

      setTimeout(() => {
        voltar();
      }, 1000);

    } catch (erro) {
      console.log(erro);
      setMensagem('Erro ao cadastrar ❌');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📝 Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#999"
        autoCapitalize="words"
        value={nome}
        onChangeText={setNome}
      />

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

      <TouchableOpacity style={styles.botao} onPress={cadastrar}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      {mensagem !== '' && (
        <Text style={styles.mensagem}>{mensagem}</Text>
      )}

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
    backgroundColor: '#27AE60',
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

  voltar: {
    marginTop: 15,
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});