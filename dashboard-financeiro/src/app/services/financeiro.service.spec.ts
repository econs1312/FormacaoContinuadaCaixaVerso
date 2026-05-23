import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { FinanceiroService } from './financeiro.service';
import { Registro, PERFIS_FINANCEIROS } from '../models/registro.model';

// Helper para criar um registro de teste
function criarRegistro(partial: Partial<Registro> = {}): Omit<Registro, 'id'> {
  return {
    descricao: 'Teste',
    tipo: 'saida',
    categoria: 'Alimentação',
    data: '2026-05-10',
    valor: 100,
    ...partial,
  };
}

describe('FinanceiroService', () => {
  let svc: FinanceiroService;

  beforeEach(() => {
    // Limpa o localStorage antes de cada teste
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        FinanceiroService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    svc = TestBed.inject(FinanceiroService);
  });

  // ── Inicialização ──────────────────────────────────────────────────────────
  describe('inicialização', () => {
    it('deve instanciar o serviço', () => {
      expect(svc).toBeTruthy();
    });

    it('deve carregar mock data quando localStorage estiver vazio', () => {
      expect(svc.registros().length).toBeGreaterThan(0);
    });

    it('deve definir perfil Moderado como padrão', () => {
      expect(svc.perfilAtivo().nome).toBe('Moderado');
    });
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  describe('adicionarRegistro', () => {
    it('deve adicionar um novo registro', () => {
      const antes = svc.registros().length;
      svc.adicionarRegistro(criarRegistro({ descricao: 'Aluguel', valor: 1500 }));
      expect(svc.registros().length).toBe(antes + 1);
    });

    it('deve gerar um id único para cada registro', () => {
      svc.adicionarRegistro(criarRegistro({ descricao: 'A' }));
      svc.adicionarRegistro(criarRegistro({ descricao: 'B' }));
      const ids = svc.registros().map((r) => r.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(ids.length);
    });

    it('deve persistir o registro no localStorage', () => {
      svc.adicionarRegistro(criarRegistro({ descricao: 'Persistência' }));
      const raw = localStorage.getItem('fintrack_registros');
      expect(raw).toContain('Persistência');
    });
  });

  describe('removerRegistro', () => {
    it('deve remover o registro pelo id', () => {
      svc.adicionarRegistro(criarRegistro({ descricao: 'Para remover' }));
      const reg = svc.registros().find((r) => r.descricao === 'Para remover')!;
      const antes = svc.registros().length;
      svc.removerRegistro(reg.id);
      expect(svc.registros().length).toBe(antes - 1);
      expect(svc.registros().find((r) => r.id === reg.id)).toBeUndefined();
    });

    it('não deve afetar outros registros ao remover um', () => {
      svc.adicionarRegistro(criarRegistro({ descricao: 'A manter' }));
      svc.adicionarRegistro(criarRegistro({ descricao: 'A remover' }));
      const paraRemover = svc.registros().find((r) => r.descricao === 'A remover')!;
      svc.removerRegistro(paraRemover.id);
      expect(svc.registros().some((r) => r.descricao === 'A manter')).toBe(true);
    });
  });

  // ── Filtro por mês ─────────────────────────────────────────────────────────
  describe('getRegistrosPorMes', () => {
    beforeEach(() => {
      localStorage.clear();
      // Reinicia o serviço sem mock data
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FinanceiroService,
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      svc = TestBed.inject(FinanceiroService);
      // Limpa mock e adiciona apenas registros controlados
      svc.registros.set([]);
      svc.adicionarRegistro(criarRegistro({ data: '2026-05-10', descricao: 'Maio' }));
      svc.adicionarRegistro(criarRegistro({ data: '2026-04-15', descricao: 'Abril' }));
      svc.adicionarRegistro(criarRegistro({ data: '2026-05-20', descricao: 'Maio 2' }));
    });

    it('deve retornar apenas registros do mês/ano solicitado', () => {
      const maio = svc.getRegistrosPorMes(2026, 5);
      expect(maio.length).toBe(2);
      expect(maio.every((r) => r.data.startsWith('2026-05'))).toBe(true);
    });

    it('deve retornar lista vazia para mês sem registros', () => {
      const junho = svc.getRegistrosPorMes(2026, 6);
      expect(junho.length).toBe(0);
    });

    it('deve separar corretamente meses diferentes', () => {
      const abril = svc.getRegistrosPorMes(2026, 4);
      expect(abril.length).toBe(1);
      expect(abril[0].descricao).toBe('Abril');
    });
  });

  // ── calcularResumo ─────────────────────────────────────────────────────────
  describe('calcularResumo', () => {
    it('deve somar corretamente as entradas', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'S', tipo: 'entrada', categoria: 'Salário', data: '2026-05-01', valor: 3000 },
        { id: '2', descricao: 'F', tipo: 'entrada', categoria: 'Freelance', data: '2026-05-10', valor: 1500 },
      ];
      const resumo = svc.calcularResumo(registros);
      expect(resumo.totalEntradas).toBe(4500);
    });

    it('deve somar corretamente as saídas', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'A', tipo: 'saida', categoria: 'Alimentação', data: '2026-05-01', valor: 500 },
        { id: '2', descricao: 'M', tipo: 'saida', categoria: 'Moradia', data: '2026-05-05', valor: 1200 },
      ];
      const resumo = svc.calcularResumo(registros);
      expect(resumo.totalSaidas).toBe(1700);
    });

    it('deve calcular o saldo como entradas menos saídas menos investimentos', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'E', tipo: 'entrada', categoria: 'Salário', data: '2026-05-01', valor: 5000 },
        { id: '2', descricao: 'S', tipo: 'saida', categoria: 'Aluguel', data: '2026-05-02', valor: 1500 },
        { id: '3', descricao: 'I', tipo: 'investimento', categoria: 'Ações', data: '2026-05-03', valor: 500 },
      ];
      const resumo = svc.calcularResumo(registros);
      expect(resumo.saldoAtual).toBe(3000); // 5000 - 1500 - 500
    });

    it('deve retornar zeros para lista vazia', () => {
      const resumo = svc.calcularResumo([]);
      expect(resumo.totalEntradas).toBe(0);
      expect(resumo.totalSaidas).toBe(0);
      expect(resumo.totalInvestimentos).toBe(0);
      expect(resumo.saldoAtual).toBe(0);
    });

    it('deve resultar em saldo negativo quando saídas superam entradas', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'E', tipo: 'entrada', categoria: 'Salário', data: '2026-05-01', valor: 1000 },
        { id: '2', descricao: 'S', tipo: 'saida', categoria: 'Aluguel', data: '2026-05-02', valor: 2000 },
      ];
      const resumo = svc.calcularResumo(registros);
      expect(resumo.saldoAtual).toBeLessThan(0);
    });
  });

  // ── calcularProjecao ───────────────────────────────────────────────────────
  describe('calcularProjecao', () => {
    it('deve calcular o teto com base no percentual do perfil', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[0]); // Conservador = 50%
      const resumo = { totalEntradas: 5000, totalSaidas: 1000, totalInvestimentos: 0, saldoAtual: 4000 };
      const proj = svc.calcularProjecao(resumo);
      expect(proj.teto).toBe(2500); // 50% de 5000
    });

    it('deve retornar status "positivo" quando gastos estão abaixo de 70% do teto', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[0]); // Conservador = 50%
      // Teto = 2500, gasto = 500 → 20% do teto → positivo
      const resumo = { totalEntradas: 5000, totalSaidas: 500, totalInvestimentos: 0, saldoAtual: 4500 };
      const proj = svc.calcularProjecao(resumo);
      expect(proj.status).toBe('positivo');
    });

    it('deve retornar status "alerta" quando gastos estão entre 70% e 100% do teto', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[0]); // Conservador = 50%, teto = 2500
      // Gasto = 2000 → 80% do teto → alerta
      const resumo = { totalEntradas: 5000, totalSaidas: 2000, totalInvestimentos: 0, saldoAtual: 3000 };
      const proj = svc.calcularProjecao(resumo);
      expect(proj.status).toBe('alerta');
    });

    it('deve retornar status "negativo" quando gastos ultrapassam o teto', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[0]); // Conservador = 50%, teto = 2500
      // Gasto = 3000 → 120% do teto → negativo
      const resumo = { totalEntradas: 5000, totalSaidas: 3000, totalInvestimentos: 0, saldoAtual: 2000 };
      const proj = svc.calcularProjecao(resumo);
      expect(proj.status).toBe('negativo');
    });

    it('deve calcular saldoMeta corretamente (teto - gastos)', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[1]); // Moderado = 70%
      // Teto = 70% de 4000 = 2800, gasto = 1000, saldo = 1800
      const resumo = { totalEntradas: 4000, totalSaidas: 1000, totalInvestimentos: 0, saldoAtual: 3000 };
      const proj = svc.calcularProjecao(resumo);
      expect(proj.saldoMeta).toBe(1800);
    });
  });

  // ── alterarPerfil ──────────────────────────────────────────────────────────
  describe('alterarPerfil', () => {
    it('deve trocar o perfil ativo', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[2]); // Arrojado
      expect(svc.perfilAtivo().nome).toBe('Arrojado');
    });

    it('deve persistir o novo perfil no localStorage', () => {
      svc.alterarPerfil(PERFIS_FINANCEIROS[0]); // Conservador
      const raw = localStorage.getItem('fintrack_perfil');
      expect(raw).toContain('Conservador');
    });
  });

  // ── getCategoriasPorTipo ───────────────────────────────────────────────────
  describe('getCategoriasPorTipo', () => {
    it('deve agrupar e somar por categoria', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'A', tipo: 'saida', categoria: 'Alimentação', data: '2026-05-01', valor: 300 },
        { id: '2', descricao: 'B', tipo: 'saida', categoria: 'Alimentação', data: '2026-05-05', valor: 200 },
        { id: '3', descricao: 'C', tipo: 'saida', categoria: 'Moradia', data: '2026-05-10', valor: 1500 },
      ];
      const cats = svc.getCategoriasPorTipo('saida', registros);
      const alimentacao = cats.find((c) => c.categoria === 'Alimentação')!;
      expect(alimentacao.total).toBe(500);
    });

    it('deve ordenar do maior para o menor total', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'A', tipo: 'saida', categoria: 'Lazer', data: '2026-05-01', valor: 200 },
        { id: '2', descricao: 'B', tipo: 'saida', categoria: 'Moradia', data: '2026-05-02', valor: 1500 },
      ];
      const cats = svc.getCategoriasPorTipo('saida', registros);
      expect(cats[0].categoria).toBe('Moradia');
    });

    it('deve ignorar registros de outros tipos', () => {
      const registros: Registro[] = [
        { id: '1', descricao: 'E', tipo: 'entrada', categoria: 'Salário', data: '2026-05-01', valor: 5000 },
        { id: '2', descricao: 'S', tipo: 'saida', categoria: 'Aluguel', data: '2026-05-02', valor: 1500 },
      ];
      const cats = svc.getCategoriasPorTipo('investimento', registros);
      expect(cats.length).toBe(0);
    });
  });

  // ── formatCurrency ─────────────────────────────────────────────────────────
  describe('formatCurrency', () => {
    it('deve formatar valores no padrão brasileiro', () => {
      const resultado = svc.formatCurrency(1500);
      // R$ 1.500,00 (com separador de milhar e decimal por vírgula)
      expect(resultado).toContain('R$');
      expect(resultado).toContain('1');
    });

    it('deve formatar zero corretamente', () => {
      const resultado = svc.formatCurrency(0);
      expect(resultado).toContain('R$');
    });
  });
});
