import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LabelList,
  } from 'recharts';
  
  const dados = [
    { tipo: 'Sugestões', total: 12 },
    { tipo: 'Críticas', total: 7 },
    { tipo: 'Pedidos de Ajuda', total: 5 },
  ];
  
  const cores = {
    'Sugestões': '#22c55e',
    'Críticas': '#facc15',
    'Pedidos de Ajuda': '#dc2626',
  };
  
  export function HomeDashboard() {
    return (
      <>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Distribuição de mensagens</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dados}>
              <XAxis dataKey="tipo" interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total">
                {dados.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={cores[entry.tipo as keyof typeof cores]} />
                ))}
                <LabelList dataKey="total" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
  
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Proporção por tipo</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dados}
                dataKey="total"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ value }) => value}
              >
                {dados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[entry.tipo as keyof typeof cores]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }
  