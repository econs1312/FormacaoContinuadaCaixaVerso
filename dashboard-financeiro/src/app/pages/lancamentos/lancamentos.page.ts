import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceiroService } from '../../services/financeiro.service';
import { FormLancamentoComponent } from '../../components/form-lancamento/form-lancamento.component';
import { TabelaRegistrosComponent } from '../../components/tabela-registros/tabela-registros.component';
import { Registro } from '../../models/registro.model';

@Component({
  selector: 'app-lancamentos',
  imports: [FormsModule, FormLancamentoComponent, TabelaRegistrosComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Lançamentos</h1>
          <p class="page-sub">Gerencie suas receitas e despesas</p>
        </div>
      </div>

      <div class="layout">
        <!-- Formulário (filho) — emite evento ao pai -->
        <div class="col-form">
          <app-form-lancamento
            (registroAdicionado)="onAdicionar($event)"
          ></app-form-lancamento>
        </div>

        <!-- Coluna da tabela -->
        <div class="col-table">
          <!-- Filtros -->
          <div class="filtros-bar">
            <select class="select-filtro" [(ngModel)]="mesSelecionado" (ngModelChange)="filtrar()" id="lanc-select-mes">
              <option value="">Todos os meses</option>
              @for (m of mesesDisponiveis(); track m.label) {
                <option [value]="m.ano + '-' + m.mes">{{ m.label }}</option>
              }
            </select>
            <select class="select-filtro" [(ngModel)]="tipoFiltro" (ngModelChange)="filtrar()" id="lanc-select-tipo">
              <option value="">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
              <option value="investimento">Investimentos</option>
            </select>
          </div>

          <!-- Tabela (filho) — emite evento ao pai para deletar -->
          <app-tabela-registros
            [registros]="registrosFiltrados()"
            (deletarRegistro)="onDeletar($event)"
          ></app-tabela-registros>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { padding: 1.5rem; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
      .page-header { }
      .page-title { font-size: 1.75rem; font-weight: 800; color: white; }
      .page-sub { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-top: 0.2rem; }

      .layout { display: grid; grid-template-columns: 380px 1fr; gap: 1.25rem; align-items: start; }
      @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

      .col-form { position: sticky; top: 80px; }
      @media (max-width: 1024px) { .col-form { position: static; } }

      .col-table { display: flex; flex-direction: column; gap: 0.875rem; }
      .filtros-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; }
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
      }
      .select-filtro option { background: #1a1a2e; }
    `,
  ],
})
export class LancamentosPage implements OnInit {
  private svc = inject(FinanceiroService);

  mesSelecionado = '';
  tipoFiltro = '';

  private todosRegistros = signal<Registro[]>([]);

  mesesDisponiveis = computed(() => this.svc.getMesesDisponiveis());

  registrosFiltrados = computed(() => {
    let lista = this.todosRegistros();
    if (this.mesSelecionado) {
      const [ano, mes] = this.mesSelecionado.split('-').map(Number);
      lista = lista.filter((r) => {
        const d = new Date(r.data + 'T00:00:00');
        return d.getFullYear() === ano && d.getMonth() + 1 === mes;
      });
    }
    if (this.tipoFiltro) {
      lista = lista.filter((r) => r.tipo === this.tipoFiltro);
    }
    return lista;
  });

  ngOnInit(): void {
    this.todosRegistros.set([...this.svc.registros()]);
    const meses = this.mesesDisponiveis();
    if (meses.length > 0) {
      const m = meses[0];
      this.mesSelecionado = `${m.ano}-${m.mes}`;
    }
  }

  filtrar(): void {
    // Triggers computed signal re-evaluation
    this.todosRegistros.set([...this.svc.registros()]);
  }

  onAdicionar(dados: Omit<Registro, 'id'>): void {
    this.svc.adicionarRegistro(dados);
    this.todosRegistros.set([...this.svc.registros()]);
  }

  onDeletar(id: string): void {
    this.svc.removerRegistro(id);
    this.todosRegistros.set([...this.svc.registros()]);
  }
}
