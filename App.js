import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import Cadastro from './Cadastro';
import Login from './Login';
import ResetSenha from './ResetSenha';
import AtivarLocalizacao from './Localizacao';
import MonitoramentoUnidade from './MonitoramentoUnidade';
import RelatorioHospital from './RelatorioHospital';

import { MonitoramentoProvider } from './MonitoramentoContext';

export default function App() {
  return (
    <MonitoramentoProvider>
      <AppConteudo />
    </MonitoramentoProvider>
  );
}

function AppConteudo() {
  const [tela, setTela] = useState('menu');

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F8F7' }}>

      <View style={styles.header}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.headerTitulo}>Saúde em Fila</Text>
      </View>

      {tela === 'menu' && (
        <View style={styles.menu}>
          <Text style={styles.titulo}>Menu Principal</Text>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => setTela('cadastro')}
          >
            <Text style={styles.textoBotao}>📝 Cadastro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: '#2F80ED' }]}
            onPress={() => setTela('login')}
          >
            <Text style={styles.textoBotao}>🔐 Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {tela === 'cadastro' && (
        <Cadastro voltar={() => setTela('menu')} />
      )}

      {tela === 'login' && (
        <Login
          voltar={() => setTela('menu')}
          irParaLocalizacao={() => setTela('localizacao')}
          irParaReset={() => setTela('reset')}
        />
      )}

      {tela === 'reset' && (
        <ResetSenha voltar={() => setTela('login')} />
      )}

      {tela === 'localizacao' && (
        <AtivarLocalizacao
          irParaMonitoramento={() => setTela('monitoramento')}
        />
      )}

      {tela === 'monitoramento' && (
        <MonitoramentoUnidade
          irParaRelatorio={() => setTela('relatorio')}
        />
      )}

      {tela === 'relatorio' && (
        <RelatorioHospital voltar={() => setTela('monitoramento')} />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1E8F6F',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  logo: { fontSize: 40 },
  headerTitulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30
  },
  botao: {
    width: '100%',
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
});