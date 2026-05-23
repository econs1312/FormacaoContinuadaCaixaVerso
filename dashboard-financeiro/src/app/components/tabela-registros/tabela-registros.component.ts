import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Registro } from '../../models/registro.model';

@Component({
  selector: 'app-tabela-registros',
  imports: [CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="tabela-container">
      @if (registros.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-title">Nenhum registro encontrado</p>
          <p class="empty-sub">Tente mudar os filtros ou adicione novos lançamentos.</p>
        </div>
      } @else {
        <!-- Desktop table -->
        <div class="table-wrapper">
          <table class="table" id="tabela-registros">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              @for (reg of registros; track reg.id) {
                <tr class="table-row">
                  <td class="col-data">
                    {{ reg.data | date: 'dd/MM/yyyy' }}
                  </td>
                  <td class="col-desc">{{ reg.descricao }}</td>
                  <td>
                    <span class="badge-cat">{{ reg.categoria }}</span>
                  </td>
                  <td>
                    <span class="badge-tipo" [ngClass]="'tipo-' + reg.tipo">
                      {{ tipoLabel(reg.tipo) }}
                    </span>
                  </td>
                  <td class="col-valor" [ngClass]="'val-' + reg.tipo">
                    {{ reg.tipo === 'saida' ? '-' : '+' }}
                    {{ reg.valor | currency: 'BRL' : 'symbol' : '1.2-2' }}
                  </td>
                  <td>
                    <button
                      class="btn-delete"
                      (click)="onDelete(reg.id)"
                      [id]="'del-' + reg.id"
                      title="Remover registro"
                      aria-label="Remover registro"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path
                          d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                        />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="mobile-cards">
          @for (reg of registros; track reg.id) {
            <div class="mobile-card">
              <div class="mobile-card-top">
                <div>
                  <div class="mobile-desc">{{ reg.descricao }}</div>
                  <div class="mobile-meta">
                    {{ reg.data | date: 'dd/MM/yyyy' }} ·
                    {{ reg.categoria }}
                  </div>
                </div>
                <div class="mobile-right">
                  <div class="mobile-valor" [ngClass]="'val-' + reg.tipo">
                    {{ reg.tipo === 'saida' ? '-' : '+' }}
                    {{ reg.valor | currency: 'BRL' : 'symbol' : '1.2-2' }}
                  </div>
                  <span class="badge-tipo" [ngClass]="'tipo-' + reg.tipo">
                    {{ tipoLabel(reg.tipo) }}
                  </span>
                </div>
              </div>
              <button class="btn-delete-mobile" (click)="onDelete(reg.id)">
                Remover lançamento
              </button>
            </div>
          }
        </div>

        <div class="table-footer">
          <span class="table-count">{{ registros.length }} registro(s)</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .tabela-container {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        overflow: hidden;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 1rem;
        gap: 0.5rem;
      }
      .empty-icon { font-size: 2.5rem; }
      .empty-title { font-weight: 600; color: rgba(255,255,255,0.7); font-size: 1rem; }
      .empty-sub { color: rgba(255,255,255,0.35); font-size: 0.875rem; }

      /* Desktop Table */
      .table-wrapper { overflow-x: auto; }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th {
        padding: 0.875rem 1.25rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        white-space: nowrap;
      }
      .table td {
        padding: 0.875rem 1.25rem;
        font-size: 0.875rem;
        color: rgba(255,255,255,0.8);
        border-bottom: 1px solid rgba(255,255,255,0.04);
        vertical-align: middle;
      }
      .table-row { transition: background 0.15s; }
      .table-row:hover { background: rgba(255,255,255,0.03); }
      .table-row:last-child td { border-bottom: none; }

      .col-data { color: rgba(255,255,255,0.45); font-size: 0.8125rem; white-space: nowrap; }
      .col-desc { font-weight: 500; color: white; }
      .col-valor { font-weight: 600; font-size: 0.9375rem; white-space: nowrap; }

      .val-entrada     { color: #10b981; }
      .val-saida       { color: #ef4444; }
      .val-investimento{ color: #a855f7; }

      .badge-cat {
        padding: 0.2rem 0.625rem;
        border-radius: 100px;
        font-size: 0.75rem;
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.6);
        white-space: nowrap;
      }
      .badge-tipo {
        padding: 0.2rem 0.625rem;
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .tipo-entrada      { background: rgba(16,185,129,0.15); color: #10b981; }
      .tipo-saida        { background: rgba(239,68,68,0.15);  color: #ef4444; }
      .tipo-investimento { background: rgba(168,85,247,0.15); color: #a855f7; }

      .btn-delete {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid rgba(239,68,68,0.25);
        background: rgba(239,68,68,0.08);
        color: #ef4444;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-delete:hover {
        background: rgba(239,68,68,0.2);
        border-color: rgba(239,68,68,0.4);
        transform: scale(1.05);
      }
      .table-footer {
        padding: 0.75rem 1.25rem;
        border-top: 1px solid rgba(255,255,255,0.06);
        font-size: 0.8125rem;
        color: rgba(255,255,255,0.35);
      }

      /* Mobile */
      .mobile-cards { display: none; padding: 0.75rem; gap: 0.75rem; flex-direction: column; }
      .mobile-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 1rem;
      }
      .mobile-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
      .mobile-desc { font-weight: 600; color: white; font-size: 0.9375rem; }
      .mobile-meta { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem; }
      .mobile-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.375rem; }
      .mobile-valor { font-weight: 700; font-size: 1rem; }
      .btn-delete-mobile {
        width: 100%;
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid rgba(239,68,68,0.25);
        background: rgba(239,68,68,0.08);
        color: #ef4444;
        font-size: 0.8125rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-delete-mobile:hover { background: rgba(239,68,68,0.18); }

      @media (max-width: 768px) {
        .table-wrapper { display: none; }
        .mobile-cards { display: flex; }
      }
    `,
  ],
})
export class TabelaRegistrosComponent {
  @Input() registros: Registro[] = [];
  @Output() deletarRegistro = new EventEmitter<string>();

  onDelete(id: string): void {
    this.deletarRegistro.emit(id);
  }

  tipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      saida: 'Saída',
      investimento: 'Investimento',
    };
    return labels[tipo] ?? tipo;
  }
}
