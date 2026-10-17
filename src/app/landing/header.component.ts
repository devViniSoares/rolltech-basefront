import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  template: ` <header
    class="container header"
    (keydown.escape)="closeMenu(true)"
  >
    <a class="brand" href="#" aria-label="Rolltech, início"
      ><picture
        ><source
          media="(max-width: 767px)"
          srcset="assets/rolltech/mobile-brand.svg" />
        <img src="assets/rolltech/desktop-brand.svg" alt="" /></picture
      ><span>ROLLTECH</span></a
    >
    <nav
      id="main-navigation"
      [class.open]="menuOpen"
      aria-label="Navegação principal"
    >
      <a href="#solucoes" (click)="closeMenu()">O que resolvemos</a
      ><a href="#como-funciona" (click)="closeMenu()">Como funciona</a
      ><a href="#contato" (click)="closeMenu()">Contato</a>
    </nav>
    <a class="button desktop-only" href="#contato">Conte seu desafio</a>
    <button
      #menuButton
      class="pill mobile-only"
      type="button"
      aria-controls="main-navigation"
      [attr.aria-expanded]="menuOpen"
      (click)="menuOpen = !menuOpen"
    >
      {{ menuOpen ? 'FECHAR' : 'MENU' }}
    </button>
  </header>`,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 2;
    }
    .header {
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    nav {
      display: flex;
      gap: 32px;
      font-size: 13px;
      font-weight: 600;
      line-height: 18px;
    }
    @media (max-width: 767px) {
      .header {
        height: 72px;
      }
      .brand {
        font-size: 16px;
        letter-spacing: 0.32px;
      }
      nav {
        display: none;
      }
      nav.open {
        display: flex;
        position: absolute;
        top: 64px;
        left: 20px;
        right: 20px;
        flex-direction: column;
        gap: 0;
        padding: 12px;
        background: white;
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
      }
      nav a {
        padding: 14px 12px;
      }
    }
  `,
})
export class HeaderComponent {
  menuOpen = false;
  private readonly menuButton =
    viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  closeMenu(restoreFocus = false): void {
    this.menuOpen = false;
    if (restoreFocus) this.menuButton()?.nativeElement.focus();
  }
}
