import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-inner">
        <!-- Logo -->
        <a routerLink="/dashboard" class="logo">
          <div class="logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span class="logo-text">FinTrack</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="nav-desktop">
          <a
            routerLink="/dashboard"
            routerLinkActive="nav-link-active"
            class="nav-link"
            id="nav-dashboard"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </a>
          <a
            routerLink="/lancamentos"
            routerLinkActive="nav-link-active"
            class="nav-link"
            id="nav-lancamentos"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Lançamentos
          </a>
          <a
            routerLink="/metas"
            routerLinkActive="nav-link-active"
            class="nav-link"
            id="nav-metas"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Metas
          </a>
          <a
            routerLink="/investimentos"
            routerLinkActive="nav-link-active"
            class="nav-link"
            id="nav-investimentos"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Investimentos
          </a>
        </nav>

        <!-- Mobile hamburger -->
        <button class="hamburger" (click)="toggleMenu()" id="hamburger-btn" aria-label="Menu">
          @if (!menuOpen()) {
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          } @else {
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <nav class="nav-mobile" (click)="closeMenu()">
          <a routerLink="/dashboard" routerLinkActive="nav-link-active" class="nav-link-mobile">
            Dashboard
          </a>
          <a routerLink="/lancamentos" routerLinkActive="nav-link-active" class="nav-link-mobile">
            Lançamentos
          </a>
          <a routerLink="/metas" routerLinkActive="nav-link-active" class="nav-link-mobile">
            Metas
          </a>
          <a
            routerLink="/investimentos"
            routerLinkActive="nav-link-active"
            class="nav-link-mobile"
          >
            Investimentos
          </a>
        </nav>
      }
    </header>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(15, 15, 30, 0.85);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .header-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1.5rem;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        text-decoration: none;
      }
      .logo-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .nav-desktop {
        display: flex;
        gap: 0.25rem;
        align-items: center;
      }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.2s;
      }
      .nav-link:hover {
        color: white;
        background: rgba(255, 255, 255, 0.08);
      }
      .nav-link-active {
        color: white !important;
        background: rgba(99, 102, 241, 0.2) !important;
      }
      .hamburger {
        display: none;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0.375rem;
        border-radius: 8px;
        transition: background 0.2s;
      }
      .hamburger:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .nav-mobile {
        display: flex;
        flex-direction: column;
        padding: 0.75rem 1.5rem 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        gap: 0.25rem;
      }
      .nav-link-mobile {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9375rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: all 0.2s;
      }
      .nav-link-mobile:hover {
        color: white;
        background: rgba(255, 255, 255, 0.08);
      }
      @media (max-width: 768px) {
        .nav-desktop {
          display: none;
        }
        .hamburger {
          display: flex;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
