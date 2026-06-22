import React, { createContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarEntrada, registrarSaida } from './registrosService';



export const MonitoramentoContext = createContext();

export function MonitoramentoProvider({ children }) {

  const [dentroGlobal, setDentroGlobal] = useState(false);
  const [dispositivoId, setDispositivoId] = useState(null);

  useEffect(() => {
    async function carregarId() {
      try {
        let idSalvo;

        if (Platform.OS === 'web') {
          idSalvo = localStorage.getItem('dispositivoId');

          if (!idSalvo) {
            idSalvo =
              (crypto.randomUUID && crypto.randomUUID()) ||
              Math.random().toString(36).substring(2);

            localStorage.setItem('dispositivoId', idSalvo);
          }
        }

        else {
          idSalvo = await AsyncStorage.getItem('dispositivoId');

          if (!idSalvo) {
            idSalvo = Math.random().toString(36).substring(2);
            await AsyncStorage.setItem('dispositivoId', idSalvo);
          }
        }

        setDispositivoId(idSalvo);

      } catch (error) {
        console.error('Erro ao carregar dispositivoId:', error);
      }
    }

    carregarId();
  }, []);

  const entrou = useCallback(async (hospitalId) => {
    if (!dispositivoId) return;

    try {
      await registrarEntrada(dispositivoId, hospitalId);
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
    }
  }, [dispositivoId]);

  const saiu = useCallback(async (hospitalId) => {
    if (!dispositivoId) return;

    try {
      await registrarSaida(dispositivoId, hospitalId);
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
    }
  }, [dispositivoId]);

  return (
    <MonitoramentoContext.Provider
      value={{
        entrou,
        saiu,
        dentroGlobal,
        setDentroGlobal,
        dispositivoId 
      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  );
}