/* Conjunto de ícones em SVG, traçado de 1.75px, grade de 24.
   Desenhados à mão para o app, sem dependência externa e sem emoji. */

'use strict'

const ICONES = {
  /* categorias */
  carrinho:
    '<path d="M2.5 4h2.2l2.4 10.2h9.6L19 7.2H6.2"/><circle cx="9.5" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/>',
  fruta:
    '<path d="M12 8.2C9.6 5.4 4.6 6.6 4.6 11.2c0 4.2 3.3 9 7.4 9s7.4-4.8 7.4-9c0-4.6-5-5.8-7.4-3z"/><path d="M12 8.2V4.6"/><path d="M12 5.4c1.4-1.6 3-1.9 4.2-1.8.1 1.4-.5 2.9-2 3.5"/>',
  // Bife com o osso. A versão anterior, feita com arcos, lia como espiral.
  carne:
    '<path d="M4.8 12.6c0-4.2 3.5-7.6 7.8-7.6 4 0 6.9 2.9 6.9 6.5 0 4.2-3.6 7.6-8 7.6-3.9 0-6.7-2.7-6.7-6.5z"/><circle cx="9.6" cy="12.6" r="2.5"/>',
  leite:
    '<path d="M9 3h6v3.4l2 3.2V21H7V9.6l2-3.2z"/><path d="M9 6.4h6"/><path d="M7 13h10"/>',
  pao: '<path d="M4.2 11.4c0-2.7 3.5-4.6 7.8-4.6s7.8 1.9 7.8 4.6v6.4a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2z"/><path d="M9 8.2c-.7 1.6-.7 3.4 0 5"/><path d="M13.4 7.6c-.7 1.9-.7 4 0 6"/>',
  bebida:
    '<path d="M6.4 4h11.2l-1.4 15.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8z"/><path d="M6.9 9.6h10.2"/>',
  gelo: '<path d="M12 3v18"/><path d="M4.2 7.5l15.6 9"/><path d="M19.8 7.5l-15.6 9"/><path d="M9.6 5.4L12 7.8l2.4-2.4"/><path d="M9.6 18.6L12 16.2l2.4 2.4"/>',
  limpeza:
    '<path d="M9.6 3h4v3.2h-4z"/><path d="M8.4 6.2h6.4l1.2 6.2H7.2z"/><path d="M7.2 12.4h9.6V21H7.2z"/><path d="M10.4 15.6v2.2"/><path d="M13.6 15.6v2.2"/>',
  higiene:
    '<path d="M12 3.2s6.2 6.6 6.2 10.4A6.2 6.2 0 0 1 5.8 13.6C5.8 9.8 12 3.2 12 3.2z"/><path d="M9.2 14.4a2.8 2.8 0 0 0 2.8 2.8"/>',
  remedio:
    '<path d="M10.6 3.6a4.8 4.8 0 0 1 6.8 6.8l-7 7a4.8 4.8 0 0 1-6.8-6.8z"/><path d="M7.2 7l6.8 6.8"/>',
  pet: '<circle cx="7" cy="8.4" r="2"/><circle cx="12" cy="6.4" r="2.1"/><circle cx="17" cy="8.4" r="2"/><path d="M12 11.4c2.6 0 4.6 2.1 4.6 4.3 0 1.8-1.3 2.9-3 2.9-.9 0-1.2-.4-1.6-.4s-.7.4-1.6.4c-1.7 0-3-1.1-3-2.9 0-2.2 2-4.3 4.6-4.3z"/>',
  casa: '<path d="M3.4 11.2L12 3.6l8.6 7.6"/><path d="M5.4 12.6V20a1 1 0 0 0 1 1h3.4v-5.4h4.4V21h3.4a1 1 0 0 0 1-1v-7.4"/>',
  viagem:
    '<rect x="3.4" y="7.6" width="17.2" height="12.4" rx="2"/><path d="M9 7.6V5.2a1.4 1.4 0 0 1 1.4-1.4h3.2A1.4 1.4 0 0 1 15 5.2v2.4"/><path d="M9 20V7.6"/><path d="M15 20V7.6"/>',
  caixa: '<path d="M3.6 7.6L12 3.4l8.4 4.2v8.8L12 20.6l-8.4-4.2z"/><path d="M3.6 7.6L12 11.8l8.4-4.2"/><path d="M12 11.8v8.8"/>',

  /* navegação e ações */
  lista:
    '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
  tarefas:
    '<rect x="4.6" y="4.6" width="14.8" height="16.4" rx="2"/><path d="M9 3h6v3H9z"/><path d="M8.8 13l2.2 2.2 4.2-4.4"/>',
  // Controles deslizantes. Um círculo com raios sairia parecido com um sol.
  ajustes:
    '<path d="M3.6 7.4h8.2"/><path d="M16.4 7.4h4"/><path d="M3.6 16.6h4"/><path d="M12.2 16.6h8.2"/><circle cx="14.1" cy="7.4" r="2.3"/><circle cx="9.9" cy="16.6" r="2.3"/>',
  mais: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check: '<path d="M4.6 12.4l4.8 4.8 10-10.4"/>',
  lixeira:
    '<path d="M3.8 6.6h16.4"/><path d="M9 6.6V4.4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.2"/><path d="M5.8 6.6l1 13a1.4 1.4 0 0 0 1.4 1.4h7.6a1.4 1.4 0 0 0 1.4-1.4l1-13"/>',
  voltar: '<path d="M15 4.6L7.4 12l7.6 7.4"/>',
  fechar: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  busca: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.6 15.6l4.6 4.6"/>',
  editar:
    '<path d="M4 20.2l4.4-1.1L20 7.5a2 2 0 0 0 0-2.8l-.7-.7a2 2 0 0 0-2.8 0L5.1 15.8z"/><path d="M15.4 6.2l2.4 2.4"/>',
  sair: '<path d="M14.6 3.6H6.4a2 2 0 0 0-2 2v12.8a2 2 0 0 0 2 2h8.2"/><path d="M17 8.4l3.6 3.6-3.6 3.6"/><path d="M20.6 12h-9.8"/>',
  calendario:
    '<rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2"/><path d="M3.6 9.8h16.8"/><path d="M8 3.4v3.4"/><path d="M16 3.4v3.4"/>',
  pessoa:
    '<circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0"/>',
  pessoas:
    '<circle cx="9.4" cy="8.4" r="3.2"/><path d="M3.6 20a5.8 5.8 0 0 1 11.6 0"/><path d="M16.4 5.6a3.2 3.2 0 0 1 0 6"/><path d="M17.6 14.8a5.8 5.8 0 0 1 3.4 5.2"/>',
  aviso:
    '<path d="M12 4.2l8.6 15H3.4z"/><path d="M12 10v3.6"/><path d="M12 16.6h.01"/>',
  semRede:
    '<path d="M3 4l18 16"/><path d="M2.6 9.4A15 15 0 0 1 7 6.6"/><path d="M21.4 9.4a15 15 0 0 0-5.6-3.4"/><path d="M6 13a10 10 0 0 1 2.6-1.7"/><path d="M18 13a10 10 0 0 0-2.4-1.6"/><path d="M9.4 16.6a5 5 0 0 1 5.2 0"/><path d="M12 20h.01"/>',
  sacola:
    '<path d="M5.4 7.6h13.2l-1 12.2a1.6 1.6 0 0 1-1.6 1.4H8a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M8.8 10V6.6a3.2 3.2 0 0 1 6.4 0V10"/>',
  etiqueta:
    '<path d="M20.4 12.8l-7.6 7.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.4V5.4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l6.8 6.8a2 2 0 0 1 0 2z"/><path d="M8 8h.01"/>',
}

/** Devolve um <svg> pronto para inserir na tela. */
function icone(nome, tamanho) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', tamanho || 24)
  svg.setAttribute('height', tamanho || 24)
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.75')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML = ICONES[nome] || ICONES.caixa
  return svg
}

/** Marca do app: sacola com um visto dentro. */
function logo(tamanho) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 48 48')
  svg.setAttribute('width', tamanho || 40)
  svg.setAttribute('height', tamanho || 40)
  svg.setAttribute('fill', 'none')
  svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML = `
    <rect x="2" y="2" width="44" height="44" rx="13" fill="currentColor" opacity="0.12"/>
    <path d="M13 16h22l-1.7 20a3 3 0 0 1-3 2.8H17.7a3 3 0 0 1-3-2.8z"
          stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M19 19v-5a5 5 0 0 1 10 0v5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M19.5 27.5l3.6 3.6 6.4-7" stroke="currentColor" stroke-width="2.8"
          stroke-linecap="round" stroke-linejoin="round"/>`
  return svg
}
