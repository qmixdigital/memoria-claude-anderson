<?php
// Acha posts cujo TITULO e vazamento de raciocinio de IA em vez de manchete.
// Saida TSV: host, ID, permalink, titulo, trecho do conteudo (para reescrita).
global $wpdb;
$host = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));

$rows = $wpdb->get_results(
    "SELECT ID, post_title, post_content, post_date FROM {$wpdb->posts}
     WHERE post_type='post' AND post_status IN ('publish','draft','pending')"
);

// Sinais fortes apenas. Palavra solta no inicio ("Primeiro", "Preciso",
// "Analisando") pega manchete legitima: "Primeiro panda-gigante da Indonesia
// e apresentado", "Preciso de contabilidade na minha empresa?". Cada alternativa
// abaixo so ocorre em texto de raciocinio, nunca em manchete publicavel.
$padrao = '/^\s*hmm\b'
        . '|^\s*(ok|okay|certo|bem)\s*,\s*(o\s+usu|preciso|vamos|vou|entendi|analis)'
        . '|usu[áa]rio (pede|pediu|solicita|solicitou|quer|queria|precisa|precisava|forneceu|informou)'
        . '|t[íi]tulo jornal[íi]stico'
        . '|com base n(?:as|a) informa[çc][õo]es (fornecidas|espec[íi]ficas)'
        . '|o t[íi]tulo (deve|precisa|original)'
        . '|limite de \d+ caracteres'
        . '|vamos analisar'
        . '|as instru[çc][õo]es (dizem|pedem|s[ãa]o)'
        . '|preciso (criar|gerar|analisar|entender)\s+(um|o|a)?\s*t[íi]tulo/iu';

foreach ($rows as $r) {
    $t = trim($r->post_title);
    if (!preg_match($padrao, $t)) { continue; }

    $txt = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($r->post_content)));
    echo $host . "\t" . $r->ID . "\t" . get_permalink($r->ID) . "\t"
       . str_replace(array("\t", "\n"), ' ', $t) . "\t"
       . mb_substr($txt, 0, 420) . "\n";
}
