export type TipoRegistro = 'entrada' | 'saida' | 'investimento';

export type StatusMeta = 'positivo' | 'alerta' | 'negativo';

export interface Registro {
  id: string;
  descricao: string;
  tipo: TipoRegistro;
  categoria: string;
  data: string; // ISO date string YYYY-MM-DD
  valor: number;
}

export interface PerfilFinanceiro {
  nome: string;
  descricao: string;
  percentualMaximo: number; // 0-100
  cor: string;
}

export interface ProjecaoMeta {
  teto: number;
  gastoAtual: number;
  saldoMeta: number;
  diasRestantes: number;
  margemDiaria: number;
  status: StatusMeta;
  mensagem: string;
  percentualGasto: number;
}

export interface ResumoMes {
  totalEntradas: number;
  totalSaidas: number;
  totalInvestimentos: number;
  saldoAtual: number;
}

export const PERFIS_FINANCEIROS: PerfilFinanceiro[] = [
  {
    nome: 'Conservador',
    descricao: 'Até 50% das entradas em gastos — ideal para quem prioriza poupança',
    percentualMaximo: 50,
    cor: '#10b981',
  },
  {
    nome: 'Moderado',
    descricao: 'Até 70% das entradas em gastos — equilíbrio entre consumo e reserva',
    percentualMaximo: 70,
    cor: '#f59e0b',
  },
  {
    nome: 'Arrojado',
    descricao: 'Até 90% das entradas em gastos — maior flexibilidade de consumo',
    percentualMaximo: 90,
    cor: '#ef4444',
  },
];

export const CATEGORIAS_POR_TIPO: Record<TipoRegistro, string[]> = {
  entrada: ['Salário', 'Freelance', 'Aluguel recebido', 'Dividendos', 'Bônus', 'Outros'],
  saida: [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Assinaturas',
    'Outros',
  ],
  investimento: ['Ações', 'Fundos', 'CDB/LCI/LCA', 'Tesouro Direto', 'Criptomoedas', 'Outros'],
};
