import React, {
  useEffect,
  useState,
  useContext,
  useRef
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import * as Location from 'expo-location';

import { MonitoramentoContext }
  from './MonitoramentoContext';

const HOSPITAIS = {

  hospital1: {
    nome: 'Mario Gatti',
    latitude: -22.948597,
    longitude: -47.149143,
    raioEntrada: 10,
    raioSaida: 18
  },

  hospital2: {
    nome: 'Ouro Verde',
    latitude: -22.994577,
    longitude: -47.119752,
    raioEntrada: 10,
    raioSaida: 18
  },

  hospital3: {
    nome: 'PUC',
    latitude: -22.948597,
    longitude: -47.149143,
    raioEntrada: 10,
    raioSaida: 18
  }
};

function calcularDistancia(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ =
    ((lat2 - lat1) * Math.PI) / 180;

  const Δλ =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

export default function MonitoramentoUnidade({
  irParaRelatorio
}) {

  const {
    entrou,
    saiu,
    setDentroGlobal
  } = useContext(MonitoramentoContext);

  const [hospitalSelecionado,
    setHospitalSelecionado] =
    useState('hospital1');

  const [hospitalAtual,
    setHospitalAtual] =
    useState(null);

  const hospitalAtualRef =
    useRef(null);

  useEffect(() => {

    let sub;

    async function iniciarMonitoramento() {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {

        console.log('Permissão negada');

        return;
      }

      sub =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,

            distanceInterval: 5,

            timeInterval: 3000
          },

          async (loc) => {

            if (
              loc.coords.accuracy > 50
            ) {

              console.log(
                'GPS ruim:',
                loc.coords.accuracy
              );

              return;
            }

            let menorDistancia =
              Infinity;

            let hospitalMaisProximo =
              null;

            for (const [id, h]
              of Object.entries(HOSPITAIS)) {

              const distancia =
                calcularDistancia(
                  loc.coords.latitude,
                  loc.coords.longitude,
                  h.latitude,
                  h.longitude
                );

              console.log(
                `Distância até ${h.nome}:`,
                distancia
              );

              if (
                distancia <
                menorDistancia
              ) {

                menorDistancia =
                  distancia;

                hospitalMaisProximo =
                  id;
              }
            }

            if (
              hospitalMaisProximo &&
              menorDistancia <=
                HOSPITAIS[
                  hospitalMaisProximo
                ].raioEntrada
            ) {

              if (
                hospitalAtualRef.current !==
                hospitalMaisProximo
              ) {

                if (
                  hospitalAtualRef.current
                ) {

                  await saiu(
                    hospitalAtualRef.current
                  );
                }

                hospitalAtualRef.current =
                  hospitalMaisProximo;

                setHospitalAtual(
                  hospitalMaisProximo
                );

                setDentroGlobal(true);

                await entrou(
                  hospitalMaisProximo
                );

                console.log(
                  'Entrou em',
                  HOSPITAIS[
                    hospitalMaisProximo
                  ].nome
                );
              }
            }

            else {

              if (
                hospitalAtualRef.current !==
                null
              ) {

                const hospitalAtualObj =
                  HOSPITAIS[
                    hospitalAtualRef.current
                  ];

                const distanciaAtual =
                  calcularDistancia(
                    loc.coords.latitude,
                    loc.coords.longitude,
                    hospitalAtualObj.latitude,
                    hospitalAtualObj.longitude
                  );

                if (
                  distanciaAtual >
                  hospitalAtualObj.raioSaida
                ) {

                  await saiu(
                    hospitalAtualRef.current
                  );

                  console.log('Saiu');

                  hospitalAtualRef.current =
                    null;

                  setHospitalAtual(null);

                  setDentroGlobal(false);
                }
              }
            }
          }
        );
    }

    iniciarMonitoramento();

    return () => {

      if (sub) {
        sub.remove();
      }
    };

  }, []);

  return (

    <View style={styles.container}>

      <Text style={styles.titulo}>
        🏥 Monitoramento
      </Text>

      {Object.entries(HOSPITAIS).map(
        ([id, h]) => (

        <TouchableOpacity
          key={id}
          onPress={() =>
            setHospitalSelecionado(id)
          }
        >

          <Text
            style={{
              fontWeight:
                hospitalSelecionado === id
                  ? 'bold'
                  : 'normal',

              marginVertical: 5
            }}
          >
            {h.nome}
          </Text>

        </TouchableOpacity>
      ))}

      <Text style={styles.status}>

        {hospitalAtual
          ? `🟢 Dentro da unidade: ${
              HOSPITAIS[
                hospitalAtual
              ].nome
            }`
          : '🔴 Fora da unidade'}

      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={irParaRelatorio}
      >

        <Text style={styles.botaoTexto}>
          📊 Relatório
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },

  status: {
    marginTop: 15,
    fontSize: 16
  },

  botao: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#1976D2',
    borderRadius: 8
  },

  botaoTexto: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});