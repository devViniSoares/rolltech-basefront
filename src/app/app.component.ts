import { FooterComponent } from './landing/footer.component';
import { Component } from '@angular/core';
import { HeaderComponent } from './landing/header.component';
import { HeroComponent } from './landing/hero.component';
import { ContactComponent } from './landing/contact.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HeroComponent, ContactComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly pains = [
    {
      number: '01',
      title: 'Planilhas viraram sistema',
      description: 'O processo cresceu, mas a ferramenta ficou para trás.',
      mobile: '',
    },
    {
      number: '02',
      title: 'O time vive no repetitivo',
      description:
        'Tarefas manuais consomem energia que deveria mover o negócio.',
      mobile: 'Tarefas manuais roubam energia do que move o negócio.',
    },
    {
      number: '03',
      title: 'As ferramentas não conversam',
      description:
        'Dados e decisões ficam espalhados, lentos e sujeitos a erro.',
      mobile: 'Dados e decisões ficam espalhados e lentos.',
    },
  ];
  readonly services = [
    {
      number: '01',
      subject: 'Software sob medida',
      title: 'Sistemas que cabem no seu negócio',
      mobileTitle: '',
      description:
        'Produtos digitais e ferramentas internas construídos ao redor do seu processo.',
      mobile: '',
    },
    {
      number: '02',
      subject: 'Automações',
      title: 'Menos trabalho repetitivo',
      mobileTitle: '',
      description:
        'Fluxos inteligentes para reduzir tarefas manuais, erros e tempo perdido.',
      mobile: 'Automações para reduzir tarefas manuais, erros e tempo perdido.',
    },
    {
      number: '03',
      subject: 'Integrações',
      title: 'Ferramentas que finalmente conversam',
      mobileTitle: 'Ferramentas conectadas',
      description:
        'Integrações para a operação fluir sem retrabalho ou dados espalhados.',
      mobile: 'Integrações para a operação fluir sem retrabalho.',
    },
  ];
  readonly steps = [
    {
      number: '01',
      title: 'Entende o problema',
      description:
        'Mergulhamos no processo, nas pessoas e no que realmente está travando.',
      mobile: 'Mergulhamos no processo e no que realmente está travando.',
    },
    {
      number: '02',
      title: 'Desenha a solução',
      description:
        'Transformamos contexto em uma proposta clara, priorizada e viável.',
      mobile: 'Transformamos contexto em uma proposta clara e viável.',
    },
    {
      number: '03',
      title: 'Entrega e evolui',
      description:
        'Construímos, colocamos para rodar e melhoramos com o aprendizado real.',
      mobile: 'Colocamos para rodar e melhoramos com o aprendizado real.',
    },
  ];
}
