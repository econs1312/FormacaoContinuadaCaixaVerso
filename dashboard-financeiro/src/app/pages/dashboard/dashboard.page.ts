import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { Chart, registerables } from 'chart.js';
import { FinanceiroService } from '../../services/financeiro.service';
import { Registro } from '../../models/registro.model';
import { CardsResumoComponent } from '../../components/cards-resumo/cards-resumo.component';
import { TabelaRegistrosComponent } from '../../components/tabela-registros/tabela-registros.component';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CardsResumoComponent, TabelaRegistrosComponent, FormsModule],
  template: `
    <div class="page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Visão consolidada das suas finanças</p>
        </div>
        <!-- Filtros -->
        <div class="filtros">
          <select class="select-filtro" [(ngModel)]="mesSelecionado" (ngModelChange)="aplicarFiltros()" id="select-mes">
            @for (m of mesesDisponiveis(); track m.label) {
              <option [value]="m.ano + '-' + m.mes">{{ m.label }}</option>
            }
          </select>
          <select class="select-filtro" [(ngModel)]="categoriaFiltro" (ngModelChange)="aplicarFiltros()" id="select-categoria">
            <option value="">Todas as categorias</option>
            @for (cat of categoriasDisponiveis(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Cards -->
      <app-cards-resumo [resumo]="resumo()"></app-cards-resumo>

      <!-- Charts + Tabela -->
      <div class="content-grid">
        <!-- Chart -->
        <div class="chart-card">
          <h3 class="section-title">Despesas por Categoria</h3>
          <div class="chart-wrapper">
            <canvas id="chart-categorias"></canvas>
          </div>
          @if (semDados()) {
            <div class="chart-empty">Sem despesas no período selecionado</div>
          }
        </div>

        <!-- Bar chart -->
        <div class="chart-card">
          <h3 class="section-title">Distribuição Financeira</h3>
          <div class="chart-wrapper">
            <canvas id="chart-distribuicao"></canvas>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="section">
        <h3 class="section-title">Registros do Período</h3>
        <app-tabela-registros
          [registros]="registrosFiltrados()"
          (deletarRegistro)="onDeletar($event)"
        ></app-tabela-registros>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 1.5rem; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
      .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
      .page-title { font-size: 1.75rem; font-weight: 800; color: white; }
      .page-sub { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-top: 0.2rem; }
      .filtros { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .select-filtro {
        padding: 0.5rem 0.875rem;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: white;
        font-size: 0.875rem;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;
      }
      .select-filtro:focus { border-color: rgba(99,102,241,0.5); }
      .select-filtro option { background: #1a1a2e; }

      .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

      .chart-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        position: relative;
      }
      .chart-wrapper { height: 240px; margin-top: 1rem; }
      .chart-empty {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.3);
        font-size: 0.9rem;
      }
      .section-title { font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.85); }
      .section { display: flex; flex-direction: column; gap: 0.75rem; }
    `,
  ],
})
export class DashboardPage implements OnInit {
  private svc = inject(FinanceiroService);

  mesSelecionado = '';
  categoriaFiltro = '';

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  mesesDisponiveis = computed(() => this.svc.getMesesDisponiveis());

  private registrosMes = signal<Registro[]>([]);

  resumo = computed(() => this.svc.calcularResumo(this.registrosMes()));

  registrosFiltrados = computed(() => {
    let lista = this.registrosMes();
    if (this.categoriaFiltro) {
      lista = lista.filter((r) => r.categoria === this.categoriaFiltro);
    }
    return lista;
  });

  categoriasDisponiveis = computed(() => {
    const set = new Set(this.registrosMes().map((r) => r.categoria));
    return Array.from(set).sort();
  });

  semDados = computed(() => this.resumo().totalSaidas === 0);

  ngOnInit(): void {
    const meses = this.mesesDisponiveis();
    if (meses.length > 0) {
      const m = meses[0];
      this.mesSelecionado = `${m.ano}-${m.mes}`;
    }
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (!this.mesSelecionado) return;
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    this.registrosMes.set(this.svc.getRegistrosPorMes(ano, mes));
    this.categoriaFiltro = '';
    setTimeout(() => this.renderCharts(), 50);
  }

  onDeletar(id: string): void {
    this.svc.removerRegistro(id);
    const [ano, mes] = this.mesSelecionado.split('-').map(Number);
    this.registrosMes.set(this.svc.getRegistrosPorMes(ano, mes));
    setTimeout(() => this.renderCharts(), 50);
  }

  private renderCharts(): void {
    this.renderPieChart();
    this.renderBarChart();
  }

  private renderPieChart(): void {
    const ctx = document.getElementById('chart-categorias') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.pieChart) this.pieChart.destroy();

    const cats = this.svc.getCategoriasPorTipo('saida', this.registrosMes());
    const colors = ['#ef4444','#f97316','#f59e0b','#84cc16','#14b8a6','#6366f1','#a855f7','#ec4899'];

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
          legend: {
            position: 'right',
            labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${this.svc.formatCurrency(ctx.parsed as number)}`,
            },
          },
        },
        cutout: '60%',
      },
    });
  }

  private renderBarChart(): void {
    const ctx = document.getElementById('chart-distribuicao') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.barChart) this.barChart.destroy();

    const r = this.resumo();
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Saídas', 'Investimentos', 'Saldo'],
        datasets: [{
          data: [r.totalEntradas, r.totalSaidas, r.totalInvestimentos, Math.max(0, r.saldoAtual)],
          backgroundColor: ['rgba(16,185,129,0.7)','rgba(239,68,68,0.7)','rgba(168,85,247,0.7)','rgba(99,102,241,0.7)'],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { size: 11 },
              callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
            },
          },
        },
      },
    });
  }
}
