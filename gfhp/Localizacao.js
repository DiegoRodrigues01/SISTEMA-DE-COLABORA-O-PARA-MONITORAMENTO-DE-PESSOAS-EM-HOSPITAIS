import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Linking, Platform } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  Chip, 
  Divider,
  IconButton,
  Surface
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const originalConsoleWarn = console.warn;
console.warn = (message) => {
  if (message.includes('activateKeepAwake') || message.includes('IDBObjectStore')) {
    return;
  }
  originalConsoleWarn(message);
};

export default function AtivarLocalizacao({ irParaMonitoramento }) {
  const [permissaoStatus, setPermissaoStatus] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null);
  const [endereco, setEndereco] = useState(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);

  useEffect(() => {
    verificarPermissaoAtual();
  }, []);

  useEffect(() => {
    if (permissaoStatus === 'granted') {
      obterLocalizacaoAtual();
    }
  }, [permissaoStatus]);

  const obterLocalizacaoAtual = async () => {
    try {
      setCarregandoLocalizacao(true);
      
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização não concedida');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
        maximumAge: 10000,
      });

      setLocalizacaoAtual(location);

      try {
        const enderecoReverso = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (enderecoReverso && enderecoReverso.length > 0) {
          setEndereco(enderecoReverso[0]);
        }
      } catch (error) {
        console.log('Erro ao obter endereço:', error);
      }

    } catch (error) {
      Alert.alert(
        'Erro', 
        'Não foi possível obter sua localização.'
      );
    } finally {
      setCarregandoLocalizacao(false);
    }
  };

  const verificarPermissaoAtual = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissaoStatus(status);
  };

  const pedirPermissaoLocalizacao = async () => {
    try {
      setCarregando(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissaoStatus(status);

      if (status === 'granted') {
        obterLocalizacaoAtual();
      } else if (status === 'denied') {
        Alert.alert(
          'Permissão Negada',
          'A localização foi negada.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: abrirConfiguracoes }
          ]
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  const abrirConfiguracoes = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getStatusChip = () => {
    switch (permissaoStatus) {
      case 'granted':
        return <Chip icon="check-circle" style={{ backgroundColor: '#4CAF50' }}>Ativada</Chip>;
      case 'denied':
        return <Chip icon="close-circle" style={{ backgroundColor: '#F44336' }}>Negada</Chip>;
      default:
        return <Chip>Verificando...</Chip>;
    }
  };

  const formatarEndereco = () => {
    if (!endereco) return 'Endereço não disponível';
    return `${endereco.street || ''}, ${endereco.city || ''} - ${endereco.region || ''}`;
  };

  const formatarCoordenadas = () => {
    if (!localizacaoAtual) return '';
    const { latitude, longitude } = localizacaoAtual.coords;
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>

        <Surface style={{ padding: 20, borderRadius: 12, marginBottom: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={48} color="#2196F3" />
            <Title>Localização</Title>
            {getStatusChip()}
          </View>
        </Surface>

        {permissaoStatus !== 'granted' && (
          <Card>
            <Card.Content>
              <Title>Permissão Necessária</Title>
              <Paragraph>
                Ative a localização para continuar.
              </Paragraph>
              <Button
                mode="contained"
                onPress={pedirPermissaoLocalizacao}
                loading={carregando}
              >
                Ativar Localização
              </Button>
            </Card.Content>
          </Card>
        )}

        {carregandoLocalizacao && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}

        {localizacaoAtual && (
          <Card style={{ marginTop: 16 }}>
            <Card.Content>
              <Title>📍 Localização Encontrada</Title>

              <Divider style={{ marginVertical: 12 }} />

              <Text><Text style={{ fontWeight: 'bold' }}>Endereço:</Text> {formatarEndereco()}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Coordenadas:</Text> {formatarCoordenadas()}</Text>

              <Divider style={{ marginVertical: 16 }} />
              <Button
                mode="contained"
                icon="chart-line"
                onPress={irParaMonitoramento}
              >
                Tempo de atendimento 
              </Button>
            </Card.Content>
          </Card>
        )}

      </View>
    </ScrollView>
  );
}
