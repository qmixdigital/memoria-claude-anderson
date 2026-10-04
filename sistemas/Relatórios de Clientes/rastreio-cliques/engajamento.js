/*
 * Rastreio de engajamento para os sites da rede QMIX.
 *
 * Complementa o rastreio.js (que cuida do contato: WhatsApp, telefone e
 * e-mail) com o que mais o cliente quer saber: onde as pessoas clicam, quais
 * chamadas funcionam e ate onde leem.
 *
 * Eventos enviados ao GA4 (o que distingue um clique do outro vai nos
 * parametros, nunca no nome do evento):
 *
 *   social_click   rede, local, texto_botao, pagina
 *                  clique em Instagram, YouTube, Facebook, Doctoralia, Google
 *                  Maps, LinkedIn, TikTok
 *   cta_click      texto_botao, local, destino (link interno), pagina
 *                  clique em botao de chamada que NAO e contato direto
 *                  (ex.: "Agendar Consulta" que rola ate a secao)
 *   faq_open       pergunta, pagina
 *                  abertura de uma pergunta do FAQ (<details>)
 *   leitura        profundidade (25 | 50 | 75 | 100), pagina
 *                  ate onde o leitor chegou num artigo do blog
 *   video_play     titulo_video, pagina
 *                  clique no facade do YouTube (antes do iframe existir)
 *   share          method, content_type, item_id, pagina
 *                  botao de compartilhar do artigo (elemento com
 *                  data-rastreio-compartilhar="whatsapp|copiar_link|...")
 *
 * Dimensoes personalizadas necessarias no GA4 (escopo evento):
 *   rede, local, texto_botao, pergunta, profundidade, method
 *
 * Uso, antes de </body> ou no <head> com defer:
 *   <script src="/js/engajamento.js" defer></script>
 */
(function () {
  "use strict";

  if (window.__engajamentoQmix) return;
  window.__engajamentoQmix = true;

  var FILA = [];
  var tentativas = 0;

  function enviar(nome, parametros) {
    if (typeof window.gtag === "function") {
      window.gtag("event", nome, parametros);
      return true;
    }
    return false;
  }

  function despachar(nome, parametros) {
    parametros.pagina = location.pathname;
    if (enviar(nome, parametros)) return;
    FILA.push([nome, parametros]);
    if (tentativas) return;
    var timer = setInterval(function () {
      tentativas++;
      if (typeof window.gtag === "function") {
        while (FILA.length) enviar.apply(null, FILA.shift());
        clearInterval(timer);
      } else if (tentativas > 40) {
        clearInterval(timer);
      }
    }, 250);
  }

  // ---------------------------------------------------------------- redes
  var REDES = [
    ["instagram.com", "instagram"], ["youtube.com", "youtube"], ["youtu.be", "youtube"],
    ["facebook.com", "facebook"], ["doctoralia.com", "doctoralia"],
    ["maps.app.goo.gl", "google_maps"], ["google.com/maps", "google_maps"], ["goo.gl/maps", "google_maps"],
    ["linkedin.com", "linkedin"], ["tiktok.com", "tiktok"], ["g.page", "google_perfil"]
  ];

  function redeDoLink(href) {
    if (!href) return null;
    var h = href.toLowerCase();
    for (var i = 0; i < REDES.length; i++) {
      if (h.indexOf(REDES[i][0]) > -1) return REDES[i][1];
    }
    return null;
  }

  // Mesma logica do rastreio.js, para o parametro "local" bater nos dois.
  function localDoBotao(elemento) {
    var explicito = elemento.closest("[data-rastreio-local]");
    if (explicito) return explicito.getAttribute("data-rastreio-local");
    if (elemento.closest("header, .header, nav")) return "cabecalho";
    if (elemento.closest("footer, .footer")) return "rodape";
    if (elemento.closest(".hero, #hero, [class*=hero]")) return "hero";
    if (elemento.closest(".faq, #faq")) return "faq";
    if (elemento.closest("form")) return "formulario";
    var estilo = window.getComputedStyle(elemento);
    var pai = elemento.parentElement ? window.getComputedStyle(elemento.parentElement) : null;
    if (estilo.position === "fixed" || (pai && pai.position === "fixed")) return "botao_flutuante";
    var secao = elemento.closest("section[id], section");
    if (secao && secao.id) return secao.id;
    return "conteudo";
  }

  function texto(elemento) {
    var rotulo = elemento.getAttribute("aria-label");
    if (rotulo && rotulo.trim()) return rotulo.replace(/\s+/g, " ").trim().slice(0, 80);
    var origem = elemento;
    try {
      var copia = elemento.cloneNode(true);
      var icones = copia.querySelectorAll('[class*="material-icons"],[class*="material-symbols"],svg');
      for (var i = 0; i < icones.length; i++) icones[i].parentNode.removeChild(icones[i]);
      origem = copia;
    } catch (e) { /* usa o texto cru */ }
    var t = (origem.textContent || "").replace(/\s+/g, " ").trim();
    return t.slice(0, 80) || "sem texto";
  }

  // Botoes de chamada internos (rolam ate uma secao ou levam a outra pagina).
  var SELETOR_CTA = ".btn-agendar, .nav-cta, .btn-cta-primary, .btn-cta-secondary, .btn-read-more, .btn-primary, .btn-whatsapp-main, [data-rastreio-cta]";

  function ehContatoDireto(href) {
    var h = (href || "").toLowerCase();
    return h.indexOf("wa.me") > -1 || h.indexOf("whatsapp.com") > -1 ||
      h.indexOf("tel:") === 0 || h.indexOf("mailto:") === 0;
  }

  document.addEventListener("click", function (evento) {
    var alvo = evento.target.closest ? evento.target.closest("a[href], button") : null;
    if (!alvo) return;
    var href = alvo.getAttribute("href") || "";

    // Contato direto e do rastreio.js; aqui nao se repete.
    if (ehContatoDireto(href)) return;

    var rede = redeDoLink(href);
    if (rede) {
      despachar("social_click", { rede: rede, local: localDoBotao(alvo), texto_botao: texto(alvo) });
      return;
    }

    if (alvo.matches && alvo.matches(SELETOR_CTA)) {
      var dados = { texto_botao: texto(alvo), local: localDoBotao(alvo) };
      // destino: para onde o clique leva (pagina interna ou ancora da pagina)
      if (href && (href.charAt(0) === "/" || href.charAt(0) === "#")) dados.destino = href.slice(0, 100);
      despachar("cta_click", dados);
    }
  }, true);

  // ------------------------------------------------------------------ FAQ
  document.addEventListener("toggle", function (evento) {
    var el = evento.target;
    if (!el || el.tagName !== "DETAILS" || !el.open) return;
    var resumo = el.querySelector("summary");
    if (!resumo) return;
    despachar("faq_open", { pergunta: texto(resumo).slice(0, 100) });
  }, true);

  // ------------------------------------------------------------- leitura
  // So em pagina de artigo: mede ate onde o leitor chegou no corpo do texto.
  var artigo = document.querySelector(".post-conteudo, article .entry-content, article.post, [data-rastreio-leitura]");
  if (artigo && "IntersectionObserver" in window) {
    var marcos = [25, 50, 75, 100];
    var enviados = {};
    function verificar() {
      var r = artigo.getBoundingClientRect();
      var altura = r.height || 1;
      var lido = Math.min(altura, Math.max(0, window.innerHeight - r.top));
      var pct = Math.round((lido / altura) * 100);
      for (var i = 0; i < marcos.length; i++) {
        var m = marcos[i];
        if (pct >= m && !enviados[m]) {
          enviados[m] = true;
          despachar("leitura", { profundidade: String(m) });
        }
      }
      if (enviados[100]) window.removeEventListener("scroll", agendar);
    }
    var pendente = false;
    function agendar() {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(function () { pendente = false; verificar(); });
    }
    window.addEventListener("scroll", agendar, { passive: true });
    setTimeout(verificar, 1500);
  }

  // --------------------------------------------------------- compartilhar
  // "share" e o nome recomendado pelo Google; "method" diz por onde.
  document.addEventListener("click", function (evento) {
    var botao = evento.target.closest ? evento.target.closest("[data-rastreio-compartilhar]") : null;
    if (!botao) return;
    despachar("share", {
      method: botao.getAttribute("data-rastreio-compartilhar") || "outro",
      content_type: "artigo",
      item_id: location.pathname
    });
  }, true);

  // --------------------------------------------------------------- video
  document.addEventListener("click", function (evento) {
    var facade = evento.target.closest ? evento.target.closest(".lite-yt-short, .lite-youtube, [data-videoid]") : null;
    if (!facade || facade.classList.contains("activated")) return;
    despachar("video_play", {
      titulo_video: (facade.getAttribute("aria-label") || facade.getAttribute("data-titulo") || facade.getAttribute("data-videoid") || "video").slice(0, 80)
    });
  }, true);
})();
