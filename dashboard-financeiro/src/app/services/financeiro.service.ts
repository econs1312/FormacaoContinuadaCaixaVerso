import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Registro,
  PerfilFinanceiro,
  ProjecaoMeta,
  ResumoMes,
  PERFIS_FINANCEIROS,
} from '../models/registro.model';

const STORAGE_KEY = 'fintrack_registros';
const PERFIL_KEY = 'fintrack_perfil';

const MOCK_DATA: Registro[] = [
  {
    id: crypto.randomUUID(),
    descricao: 'Salário Maio',
    tipo: 'entrada',
    categoria: 'Salário',
    data: '2026-05-05',
    valor: 5000,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Freelance Design',
    tipo: 'entrada',
    categoria: 'Freelance',
    data: '2026-05-10',
    valor: 1200,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Aluguel',
    tipo: 'saida',
    categoria: 'Moradia',
    data: '2026-05-01',
    valor: 1500,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Supermercado',
    tipo: 'saida',
    categoria: 'Alimentação',
    data: '2026-05-08',
    valor: 480,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Combustível',
    tipo: 'saida',
    categoria: 'Transporte',
    data: '2026-05-12',
    valor: 220,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Netflix / Spotify',
    tipo: 'saida',
    categoria: 'Assinaturas',
    data: '2026-05-07',
    valor: 75,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Restaurante com amigos',
    tipo: 'saida',
    categoria: 'Lazer',
    data: '2026-05-14',
    valor: 160,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Academia',
    tipo: 'saida',
    categoria: 'Saúde',
    data: '2026-05-03',
    valor: 120,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Tesouro Selic',
    tipo: 'investimento',
    categoria: 'Tesouro Direto',
    data: '2026-05-06',
    valor: 500,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Aporte MXRF11',
    tipo: 'investimento',
    categoria: 'Fundos',
    data: '2026-05-11',
    valor: 300,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Salário Abril',
    tipo: 'entrada',
    categoria: 'Salário',
    data: '2026-04-05',
    valor: 5000,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Conta de Luz Abril',
    tipo: 'saida',
    categoria: 'Moradia',
    data: '2026-04-10',
    valor: 200,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'Supermercado Abril',
    tipo: 'saida',
    categoria: 'Alimentação',
    data: '2026-04-15',
    valor: 520,
  },
  {
    id: crypto.randomUUID(),
    descricao: 'CDB Banco Inter Abril',
    tipo: 'investimento',
    categoria: 'CDB/LCI/LCA',
    data: '2026-04-20',
    valor: 800,
  },
];

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private isBrowser: boolean;

  // --- Signals ---
  registros = signal<Registro[]>([]);
  perfilAtivo = signal<PerfilFinanceiro>(PERFIS_FINANCEIROS[1]); // Moderado default

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.carregarDados();
  }

  // ── Persistência ──────────────────────────────────────────────────────────
  private carregarDados(): void {
    if (!this.isBrowser) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      this.registros.set(JSON.parse(raw));
    } else {
      this.registros.set(MOCK_DATA);
      this.salvarRegistros();
    }

    const perfilRaw = localStorage.getItem(PERFIL_KEY);
    if (perfilRaw) {
      this.perfilAtivo.set(JSON.parse(perfilRaw));
    }
  }

  private salvarRegistros(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.registros()));
  }

  private salvarPerfil(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfilAtivo()));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  adicionarRegistro(registro: Omit<Registro, 'id'>): void {
    const novo: Registro = { id: crypto.randomUUID(), ...registro };
    this.registros.update((lista) => [novo, ...lista]);
    this.salvarRegistros();
  }

  removerRegistro(id: string): void {
    this.registros.update((lista) => lista.filter((r) => r.id !== id));
    this.salvarRegistros();
  }

  alterarPerfil(perfil: PerfilFinanceiro): void {
    this.perfilAtivo.set(perfil);
    this.salvarPerfil();
  }

  // ── Queries ───────────────────────────────────────────────────────────────
  getRegistrosPorMes(ano: number, mes: number): Registro[] {
    return this.registros().filter((r) => {
      const d = new Date(r.data + 'T00:00:00');
      return d.getFullYear() === ano && d.getMonth() + 1 === mes;
    });
  }

  calcularResumo(registros: Registro[]): ResumoMes {
    const totalEntradas = registros
      .filter((r) => r.tipo === 'entrada')
      .reduce((acc, r) => acc + r.valor, 0);

    const totalSaidas = registros
      .filter((r) => r.tipo === 'saida')
      .reduce((acc, r) => acc + r.valor, 0);

    const totalInvestimentos = registros
      .filter((r) => r.tipo === 'investimento')
      .reduce((acc, r) => acc + r.valor, 0);

    return {
      totalEntradas,
      totalSaidas,
      totalInvestimentos,
      saldoAtual: totalEntradas - totalSaidas - totalInvestimentos,
    };
  }

  calcularProjecao(resumo: ResumoMes): ProjecaoMeta {
    const perfil = this.perfilAtivo();
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
    const diasRestantes = ultimoDia - hoje.getDate();

    const teto = (perfil.percentualMaximo / 100) * resumo.totalEntradas;
    const gastoAtual = resumo.totalSaidas;
    const saldoMeta = teto - gastoAtual;
    const margemDiaria = diasRestantes > 0 ? saldoMeta / diasRestantes : saldoMeta;
    const percentualGasto = resumo.totalEntradas > 0 ? (gastoAtual / teto) * 100 : 0;

    let status: 'positivo' | 'alerta' | 'negativo';
    let mensagem: string;

    if (percentualGasto <= 70) {
      status = 'positivo';
      mensagem = '✅ Parabéns! Você está dentro da meta. Continue assim!';
    } else if (percentualGasto <= 100) {
      status = 'alerta';
      mensagem = '⚠️ Atenção! Você está se aproximando do limite do seu perfil.';
    } else {
      status = 'negativo';
      mensagem = '🚨 Limite ultrapassado! Seus gastos excederam o teto do perfil.';
    }

    return {
      teto,
      gastoAtual,
      saldoMeta,
      diasRestantes,
      margemDiaria,
      status,
      mensagem,
      percentualGasto: Math.min(percentualGasto, 100),
    };
  }

  getMesesDisponiveis(): { ano: number; mes: number; label: string }[] {
    const set = new Set<string>();
    const resultado: { ano: number; mes: number; label: string }[] = [];
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    this.registros().forEach((r) => {
      const d = new Date(r.data + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!set.has(key)) {
        set.add(key);
        resultado.push({
          ano: d.getFullYear(),
          mes: d.getMonth() + 1,
          label: `${meses[d.getMonth()]} ${d.getFullYear()}`,
        });
      }
    });

    return resultado.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });
  }

  getCategoriasPorTipo(
    tipo: string,
    registros: Registro[],
  ): { categoria: string; total: number }[] {
    const filtered = registros.filter((r) => r.tipo === tipo);
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      map.set(r.categoria, (map.get(r.categoria) || 0) + r.valor);
    });
    return Array.from(map.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }

  getPerfis(): PerfilFinanceiro[] {
    return PERFIS_FINANCEIROS;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
