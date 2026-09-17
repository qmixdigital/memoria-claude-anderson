<?php
/**
 * Plugin Name: Seguidores Brasil - App (PWA) + Desconto 10%
 * Description: Site instalavel (PWA) + barra fixa incentivando a instalar o app + 10% de desconto automatico em toda compra feita pelo aplicativo (cupom APP10). Independente do tema/Elementor.
 * Author: QMIX
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) { exit; }

/* ============================================================
 * 1) TAGS PWA no <head>
 * ============================================================ */
add_action('wp_head', function () {
    echo "\n<!-- Seguidores Brasil PWA -->\n";
    echo '<link rel="manifest" href="/manifest.webmanifest">' . "\n";
    echo '<meta name="theme-color" content="#1a5cff">' . "\n";
    echo '<meta name="mobile-web-app-capable" content="yes">' . "\n";
    echo '<meta name="apple-mobile-web-app-capable" content="yes">' . "\n";
    echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">' . "\n";
    echo '<meta name="apple-mobile-web-app-title" content="Seguidores BR">' . "\n";
    echo '<link rel="apple-touch-icon" href="/app-icon-192.png">' . "\n";
}, 2);

/* ============================================================
 * 2) DESCONTO 10% automatico quando a compra vem do app
 * ============================================================ */
add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX')) { return; }
    if (empty($_COOKIE['sb_app']) || $_COOKIE['sb_app'] !== '1') { return; }
    if (!function_exists('WC') || !WC()->cart) { return; }
    if (method_exists($cart, 'is_empty') && $cart->is_empty()) { return; }
    if (!$cart->has_discount('APP10')) {
        $cart->apply_coupon('APP10');
    }
}, 20, 1);

/* Se NAO veio do app, remove o cupom (so vale dentro do app) */
add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX')) { return; }
    if (!empty($_COOKIE['sb_app']) && $_COOKIE['sb_app'] === '1') { return; }
    if (!function_exists('WC') || !WC()->cart) { return; }
    if ($cart->has_discount('APP10')) {
        $cart->remove_coupon('APP10');
    }
}, 21, 1);

/* Rotulo amigavel do cupom no total do checkout */
add_filter('woocommerce_cart_totals_coupon_label', function ($label, $coupon) {
    if ($coupon && strtolower($coupon->get_code()) === 'app10') {
        return '🎉 Desconto do app (10%)';
    }
    return $label;
}, 10, 2);

/* ============================================================
 * 3) Service worker + barra fixa (instalar / desconto ativo)
 * ============================================================ */
add_action('wp_footer', function () {
    if (is_admin()) { return; }
    ?>
<style id="sb-pwa-css">
:root{--sb-abh:0px}
html.sb-appbar-on body{padding-top:var(--sb-abh) !important}
html.sb-appbar-on header.fixed,html.sb-appbar-on header[class*="fixed"]{top:var(--sb-abh) !important}
.sb-abar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:none;isolation:isolate;
  font-family:-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff}
.sb-abar.on{display:block}
.sb-abar-in{display:none;position:relative;overflow:hidden;padding:11px 16px;
  min-height:44px;width:100%;box-sizing:border-box;text-align:center;line-height:1.34}
.sb-abar-in.sb-on{display:block}

/* ---- gradiente vivo, fluindo devagar ---- */
.sb-abar--install{cursor:pointer;
  background:linear-gradient(115deg,#1550ff 0%,#4b39ff 32%,#8a3dff 58%,#1a5cff 100%);
  background-size:280% 100%;animation:sbFlow 10s ease-in-out infinite}
.sb-abar--active{padding-right:44px;
  background:linear-gradient(115deg,#0eb37e 0%,#12c98f 34%,#0c9f74 66%,#0eb37e 100%);
  background-size:280% 100%;animation:sbFlow 10s ease-in-out infinite}
@keyframes sbFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

/* ---- brilho "foil" passando (chamariz principal, discreto, ~7s) ---- */
.sb-abar-in::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(100deg,transparent 40%,rgba(255,255,255,.42) 50%,transparent 60%);
  transform:translateX(-130%);animation:sbShine 7s cubic-bezier(.5,0,.3,1) 2.5s infinite}
@keyframes sbShine{0%{transform:translateX(-130%)}14%{transform:translateX(130%)}100%{transform:translateX(130%)}}

/* ---- emoji balança de leve de vez em quando ---- */
.sb-abar-emoji{font-size:16px;margin-right:5px;display:inline-block;transform-origin:65% 70%;
  animation:sbWiggle 5s ease-in-out 1.2s infinite}
@keyframes sbWiggle{0%,84%,100%{transform:rotate(0) scale(1)}88%{transform:rotate(-13deg) scale(1.18)}
  92%{transform:rotate(10deg) scale(1.18)}96%{transform:rotate(-4deg) scale(1.06)}}

.sb-abar-tx{font-size:13px;font-weight:600;letter-spacing:.005em;white-space:normal !important;overflow-wrap:anywhere}
/* ---- "10% OFF" vira selo branco que respira (destaca o desconto) ---- */
.sb-abar-tx b{font-weight:900;color:#1550ff;background:#fff;border-radius:7px;padding:1px 7px;
  display:inline-block;box-shadow:0 0 0 0 rgba(255,255,255,.7);animation:sbBadge 2.6s ease-in-out infinite}
.sb-abar--active .sb-abar-tx b{color:#0c9f74}
@keyframes sbBadge{0%,100%{transform:translateY(0) scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.65)}
  50%{transform:translateY(-1px) scale(1.05);box-shadow:0 0 16px 3px rgba(255,255,255,.45)}}

/* ---- seta convida ao toque (como ganhar) ---- */
.sb-abar-cta{font-weight:900;display:inline-block;animation:sbNudge 1.9s ease-in-out infinite}
@keyframes sbNudge{0%,55%,100%{transform:translateX(0)}72%{transform:translateX(6px)}86%{transform:translateX(2px)}}

.sb-abar-x{position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:2;
  width:24px;height:24px;border:0;border-radius:50%;background:rgba(255,255,255,.25);
  color:#fff;font-size:15px;line-height:1;cursor:pointer}
@media(max-width:400px){.sb-abar-tx{font-size:12.5px}}

/* ---- entrada: desce do topo ao aparecer ---- */
.sb-abar.on{animation:sbDrop .55s cubic-bezier(.2,.85,.3,1.15) both}
@keyframes sbDrop{from{transform:translateY(-105%)}to{transform:translateY(0)}}

/* ---- respeita quem prefere menos movimento ---- */
@media(prefers-reduced-motion:reduce){
  .sb-abar.on,.sb-abar--install,.sb-abar--active,.sb-abar-in::after,
  .sb-abar-emoji,.sb-abar-tx b,.sb-abar-cta{animation:none !important}
  .sb-abar-tx b{box-shadow:none;transform:none}
  .sb-abar-in::after{display:none}
}

/* modal de instrucoes */
.sb-pwa-ov{position:fixed;inset:0;z-index:100001;display:none;background:rgba(6,12,34,.55);
  backdrop-filter:blur(3px);align-items:flex-end;justify-content:center;font-family:-apple-system,"Segoe UI",Roboto,sans-serif}
.sb-pwa-ov.on{display:flex;animation:sbfade .25s ease}
@keyframes sbfade{from{opacity:0}to{opacity:1}}
.sb-pwa-modal{background:#fff;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding:24px 22px 30px;
  box-shadow:0 -20px 60px -20px rgba(0,0,0,.5);animation:sbup .3s ease}
@keyframes sbup{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
@media(min-width:520px){.sb-pwa-ov{align-items:center}.sb-pwa-modal{border-radius:22px}}
.sb-pwa-mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.sb-pwa-mh h3{margin:0;font-size:1.2rem;font-weight:900;color:#0e1730}
.sb-pwa-mh button{border:0;background:#f0f3fa;width:34px;height:34px;border-radius:10px;font-size:20px;color:#5c6a88;cursor:pointer}
.sb-pwa-msub{color:#5c6a88;font-size:13px;margin:0 0 18px}
.sb-pwa-step{display:flex;gap:13px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(14,23,48,.07)}
.sb-pwa-step:last-child{border-bottom:0}
.sb-pwa-n{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1a5cff,#6a3cff);
  color:#fff;font-weight:800;display:grid;place-items:center;font-size:14px}
.sb-pwa-step p{margin:2px 0 0;color:#20304f;font-size:14.5px;line-height:1.5}
.sb-pwa-step .k{display:inline-block;background:#eef3ff;border:1px solid rgba(26,92,255,.2);color:#1a5cff;
  font-weight:700;padding:1px 8px;border-radius:7px;font-size:13px}
.sb-pwa-badge{margin-top:16px;text-align:center;background:rgba(18,184,134,.1);border:1px solid rgba(18,184,134,.25);
  color:#0c8f68;font-weight:700;font-size:13.5px;border-radius:12px;padding:11px}
</style>

<div class="sb-abar" id="sbAbar" role="region" aria-label="Aplicativo Seguidores Brasil">
  <div class="sb-abar-in sb-abar--install" id="sbAbarInstall" role="button" tabindex="0">
    <span class="sb-abar-emoji">💸</span>
    <span class="sb-abar-tx">Baixe o app e ganhe <b>10% OFF</b> <span class="sb-abar-cta">&rarr;</span></span>
  </div>
  <div class="sb-abar-in sb-abar--active" id="sbAbarActive">
    <span class="sb-abar-emoji">🎉</span>
    <span class="sb-abar-tx"><b>10% OFF</b> ativo — entra sozinho no checkout</span>
    <button class="sb-abar-x" data-x="sb_active_x" aria-label="Fechar">&times;</button>
  </div>
</div>

<div class="sb-pwa-ov" id="sbPwaOv">
  <div class="sb-pwa-modal">
    <div class="sb-pwa-mh">
      <h3>Instalar o app em 3 passos</h3>
      <button id="sbPwaClose" aria-label="Fechar">&times;</button>
    </div>
    <p class="sb-pwa-msub">Rápido, grátis e não ocupa espaço. É só seguir:</p>
    <div id="sbPwaSteps"></div>
    <div class="sb-pwa-badge">🎉 Comprando pelo app você ganha 10% de desconto</div>
  </div>
</div>

<script id="sb-pwa-js">
(function(){
  "use strict";
  var mm = window.matchMedia && window.matchMedia("(display-mode: standalone)");
  var isStandalone = (mm && mm.matches) || window.navigator.standalone === true;
  var ua = (navigator.userAgent || "").toLowerCase();
  var isIOS = /iphone|ipad|ipod/.test(ua) && !("MSStream" in window);
  var isMobile = /android|iphone|ipad|ipod/.test(ua);
  var isDesktop = !isMobile;

  function setCookie(n,v,days){var d=new Date();d.setTime(d.getTime()+days*864e5);
    document.cookie=n+"="+v+";expires="+d.toUTCString()+";path=/;SameSite=Lax";}

  if ("serviceWorker" in navigator) {
    window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){});});
  }

  if (isStandalone) { setCookie("sb_app","1",365); } else { setCookie("sb_app","",-1); }

  var abar=document.getElementById("sbAbar");
  var elInstall=document.getElementById("sbAbarInstall");
  var elActive=document.getElementById("sbAbarActive");
  var ov=document.getElementById("sbPwaOv");
  var stepsBox=document.getElementById("sbPwaSteps");
  var deferred=null;

  // move a barra e o modal pro final do <body> (escapa de wrapper/stacking context da home)
  try{ if(document.body){ if(abar) document.body.appendChild(abar); if(ov) document.body.appendChild(ov); } }catch(e){}

  // mantem o empurrao do header IGUAL a altura real da barra (1 ou 2 linhas, fonte, giro de tela)
  if (abar && window.ResizeObserver){ try{ new ResizeObserver(function(){ applyOffset(); }).observe(abar); }catch(e){} }
  setTimeout(function(){ applyOffset(); }, 250);
  setTimeout(function(){ applyOffset(); }, 900);
  if (window.matchMedia){ try{ window.matchMedia("(orientation:portrait)").addEventListener("change", function(){ setTimeout(applyOffset,120); }); }catch(e){} }

  function applyOffset(){ if(!abar)return; var h=abar.classList.contains("on")?abar.offsetHeight:0;
    document.documentElement.style.setProperty("--sb-abh",h+"px"); }
  function showBar(inner){ if(!abar||!inner)return; inner.classList.add("sb-on");
    abar.classList.add("on"); document.documentElement.classList.add("sb-appbar-on"); applyOffset(); }
  function hideBar(){ if(!abar)return; abar.classList.remove("on");
    document.documentElement.classList.remove("sb-appbar-on");
    document.documentElement.style.setProperty("--sb-abh","0px"); }
  function wireX(){ var xs=abar.querySelectorAll(".sb-abar-x"); for(var i=0;i<xs.length;i++){
    (function(b){ b.onclick=function(){ try{sessionStorage.setItem(b.getAttribute("data-x"),"1");}catch(e){} hideBar(); }; })(xs[i]); } }

  function stepsIOS(){
    return '<div class="sb-pwa-step"><div class="sb-pwa-n">1</div><p>Toque no ícone <span class="k">Compartilhar &#x2191;</span> na barra do Safari (embaixo da tela).</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">2</div><p>Role a lista e toque em <span class="k">Adicionar à Tela de Início &#x2b;</span>.</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">3</div><p>Toque em <span class="k">Adicionar</span> (canto superior). Pronto! 🎉</p></div>';
  }
  function stepsAndroid(){
    return '<div class="sb-pwa-step"><div class="sb-pwa-n">1</div><p>Toque no menu <span class="k">&#x22ee;</span> do navegador (canto superior direito).</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">2</div><p>Toque em <span class="k">Instalar app</span> ou <span class="k">Adicionar à tela inicial</span>.</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">3</div><p>Confirme e abra pelo ícone na tela inicial. Pronto! 🎉</p></div>';
  }
  function stepsDesktop(){
    return '<div class="sb-pwa-step"><div class="sb-pwa-n">1</div><p>Na barra de endereço do Chrome ou Edge, clique no ícone <span class="k">Instalar &#x2b;</span> (ou no menu <span class="k">&#x22ee;</span> &rarr; Instalar).</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">2</div><p>Confirme em <span class="k">Instalar</span>.</p></div>'
      + '<div class="sb-pwa-step"><div class="sb-pwa-n">3</div><p>O app abre em janela própria. Pronto! 🎉</p></div>';
  }
  function openModal(){ if(!ov)return; stepsBox.innerHTML=isDesktop?stepsDesktop():(isIOS?stepsIOS():stepsAndroid()); ov.classList.add("on"); }
  function closeModal(){ if(ov) ov.classList.remove("on"); }

  // MODO 1: ja no app -> barra verde "10% ativo"
  if (isStandalone) {
    try{ if(sessionStorage.getItem("sb_active_x")==="1") return; }catch(e){}
    showBar(elActive); wireX();
    window.addEventListener("load",applyOffset);
    window.addEventListener("resize",applyOffset);
    return;
  }

  // MODO 2: navegador (celular ou computador) -> barra "Baixe o app"
  window.addEventListener("beforeinstallprompt",function(e){ e.preventDefault(); deferred=e; });
  window.addEventListener("appinstalled",function(){ hideBar(); setCookie("sb_app","1",365);
    try{ fetch("/wp-admin/admin-ajax.php?action=sb_app_installed",{method:"POST",keepalive:true,credentials:"omit"}); }catch(e){} });

  showBar(elInstall); wireX();
  function doInstall(){
    if(deferred){ deferred.prompt(); deferred.userChoice.finally(function(){ deferred=null; }); }
    else { openModal(); }
  }
  if(elInstall){ elInstall.onclick=doInstall;
    elInstall.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); doInstall(); } }; }
  var cl=document.getElementById("sbPwaClose"); if(cl) cl.onclick=closeModal;
  if(ov) ov.addEventListener("click",function(e){ if(e.target===ov) closeModal(); });
  window.addEventListener("load",applyOffset);
  window.addEventListener("resize",applyOffset);
})();
</script>
    <?php
}, 99);
