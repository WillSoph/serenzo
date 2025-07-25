const mensagensEnviadas = [
  { id: 6, destinatario: 'Recursos Humanos', assunto: 'Solicitação de folga', tipo: 'Pedido de Ajuda', data: '2025-07-15' },
  { id: 7, destinatario: 'Time de Comunicação', assunto: 'Ideia para mural interno', tipo: 'Sugestão', data: '2025-07-14' },
];

export function MensagensEnviadas() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Mensagens Enviadas</h2>
      <ul className="divide-y divide-gray-200">
        {mensagensEnviadas.map((msg) => (
          <li key={msg.id} className="py-3">
            <div className="font-medium">{msg.assunto}</div>
            <div className="text-sm text-gray-500">{msg.destinatario} · {msg.tipo} · {msg.data}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
