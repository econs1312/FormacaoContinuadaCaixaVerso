import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FinanceiroService } from '../../services/financeiro.service';
import { PERFIS_FINANCEIROS, PerfilFinanceiro } from '../../models/registro.model';

@Component({
  selector: 'app-metas',
  imports: [NgClass, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Metas Financeiras</h1>
        <p class="page-sub">Defina seu perfil e acompanhe sua projeção mensal</p>
      </div>

      <!-- Perfis -->
      <section class="section">
        <h2 class="section-title">Perfil de Consumo</h2>
        <div class="perfis-grid">
          @for (p of perfis; track p.nome) {
            <button
              class="perfil-card"
              [class.perfil-ativo]="perfilAtivo().nome === p.nome"
              (click)="selecionarPerfil(p)"
              [id]="'perfil-' + p.nome.toLowerCase()"
            >
              <div class="perfil-header">
                <div class="perfil-icon" [style.background]="p.cor + '22'" [style.color]="p.cor">
                  {{ perfilEmoji(p.nome) }}
                </div>
                @if (perfilAtivo().nome === p.nome) {
                  <span class="perfil-badge-ativo">Ativo</span>
                }
              </div>
              <div class="perfil-nome">{{ p.nome }}</div>
              <div class="perfil-percentual" [style.color]="p.cor">
                Até {{ p.percentualMaximo }}% das entradas
              </div>
              <div class="perfil-desc">{{ p.descricao }}</div>
              <div class="perfil-bar">
                <div
                  class="perfil-bar-fill"
                  [style.width]="p.percentualMaximo + '%'"
                  [style.background]="p.cor"
                ></div>
              </div>
            </button>
          }
        </div>
      </section>

      <!-- Projeção -->
      <section class="section">
        <h2 class="section-title">Projeção do Mês Atual</h2>

        <div class="projecao-card" [ngClass]="'status-' + projecao().status">
          <!-- Status -->
          <div class="projecao-status">
            <div class="status-msg">{{ projecao().mensagem }}</div>
          </div>

          <!-- Barra de progresso -->
          <div class="progress-section">
            <div class="progress-labels">
              <span>Gastos atuais</span>
              <span>{{ projecao().percentualGasto | number: '1.0-0' }}% do teto</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                [ngClass]="'fill-' + projecao().status"
                [style.width]="projecao().percentualGasto + '%'"
              ></div>
            </div>
          </div>

          <!-- Métricas -->
          <div class="metricas-grid">
            <div class="metrica">
              <div class="metrica-label">Teto de Gastos</div>
              <div class="metrica-valor">
                {{ projecao().teto | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="metrica-sub">{{ perfilAtivo().percentualMaximo }}% das entradas</div>
            </div>
            <div class="metrica">
              <div class="metrica-label">Gasto Atual</div>
              <div class="metrica-valor text-red">
                {{ projecao().gastoAtual | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="metrica-sub">Saídas do mês</div>
            </div>
            <div class="metrica">
              <div class="metrica-label">Saldo da Meta</div>
              <div
                class="metrica-valor"
                [class.text-green]="projecao().saldoMeta >= 0"
                [class.text-red]="projecao().saldoMeta < 0"
              >
                {{ projecao().saldoMeta | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="metrica-sub">Disponível</div>
            </div>
            <div class="metrica metrica-destaque">
              <div class="metrica-label">Margem Diária</div>
              <div
                class="metrica-valor-lg"
                [class.text-green]="projecao().margemDiaria >= 0"
                [class.text-red]="projecao().margemDiaria < 0"
              >
                {{ projecao().margemDiaria | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="metrica-sub">por dia ({{ projecao().diasRestantes }} dias restantes)</div>
            </div>
          </div>

          <!-- Exemplo cálculo -->
          <div class="calc-exemplo">
            <div class="calc-title">📊 Como calculamos</div>
            <div class="calc-steps">
              <div class="calc-step">
                <span class="calc-num">1</span>
                Teto = {{ perfilAtivo().percentualMaximo }}% × Entradas
                = {{ projecao().teto | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="calc-step">
                <span class="calc-num">2</span>
                Saldo da Meta = Teto − Gastos Atuais
                = {{ projecao().saldoMeta | currency: 'BRL' : 'symbol' : '1.2-2' }}
              </div>
              <div class="calc-step">
                <span class="calc-num">3</span>
                Margem Diária = Saldo ÷ {{ projecao().diasRestantes }} dias
                = {{ projecao().margemDiaria | currency: 'BRL' : 'symbol' : '1.2-2' }}/dia
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .page { padding: 1.5rem; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem; }
      .page-title { font-size: 1.75rem; font-weight: 800; color: white; }
      .page-sub { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-top: 0.2rem; }
      .section { display: flex; flex-direction: column; gap: 1rem; }
      .section-title { font-size: 1.125rem; font-weight: 700; color: rgba(255,255,255,0.8); }

      /* Perfis */
      .perfis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
      @media (max-width: 768px) { .perfis-grid { grid-template-columns: 1fr; } }

      .perfil-card {
        background: rgba(255,255,255,0.04);
        border: 2px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.25rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.25s;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .perfil-card:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }
      .perfil-ativo { border-color: rgba(99,102,241,0.6) !important; background: rgba(99,102,241,0.08) !important; }

      .perfil-header { display: flex; align-items: center; justify-content: space-between; }
      .perfil-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
      .perfil-badge-ativo { background: rgba(99,102,241,0.2); color: #6366f1; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.625rem; border-radius: 100px; }
      .perfil-nome { font-size: 1.125rem; font-weight: 700; color: white; }
      .perfil-percentual { font-size: 0.875rem; font-weight: 700; }
      .perfil-desc { font-size: 0.8125rem; color: rgba(255,255,255,0.45); line-height: 1.4; }
      .perfil-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 100px; overflow: hidden; margin-top: 0.25rem; }
      .perfil-bar-fill { height: 100%; border-radius: 100px; transition: width 0.4s ease; }

      /* Projeção */
      .projecao-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .status-positivo { border-color: rgba(16,185,129,0.3); }
      .status-alerta   { border-color: rgba(245,158,11,0.3); }
      .status-negativo { border-color: rgba(239,68,68,0.3); }

      .projecao-status { }
      .status-msg {
        padding: 0.875rem 1.25rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9375rem;
        background: rgba(255,255,255,0.06);
        color: white;
      }

      /* Progress */
      .progress-section { display: flex; flex-direction: column; gap: 0.5rem; }
      .progress-labels { display: flex; justify-content: space-between; font-size: 0.8125rem; color: rgba(255,255,255,0.45); }
      .progress-track { height: 12px; background: rgba(255,255,255,0.07); border-radius: 100px; overflow: hidden; }
      .progress-fill { height: 100%; border-radius: 100px; transition: width 0.5s ease; }
      .fill-positivo { background: linear-gradient(90deg, #10b981, #34d399); }
      .fill-alerta   { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
      .fill-negativo { background: linear-gradient(90deg, #ef4444, #f87171); }

      /* Métricas */
      .metricas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
      @media (max-width: 900px) { .metricas-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 540px) { .metricas-grid { grid-template-columns: 1fr; } }

      .metrica {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 1rem;
      }
      .metrica-destaque { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); }
      .metrica-label { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
      .metrica-valor { font-size: 1.125rem; font-weight: 700; color: white; }
      .metrica-valor-lg { font-size: 1.375rem; font-weight: 800; }
      .metrica-sub { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 0.25rem; }
      .text-green { color: #10b981; }
      .text-red   { color: #ef4444; }

      /* Cálculo */
      .calc-exemplo {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 1.25rem;
      }
      .calc-title { font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 0.875rem; }
      .calc-steps { display: flex; flex-direction: column; gap: 0.625rem; }
      .calc-step { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: rgba(255,255,255,0.55); }
      .calc-num {
        min-width: 24px;
        height: 24px;
        background: rgba(99,102,241,0.2);
        color: #6366f1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
      }
    `,
  ],
})
export class MetasPage implements OnInit {
  private svc = inject(FinanceiroService);

  perfis = PERFIS_FINANCEIROS;

  perfilAtivo = computed(() => this.svc.perfilAtivo());

  private _registrosMes = signal<any[]>([]);

  projecao = computed(() => {
    const registros = this._registrosMes();
    const resumo = this.svc.calcularResumo(registros);
    return this.svc.calcularProjecao(resumo);
  });

  ngOnInit(): void {
    const hoje = new Date();
    const registros = this.svc.getRegistrosPorMes(hoje.getFullYear(), hoje.getMonth() + 1);
    this._registrosMes.set(registros);
  }

  selecionarPerfil(perfil: PerfilFinanceiro): void {
    this.svc.alterarPerfil(perfil);
  }

  perfilEmoji(nome: string): string {
    const map: Record<string, string> = { Conservador: '🛡️', Moderado: '⚖️', Arrojado: '🚀' };
    return map[nome] ?? '💡';
  }
}
