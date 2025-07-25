const mensagensInbox = [
    { id: 1, remetente: 'João Silva', assunto: 'Dúvida sobre férias', tipo: 'Pedido de Ajuda', data: '2025-07-20' },
    { id: 2, remetente: 'Maria Oliveira', assunto: 'Sugestão de melhoria no ambiente', tipo: 'Sugestão', data: '2025-07-19' },
    { id: 3, remetente: 'Carlos Souza', assunto: 'Crítica à comunicação interna', tipo: 'Crítica', data: '2025-07-18' },
  ];
  
  export function CaixaDeEntrada() {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Caixa de Entrada</h2>
        <ul className="divide-y divide-gray-200">
          {mensagensInbox.map((msg) => (
            <li key={msg.id} className="py-3">
              <div className="font-medium">{msg.assunto}</div>
              <div className="text-sm text-gray-500">{msg.remetente} · {msg.tipo} · {msg.data}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  