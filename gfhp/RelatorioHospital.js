import React, {
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

const FIREBASE_URL =
  'https://firestore.googleapis.com/v1/projects/gfhp-fdd48/databases/(default)/documents';

const HOSPITAIS = {
  hospital1: 'Mario Gatti',
  hospital2: 'Ouro Verde',
  hospital3: 'PUC'
};

export default function RelatorioHospital({
  voltar
}) {

  const [
    hospitalSelecionado,
    setHospitalSelecionado
  ] = useState('hospital1');

  const [
    quantidade,
    setQuantidade
  ] = useState(0);

  const [
    tempoMedio,
    setTempoMedio
  ] = useState(0);

  const [
    carregando,
    setCarregando
  ] = useState(false);

  useEffect(() => {

    carregar();

    const interval =
      setInterval(() => {

        carregar();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [hospitalSelecionado]);

  async function carregar() {

    if (carregando) return;

    setCarregando(true);

    try {

      const resp =
        await fetch(
          `${FIREBASE_URL}/registros`
        );

      const data =
        await resp.json();

      const agora = Date.now();

      let conectados = 0;

      const TEMPO_RETORNO =
        10 * 60 * 1000;

      const dispositivos = {};

      if (data.documents) {

        const registros =
          data.documents.sort((a, b) => {

            const entradaA =
              Number(
                a.fields.entrada
                  ?.integerValue || 0
              );

            const entradaB =
              Number(
                b.fields.entrada
                  ?.integerValue || 0
              );

            return entradaA - entradaB;
          });

        registros.forEach(doc => {

          const fields =
            doc.fields;

          const hospitalId =
            fields.hospitalId
              ?.stringValue;

          if (
            hospitalId !==
            hospitalSelecionado
          ) return;

          const dispositivoId =
            fields.dispositivoId
              ?.stringValue;

          const entrada =
            fields.entrada
              ?.integerValue
              ? Number(
                  fields.entrada
                    .integerValue
                )
              : null;

          const saida =
            fields.saida
              ?.integerValue
              ? Number(
                  fields.saida
                    .integerValue
                )
              : null;

          if (
            !dispositivoId ||
            !entrada
          ) return;

          if (saida === null) {
            conectados++;
          }

          const fim =
            saida || agora;

          const tempoAtual =
            fim - entrada;

          if (
            !dispositivos[
              dispositivoId
            ]
          ) {

            dispositivos[
              dispositivoId
            ] = {
              tempoTotal:
                tempoAtual,

              ultimaSaida:
                saida || null
            };

            return;
          }

          const dispositivo =
            dispositivos[
              dispositivoId
            ];

          if (
            dispositivo.ultimaSaida &&
            entrada -
              dispositivo.ultimaSaida <
                TEMPO_RETORNO
          ) {

            dispositivo.tempoTotal +=
              tempoAtual;

            dispositivo.ultimaSaida =
              saida || null;
          }

          else {

            dispositivo.tempoTotal +=
              tempoAtual;

            dispositivo.ultimaSaida =
              saida || null;
          }

        });

      }

      const lista =
        Object.values(dispositivos);

      let media = 0;

      if (lista.length > 0) {

        const soma =
          lista.reduce(
            (acc, item) =>
              acc + item.tempoTotal,
            0
          );

        media = Math.round(
          soma /
            lista.length /
            60000
        );
      }

      setQuantidade(conectados);

      setTempoMedio(media);

    } catch (error) {

      console.log(
        'Erro ao carregar relatório:',
        error
      );

      setQuantidade(0);

      setTempoMedio(0);

    }

    setCarregando(false);
  }

  return (

    <View style={styles.container}>

      <Text style={styles.titulo}>
        📊 Relatório da Unidade
      </Text>

      {Object.entries(HOSPITAIS).map(
        ([id, nome]) => (

        <TouchableOpacity
          key={id}
          style={[
            styles.botaoHospital,

            hospitalSelecionado === id &&
              styles.ativo
          ]}
          onPress={() =>
            setHospitalSelecionado(id)
          }
        >

          <Text
            style={[
              styles.textoHospital,

              hospitalSelecionado === id && {
                color: '#FFF'
              }
            ]}
          >
            {nome}
          </Text>

        </TouchableOpacity>

      ))}

      <View style={styles.card}>

        <Text style={styles.numero}>
          {carregando
            ? '...'
            : quantidade}
        </Text>

        <Text style={styles.label}>
          dispositivos conectados
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.numero}>
          {carregando
            ? '...'
            : tempoMedio}
        </Text>

        <Text style={styles.label}>
          minutos (tempo médio)
        </Text>

      </View>

      <TouchableOpacity
        style={styles.voltar}
        onPress={voltar}
      >

        <Text style={{ color: '#FFF' }}>
          Voltar
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  titulo: {
    fontSize: 22,
    marginBottom: 20
  },

  botaoHospital: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    width: 220,
    alignItems: 'center'
  },

  ativo: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2'
  },

  textoHospital: {
    color: '#000'
  },

  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    width: 220
  },

  numero: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0D47A1'
  },

  label: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center'
  },

  voltar: {
    marginTop: 30,
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 8
  }

});