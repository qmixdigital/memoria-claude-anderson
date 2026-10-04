/*
 * Rastreio de contato para os sites da rede QMIX.
 *
 * Captura TODO clique de WhatsApp, telefone e e-mail do site com um unico
 * ouvinte delegado no document. Nao e preciso tocar em cada botao: funciona
 * inclusive em botoes criados depois, por React ou por script.
 *
 * Dispara sempre o mesmo evento, "generate_lead", que e o nome recomendado
 * pelo Google e ja funciona com o Google Ads. O que muda entre um botao e
 * outro vai nos parametros, nunca no nome do evento. Foi justamente o
 * contrario disso que gerou contagem dobrada no GA4 do joelho, onde o mesmo
 * clique disparava "cta_cirurgia_wa" e "generate_lead" ao mesmo tempo.
 *
 * Uso em site HTML estatico, antes de </body>:
 *   <script src="/js/rastreio.js" defer></script>
 *
 * Uso em Next.js (App Router), dentro do layout:
 *   <Script src="/js/rastreio.js" strategy="afterInteractive" />
 */
(function () {
  "use strict";

  if (window.__rastreioQmix) return;   // evita ouvinte duplicado
  window.__rastreioQmix = true;

  var FILA = [];
  var tentativas = 0;

  // O GA4 destes sites carrega tarde, so apos a primeira interacao. Um clique
  // pode chegar antes do gtag existir, entao a gente enfileira e reenvia.
  function enviar(nome, parametros) {
    if (typeof window.gtag === "function") {
      window.gtag("event", nome, parametros);
      return true;
    }
    return false;
  }

  function despachar(nome, parametros) {
    if (enviar(nome, parametros)) return;
    FILA.push([nome, parametros]);
    if (tentativas) return;
    var timer = setInterval(function () {
      tentativas++;
      if (typeof window.gtag === "function") {
        while (FILA.length) enviar.apply(null, FILA.shift());
        clearInterval(timer);
      } else if (tentativas > 40) {       // desiste apos ~10s
        clearInterval(timer);
      }
    }, 250);
  }

  function tipoDoLink(href) {
    if (!href) return null;
    var h = href.toLowerCase();
    if (h.indexOf("api.whatsapp.com") > -1 || h.indexOf("wa.me") > -1 ||
        h.indexOf("web.whatsapp.com") > -1) return "whatsapp";
    if (h.indexOf("tel:") === 0) return "telefone";
    if (h.indexOf("mailto:") === 0) return "email";
    return null;
  }

  // Onde o botao fica na pagina. Serve para saber qual CTA converte, que e a
  // pergunta que o relatorio precisa responder.
  function localDoBotao(elemento) {
    var explicito = elemento.closest("[data-rastreio-local]");
    if (explicito) return explicito.getAttribute("data-rastreio-local");

    if (elemento.closest("header, .header, nav")) return "cabecalho";
    if (elemento.closest("footer, .footer")) return "rodape";
    if (elemento.closest(".hero, #hero, [class*=hero]")) return "hero";
    if (elemento.closest(".faq, #faq")) return "faq";
    if (elemento.closest("form")) return "formulario";

    // Botao flutuante: fixo na tela, geralmente no canto inferior.
    var estilo = window.getComputedStyle(elemento);
    var pai = elemento.parentElement
      ? window.getComputedStyle(elemento.parentElement) : null;
    if (estilo.position === "fixed" || (pai && pai.position === "fixed")) {
      return "botao_flutuante";
    }
    var secao = elemento.closest("section[id], section");
    if (secao && secao.id) return secao.id;
    return "conteudo";
  }

  // Fonte de icone por ligature (Material Icons e Material Symbols) escreve o
  // nome do icone DENTRO do elemento, entao ele entra no textContent e suja a
  // dimensao: o link do telefone chega ao GA4 como "phone (62) 98564-0921" e o
  // do WhatsApp como "chat Agendar pelo WhatsApp". Font Awesome nao aparece
  // aqui porque desenha por ::before, que nao conta como texto.
  var SELETOR_ICONE = '[class*="material-icons"],[class*="material-symbols"],svg';

  function texto(elemento) {
    var rotulo = elemento.getAttribute("aria-label");
    if (rotulo && rotulo.trim()) {
      return rotulo.replace(/\s+/g, " ").trim().slice(0, 80);
    }
    // Le de uma copia para poder remover os icones sem tocar na pagina.
    var origem = elemento;
    try {
      var copia = elemento.cloneNode(true);
      var icones = copia.querySelectorAll(SELETOR_ICONE);
      for (var i = 0; i < icones.length; i++) {
        icones[i].parentNode.removeChild(icones[i]);
      }
      origem = copia;
    } catch (e) {
      /* navegador antigo sem cloneNode/querySelectorAll: usa o texto cru */
    }
    var t = (origem.textContent || "").replace(/\s+/g, " ").trim();
    return t.slice(0, 80) || "sem texto";
  }

  document.addEventListener("click", function (evento) {
    var alvo = evento.target.closest ? evento.target.closest("a[href]") : null;
    if (!alvo) return;

    var tipo = tipoDoLink(alvo.getAttribute("href"));
    if (!tipo) return;

    var parametros = {
      metodo: tipo,                        // whatsapp | telefone | email
      local: localDoBotao(alvo),           // hero, rodape, botao_flutuante...
      texto_botao: texto(alvo),
      pagina: location.pathname
    };
    // Opcional: clinica com mais de um endereco marca o botao com
    // data-rastreio-unidade="nome_da_unidade" (no proprio link ou num pai).
    var unidade = alvo.closest("[data-rastreio-unidade]");
    if (unidade) parametros.unidade = unidade.getAttribute("data-rastreio-unidade");
    despachar("generate_lead", parametros);
  }, true);   // fase de captura: registra mesmo se outro script parar o evento
})();
