import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { FinanceiroService } from '../../services/financeiro.service';
import { FormLancamentoComponent } from '../../components/form-lancamento/form-lancamento.component';
import { TabelaRegistrosComponent } from '../../components/tabela-registros/tabela-registros.component';
import { Registro } from '../../models/registro.model';

Chart.register(...registerables);

@Component({
  selector: 'app-investimentos',
  imports: [CurrencyPipe, FormLancamentoComponent, TabelaRegistrosComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Investimentos</h1>
          <p class="page-sub">Acompanhe e registre seus aportes</p>
        </div>
      </div>

      <!-- Cards de resumo -->
      <div class="invest-cards">
        <div class="invest-card" id="card-total-investido">
          <div class="ic-label">Total Investido (Histórico)</div>
          <div class="ic-value">{{ totalHistorico() | currency: 'BRL' : 'symbol' : '1.2-2' }}</div>
        </div>
        <div class="invest-card invest-card-mes">
          <div class="ic-label">Aportes este Mês</div>
          <div class="ic-value">{{ totalMes() | currency: 'BRL' : 'symbol' : '1.2-2' }}</div>
        </div>
        <div class="invest-card">
          <div class="ic-label">Nº de Aportes</div>
          <div class="ic-value">{{ totalRegistros() }}</div>
        </div>
      </div>

      <div class="layout">
        <!-- Form para investimento somente -->
        <div class="col-form">
          <app-form-lancamento (registroAdicionado)="onAdicionar($event)"></app-form-lancamento>
        </div>

        <div class="col-right">
          <!-- Gráfico -->
          <div class="chart-card">
            <h3 class="section-title">Aportes por Categoria</h3>
            <div class="chart-wrapper">
              <canvas id="chart-investimentos"></canvas>
            </div>
          </div>

          <!-- Tabela somente investimentos -->
          <app-tabela-registros
            [registros]="investimentos()"
            (deletarRegistro)="onDeletar($event)"
          ></app-tabela-registros>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 1.5rem; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
      .page-title { font-size: 1.75rem; font-weight: 800; color: white; }
      .page-sub { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-top: 0.2rem; }

      .invest-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
      @media (max-width: 768px) { .invest-cards { grid-template-columns: 1fr; } }

      .invest-card {
        background: rgba(168,85,247,0.08);
        border: 1px solid rgba(168,85,247,0.2);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
      }
      .invest-card-mes { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
      .ic-label { font-size: 0.8125rem; font-weight: 500; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
      .ic-value { font-size: 1.625rem; font-weight: 800; color: #a855f7; }
      .invest-card-mes .ic-value { color: #6366f1; }

      .layout { display: grid; grid-template-columns: 380px 1fr; gap: 1.25rem; align-items: start; }
      @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }
      .col-form { position: sticky; top: 80px; }
      @media (max-width: 1024px) { .col-form { position: static; } }

      .col-right { display: flex; flex-direction: column; gap: 1rem; }
      .section-title { font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.85); }
      .chart-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
      }
      .chart-wrapper { height: 220px; margin-top: 1rem; }
    `,
  ],
})
export class InvestimentosPage implements OnInit {
  private svc = inject(FinanceiroService);

  private todos = signal<Registro[]>([]);

  investimentos = computed(() =>
    this.todos().filter((r) => r.tipo === 'investimento')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
  );

  totalHistorico = computed(() =>
    this.investimentos().reduce((acc, r) => acc + r.valor, 0),
  );

  totalMes = computed(() => {
    const hoje = new Date();
    return this.investimentos()
      .filter((r) => {
        const d = new Date(r.data + 'T00:00:00');
        return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth();
      })
      .reduce((acc, r) => acc + r.valor, 0);
  });

  totalRegistros = computed(() => this.investimentos().length);

  private pieChart: Chart | null = null;

  ngOnInit(): void {
    this.todos.set([...this.svc.registros()]);
    setTimeout(() => this.renderChart(), 50);
  }

  onAdicionar(dados: Omit<Registro, 'id'>): void {
    const novo = { ...dados, tipo: 'investimento' as const };
    this.svc.adicionarRegistro(novo);
    this.todos.set([...this.svc.registros()]);
    setTimeout(() => this.renderChart(), 50);
  }

  onDeletar(id: string): void {
    this.svc.removerRegistro(id);
    this.todos.set([...this.svc.registros()]);
    setTimeout(() => this.renderChart(), 50);
  }

  private renderChart(): void {
    const ctx = document.getElementById('chart-investimentos') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.pieChart) this.pieChart.destroy();

    const cats = this.svc.getCategoriasPorTipo('investimento', this.investimentos());
    const colors = ['#a855f7', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#84cc16'];

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cats.map((c) => c.categoria),
        datasets: [{
          data: cats.map((c) => c.total),
          backgroundColor: colors.slice(0, cats.length),
          borderColor: 'rgba(0,0,0,0)',
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12, boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => ` ${this.svc.formatCurrency(c.parsed as number)}` } },
        },
        cutout: '60%',
      },
    });
  }
}
