import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ResumoMes } from '../../models/registro.model';

@Component({
  selector: 'app-cards-resumo',
  imports: [CurrencyPipe],
  template: `
    <div class="cards-grid">
      <!-- Entradas -->
      <div class="card card-entrada" id="card-entradas">
        <div class="card-header">
          <span class="card-label">Total de Entradas</span>
          <div class="card-icon icon-entrada">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ resumo.totalEntradas | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>
        <div class="card-badge badge-entrada">Receitas do mês</div>
      </div>

      <!-- Saídas -->
      <div class="card card-saida" id="card-saidas">
        <div class="card-header">
          <span class="card-label">Total de Saídas</span>
          <div class="card-icon icon-saida">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ resumo.totalSaidas | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>
        <div class="card-badge badge-saida">Despesas do mês</div>
      </div>

      <!-- Investimentos -->
      <div class="card card-invest" id="card-investimentos">
        <div class="card-header">
          <span class="card-label">Investimentos</span>
          <div class="card-icon icon-invest">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ resumo.totalInvestimentos | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>
        <div class="card-badge badge-invest">Aportes do mês</div>
      </div>

      <!-- Saldo -->
      <div class="card" [class.card-saldo-pos]="resumo.saldoAtual >= 0" [class.card-saldo-neg]="resumo.saldoAtual < 0" id="card-saldo">
        <div class="card-header">
          <span class="card-label">Saldo Atual</span>
          <div class="card-icon" [class.icon-saldo-pos]="resumo.saldoAtual >= 0" [class.icon-saldo-neg]="resumo.saldoAtual < 0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
        </div>
        <div class="card-value" [class.value-pos]="resumo.saldoAtual >= 0" [class.value-neg]="resumo.saldoAtual < 0">
          {{ resumo.saldoAtual | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>
        <div class="card-badge" [class.badge-saldo-pos]="resumo.saldoAtual >= 0" [class.badge-saldo-neg]="resumo.saldoAtual < 0">
          {{ resumo.saldoAtual >= 0 ? 'Em dia ✓' : 'Atenção !' }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
      @media (max-width: 1024px) {
        .cards-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 540px) {
        .cards-grid { grid-template-columns: 1fr; }
      }
      .card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      .card-entrada { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.06); }
      .card-saida   { border-color: rgba(239,68,68,0.25);  background: rgba(239,68,68,0.06); }
      .card-invest  { border-color: rgba(168,85,247,0.25); background: rgba(168,85,247,0.06); }
      .card-saldo-pos { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); }
      .card-saldo-neg { border-color: rgba(239,68,68,0.3);  background: rgba(239,68,68,0.08); }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }
      .card-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: rgba(255,255,255,0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .card-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .icon-entrada   { background: rgba(16,185,129,0.2); color: #10b981; }
      .icon-saida     { background: rgba(239,68,68,0.2);  color: #ef4444; }
      .icon-invest    { background: rgba(168,85,247,0.2); color: #a855f7; }
      .icon-saldo-pos { background: rgba(99,102,241,0.2); color: #6366f1; }
      .icon-saldo-neg { background: rgba(239,68,68,0.2);  color: #ef4444; }

      .card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
        letter-spacing: -0.01em;
      }
      .value-pos { color: #10b981; }
      .value-neg { color: #ef4444; }

      .card-badge {
        display: inline-block;
        padding: 0.2rem 0.625rem;
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge-entrada   { background: rgba(16,185,129,0.15);  color: #10b981; }
      .badge-saida     { background: rgba(239,68,68,0.15);   color: #ef4444; }
      .badge-invest    { background: rgba(168,85,247,0.15);  color: #a855f7; }
      .badge-saldo-pos { background: rgba(99,102,241,0.15);  color: #6366f1; }
      .badge-saldo-neg { background: rgba(239,68,68,0.15);   color: #ef4444; }
    `,
  ],
})
export class CardsResumoComponent {
  @Input() resumo: ResumoMes = {
    totalEntradas: 0,
    totalSaidas: 0,
    totalInvestimentos: 0,
    saldoAtual: 0,
  };
}
