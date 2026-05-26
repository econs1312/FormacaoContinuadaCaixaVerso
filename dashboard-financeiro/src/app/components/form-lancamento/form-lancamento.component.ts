import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Registro, TipoRegistro, CATEGORIAS_POR_TIPO } from '../../models/registro.model';

@Component({
  selector: 'app-form-lancamento',
  imports: [FormsModule, NgClass],
  template: `
    <div class="form-card" id="form-lancamento">
      <div class="form-header">
        <h3 class="form-title">Novo Lançamento</h3>
        <p class="form-sub">Registre uma receita, despesa ou investimento</p>
      </div>

      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <!-- Tipo -->
        <div class="tipo-buttons">
          @for (t of tipos; track t.value) {
            <button
              type="button"
              class="tipo-btn"
              [ngClass]="['tipo-' + t.value, tipoSelecionado() === t.value ? 'tipo-active' : '']"
              (click)="selectTipo(t.value)"
              [id]="'tipo-' + t.value"
            >
              <span>{{ t.icon }}</span>
              {{ t.label }}
            </button>
          }
        </div>

        <div class="fields-grid">
          <!-- Descrição -->
          <div class="field full">
            <label class="field-label" for="descricao">Descrição *</label>
            <input
              id="descricao"
              class="field-input"
              type="text"
              [(ngModel)]="form.descricao"
              name="descricao"
              placeholder="Ex: Salário, Conta de Luz..."
              required
              maxlength="100"
            />
          </div>

          <!-- Categoria -->
          <div class="field">
            <label class="field-label" for="categoria">Categoria *</label>
            <select
              id="categoria"
              class="field-input"
              [(ngModel)]="form.categoria"
              name="categoria"
              required
            >
              <option value="">Selecione...</option>
              @for (cat of categoriasFiltradas(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- Data -->
          <div class="field">
            <label class="field-label" for="data">Data *</label>
            <input
              id="data"
              class="field-input"
              type="date"
              [(ngModel)]="form.data"
              name="data"
              [max]="maxData()"
              required
            />
          </div>

          <!-- Valor -->
          <div class="field">
            <label class="field-label" for="valor">Valor (R$) *</label>
            <input
              id="valor"
              class="field-input"
              type="number"
              [(ngModel)]="form.valor"
              name="valor"
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        @if (erro()) {
          <div class="alert-erro">{{ erro() }}</div>
        }

        <button type="submit" class="btn-submit" id="btn-adicionar">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar Lançamento
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .form-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.5rem;
      }
      .form-header { margin-bottom: 1.25rem; }
      .form-title { font-size: 1.125rem; font-weight: 700; color: white; }
      .form-sub { font-size: 0.8125rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem; }

      .tipo-buttons {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }
      .tipo-btn {
        flex: 1 1 auto;
        min-width: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.625rem 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.5);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .tipo-entrada.tipo-active  { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.5); color: #10b981; }
      .tipo-saida.tipo-active    { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.5);  color: #ef4444; }
      .tipo-investimento.tipo-active { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.5); color: #a855f7; }
      .tipo-btn:hover { background: rgba(255,255,255,0.08); color: white; }

      .fields-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.875rem;
        margin-bottom: 1rem;
      }
      .field { display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
      .full { grid-column: 1 / -1; }
      .field-label { font-size: 0.8125rem; font-weight: 500; color: rgba(255,255,255,0.5); }
      .field-input {
        width: 100%;
        padding: 0.625rem 0.875rem;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: white;
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.2s;
        outline: none;
      }
      .field-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.06); }
      .field-input option { background: #1a1a2e; }
      .field-input::placeholder { color: rgba(255,255,255,0.25); }
      input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }

      .alert-erro {
        background: rgba(239,68,68,0.12);
        border: 1px solid rgba(239,68,68,0.3);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .btn-submit {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 10px;
        border: none;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.2s;
      }
      .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }

      @media (max-width: 540px) {
        .fields-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class FormLancamentoComponent {
  @Output() registroAdicionado = new EventEmitter<Omit<Registro, 'id'>>();

  tipos = [
    { value: 'entrada' as TipoRegistro, label: 'Entrada', icon: '💰' },
    { value: 'saida' as TipoRegistro, label: 'Saída', icon: '💸' },
    { value: 'investimento' as TipoRegistro, label: 'Investimento', icon: '📈' },
  ];

  tipoSelecionado = signal<TipoRegistro>('saida');
  erro = signal('');

  form = {
    descricao: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    valor: null as number | null,
  };

  categoriasFiltradas = computed(() => CATEGORIAS_POR_TIPO[this.tipoSelecionado()]);

  maxData(): string {
    const tipo = this.tipoSelecionado();
    if (tipo === 'entrada' || tipo === 'saida') {
      return new Date().toISOString().split('T')[0];
    }
    return '';
  }

  selectTipo(tipo: TipoRegistro): void {
    this.tipoSelecionado.set(tipo);
    this.form.categoria = '';
  }

  onSubmit(): void {
    this.erro.set('');

    if (!this.form.descricao.trim()) {
      this.erro.set('Preencha a descrição do lançamento.');
      return;
    }
    if (!this.form.categoria) {
      this.erro.set('Selecione uma categoria.');
      return;
    }
    if (!this.form.data) {
      this.erro.set('Informe a data do lançamento.');
      return;
    }
    if (!this.form.valor || this.form.valor <= 0) {
      this.erro.set('Informe um valor válido.');
      return;
    }

    const tipo = this.tipoSelecionado();
    if ((tipo === 'entrada' || tipo === 'saida') && this.form.data > new Date().toISOString().split('T')[0]) {
      this.erro.set('Datas futuras não são permitidas para entradas e saídas.');
      return;
    }

    this.registroAdicionado.emit({
      descricao: this.form.descricao.trim(),
      tipo,
      categoria: this.form.categoria,
      data: this.form.data,
      valor: this.form.valor,
    });

    // Reset
    this.form = {
      descricao: '',
      categoria: '',
      data: new Date().toISOString().split('T')[0],
      valor: null,
    };
  }
}
