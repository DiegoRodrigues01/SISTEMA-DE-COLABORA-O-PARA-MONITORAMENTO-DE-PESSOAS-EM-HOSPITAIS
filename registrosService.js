const FIREBASE_URL =
  'https://firestore.googleapis.com/v1/projects/gfhp-fdd48/databases/(default)/documents';

const _saidaEmAndamento = new Set();

export async function registrarEntrada(dispositivoId, hospitalId) {
  try {
    const resp = await fetch(`${FIREBASE_URL}/registros`);
    const data = await resp.json();

    const registroAtivo = data.documents?.find((doc) => {
      const f = doc.fields;

      return (
        f.dispositivoId?.stringValue === dispositivoId &&
        f.hospitalId?.stringValue === hospitalId &&
        f.ativo?.booleanValue === true
      );
    });

    if (registroAtivo) return;

    const resposta = await fetch(`${FIREBASE_URL}/registros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        fields: {
          dispositivoId: {
            stringValue: dispositivoId
          },

          hospitalId: {
            stringValue: hospitalId
          },

          entrada: {
            integerValue: Date.now().toString()
          },

          saida: {
            nullValue: null
          },

          ativo: {
            booleanValue: true
          }
        }
      })
    });

    if (!resposta.ok) {
      console.log('Erro ao registrar entrada');
    }

  } catch (error) {
    console.log('Erro registrarEntrada:', error);
  }
}

export async function registrarSaida(dispositivoId, hospitalId) {
  const chave = `${dispositivoId}_${hospitalId}`;

  if (_saidaEmAndamento.has(chave)) return;

  _saidaEmAndamento.add(chave);

  try {
    const resp = await fetch(`${FIREBASE_URL}/registros`);
    const data = await resp.json();

    const registroAtivo = data.documents?.find((doc) => {
      const f = doc.fields;

      return (
        f.dispositivoId?.stringValue === dispositivoId &&
        f.hospitalId?.stringValue === hospitalId &&
        f.ativo?.booleanValue === true
      );
    });

    if (!registroAtivo) {
      console.log('Nenhum registro ativo encontrado');
      return;
    }

    const documentId =
      registroAtivo.name.split('/').pop();

    const resposta = await fetch(
      `${FIREBASE_URL}/registros/${documentId}?updateMask.fieldPaths=saida&updateMask.fieldPaths=ativo`,
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          fields: {
            saida: {
              integerValue: Date.now().toString()
            },

            ativo: {
              booleanValue: false
            }
          }
        })
      }
    );

    if (!resposta.ok) {
      console.log('Erro ao atualizar saída');
    }

  } catch (error) {
    console.log('Erro registrarSaida:', error);
  } finally {
    _saidaEmAndamento.delete(chave);
  }
}