/* Categorias padrão e catálogo de produtos comuns.
   Serve para montar a lista marcando itens, sem precisar digitar.
   É dado do aplicativo, não do banco, então não consome cota nem sincronização. */

'use strict'

const CATEGORIAS_PADRAO = [
  { nome: 'Mercearia', icone: 'carrinho', chave: 'mercearia' },
  { nome: 'Hortifrúti', icone: 'fruta', chave: 'hortifruti' },
  { nome: 'Carnes e Frios', icone: 'carne', chave: 'carnes' },
  { nome: 'Laticínios e Ovos', icone: 'leite', chave: 'laticinios' },
  { nome: 'Padaria', icone: 'pao', chave: 'padaria' },
  { nome: 'Bebidas', icone: 'bebida', chave: 'bebidas' },
  { nome: 'Congelados', icone: 'gelo', chave: 'congelados' },
  { nome: 'Limpeza', icone: 'limpeza', chave: 'limpeza' },
  { nome: 'Higiene Pessoal', icone: 'higiene', chave: 'higiene' },
  { nome: 'Farmácia', icone: 'remedio', chave: 'farmacia' },
  { nome: 'Pet', icone: 'pet', chave: 'pet' },
  { nome: 'Casa e Utilidades', icone: 'casa', chave: 'casa' },
  { nome: 'Viagem', icone: 'viagem', chave: 'viagem' },
]

const CATALOGO = {
  mercearia: [
    'Arroz branco', 'Arroz integral', 'Arroz parboilizado', 'Feijão carioca',
    'Feijão preto', 'Lentilha', 'Grão de bico', 'Macarrão espaguete',
    'Macarrão parafuso', 'Macarrão instantâneo', 'Lasanha massa', 'Farinha de trigo',
    'Farinha de mandioca', 'Farofa pronta', 'Fubá', 'Amido de milho', 'Aveia',
    'Granola', 'Cereal matinal', 'Açúcar refinado', 'Açúcar mascavo', 'Adoçante',
    'Sal', 'Café em pó', 'Café solúvel', 'Cápsula de café', 'Chá', 'Achocolatado em pó',
    'Leite em pó', 'Leite condensado', 'Creme de leite', 'Óleo de soja', 'Azeite de oliva',
    'Vinagre', 'Molho de tomate', 'Extrato de tomate', 'Maionese', 'Ketchup', 'Mostarda',
    'Shoyu', 'Atum em lata', 'Sardinha em lata', 'Milho em conserva', 'Ervilha em conserva',
    'Seleta de legumes', 'Azeitona', 'Palmito', 'Leite de coco', 'Coco ralado',
    'Biscoito recheado', 'Biscoito água e sal', 'Bolacha maisena', 'Torrada',
    'Bolo pronto', 'Gelatina', 'Pudim em pó', 'Chocolate em barra', 'Bala',
    'Pipoca de micro-ondas', 'Amendoim', 'Castanha', 'Uva passa', 'Mel', 'Geleia',
    'Creme de avelã', 'Tempero completo', 'Alho e sal', 'Orégano', 'Pimenta do reino',
    'Colorau', 'Canela', 'Louro', 'Caldo de galinha', 'Fermento em pó',
  ],
  hortifruti: [
    'Banana', 'Maçã', 'Laranja', 'Limão', 'Mamão', 'Melancia', 'Melão', 'Abacaxi',
    'Uva', 'Pera', 'Manga', 'Morango', 'Abacate', 'Kiwi', 'Goiaba', 'Tangerina',
    'Maracujá', 'Coco', 'Ameixa', 'Pêssego', 'Tomate', 'Cebola', 'Alho', 'Batata',
    'Batata doce', 'Cenoura', 'Beterraba', 'Mandioca', 'Inhame', 'Abóbora',
    'Abobrinha', 'Chuchu', 'Berinjela', 'Pepino', 'Pimentão', 'Quiabo', 'Vagem',
    'Milho verde', 'Alface', 'Rúcula', 'Agrião', 'Couve', 'Repolho', 'Brócolis',
    'Couve-flor', 'Espinafre', 'Cheiro verde', 'Salsinha', 'Coentro', 'Manjericão',
    'Hortelã', 'Gengibre', 'Cogumelo', 'Ovo caipira',
  ],
  carnes: [
    'Carne moída', 'Patinho', 'Alcatra', 'Coxão mole', 'Coxão duro', 'Acém',
    'Picanha', 'Contrafilé', 'Maminha', 'Fraldinha', 'Costela bovina', 'Músculo',
    'Frango inteiro', 'Peito de frango', 'Coxa e sobrecoxa', 'Asa de frango',
    'Filé de frango', 'Coração de frango', 'Lombo suíno', 'Costela suína',
    'Pernil', 'Bisteca', 'Linguiça toscana', 'Linguiça calabresa', 'Bacon',
    'Salsicha', 'Presunto', 'Mortadela', 'Peito de peru', 'Salame',
    'Tilápia', 'Salmão', 'Sardinha fresca', 'Camarão', 'Bacalhau', 'Carne seca',
  ],
  laticinios: [
    'Leite integral', 'Leite desnatado', 'Leite sem lactose', 'Iogurte natural',
    'Iogurte de frutas', 'Bebida láctea', 'Coalhada', 'Manteiga', 'Margarina',
    'Requeijão', 'Cream cheese', 'Queijo mussarela', 'Queijo prato', 'Queijo minas',
    'Queijo coalho', 'Queijo parmesão', 'Queijo ralado', 'Ricota', 'Nata',
    'Creme de leite fresco', 'Ovos brancos', 'Ovos vermelhos', 'Doce de leite',
  ],
  padaria: [
    'Pão francês', 'Pão de forma', 'Pão integral', 'Pão de queijo', 'Pão doce',
    'Pão sírio', 'Pão de hambúrguer', 'Pão de hot dog', 'Bisnaguinha', 'Croissant',
    'Sonho', 'Rosquinha', 'Bolo caseiro', 'Torta salgada', 'Coxinha', 'Empada',
    'Broa de milho', 'Baguete',
  ],
  bebidas: [
    'Água mineral', 'Água com gás', 'Água de coco', 'Refrigerante cola',
    'Refrigerante guaraná', 'Refrigerante laranja', 'Refrigerante limão',
    'Suco de laranja', 'Suco de uva', 'Suco em pó', 'Néctar de fruta', 'Chá gelado',
    'Energético', 'Isotônico', 'Cerveja', 'Vinho tinto', 'Vinho branco', 'Espumante',
    'Cachaça', 'Vodka', 'Whisky', 'Gin', 'Água tônica', 'Xarope de groselha',
    'Leite fermentado', 'Café gelado',
  ],
  congelados: [
    'Pizza congelada', 'Lasanha congelada', 'Nuggets', 'Hambúrguer congelado',
    'Batata frita congelada', 'Empanado de frango', 'Pão de queijo congelado',
    'Sorvete', 'Açaí', 'Polpa de fruta', 'Ervilha congelada', 'Brócolis congelado',
    'Peixe empanado', 'Massa folhada', 'Torta congelada', 'Gelo',
  ],
  limpeza: [
    'Detergente', 'Sabão em pó', 'Sabão líquido', 'Sabão em barra', 'Amaciante',
    'Alvejante', 'Água sanitária', 'Desinfetante', 'Limpador multiuso',
    'Limpa vidros', 'Limpa forno', 'Desengordurante', 'Lustra móveis',
    'Limpador de piso', 'Removedor', 'Cera líquida', 'Tira manchas',
    'Sabão para louça em gel', 'Esponja de aço', 'Esponja de louça', 'Pano de prato',
    'Pano de chão', 'Flanela', 'Rodo', 'Vassoura', 'Pá de lixo', 'Balde',
    'Escova de limpeza', 'Escova sanitária', 'Luva de borracha', 'Saco de lixo',
    'Papel toalha', 'Guardanapo', 'Bloco sanitário', 'Odorizador de ambiente',
    'Inseticida', 'Naftalina', 'Álcool de limpeza',
  ],
  higiene: [
    'Papel higiênico', 'Sabonete em barra', 'Sabonete líquido', 'Shampoo',
    'Condicionador', 'Creme para pentear', 'Máscara capilar', 'Creme dental',
    'Escova de dentes', 'Fio dental', 'Enxaguante bucal', 'Desodorante roll on',
    'Desodorante aerosol', 'Antitranspirante', 'Perfume', 'Talco',
    'Hidratante corporal', 'Creme para as mãos', 'Protetor solar', 'Pós-barba',
    'Aparelho de barbear', 'Lâmina de barbear', 'Espuma de barbear', 'Cera depilatória',
    'Absorvente', 'Protetor diário', 'Coletor menstrual', 'Cotonete', 'Algodão',
    'Lenço de papel', 'Lenço umedecido', 'Cortador de unha', 'Esmalte', 'Acetona',
    'Escova de cabelo', 'Elástico de cabelo', 'Fralda geriátrica',
  ],
  farmacia: [
    'Dipirona', 'Paracetamol', 'Ibuprofeno', 'Analgésico infantil', 'Antialérgico',
    'Antiácido', 'Sal de fruta', 'Antigripal', 'Xarope para tosse', 'Pastilha para garganta',
    'Descongestionante nasal', 'Soro fisiológico', 'Álcool 70', 'Álcool em gel',
    'Água oxigenada', 'Curativo', 'Band-aid', 'Gaze', 'Esparadrapo', 'Atadura',
    'Pomada cicatrizante', 'Pomada para assadura', 'Anti-inflamatório tópico',
    'Repelente', 'Colírio', 'Vitamina C', 'Vitamina D', 'Complexo B', 'Whey protein',
    'Termômetro', 'Máscara descartável', 'Teste de farmácia', 'Soro caseiro',
    'Protetor labial', 'Antisséptico',
  ],
  pet: [
    'Ração para cão', 'Ração para gato', 'Ração filhote', 'Sachê para cão',
    'Sachê para gato', 'Petisco', 'Osso para cachorro', 'Areia higiênica',
    'Tapete higiênico', 'Shampoo para pet', 'Antipulgas', 'Vermífugo',
    'Brinquedo para pet', 'Coleira', 'Comedouro', 'Bebedouro', 'Arranhador',
  ],
  casa: [
    'Pilha AA', 'Pilha AAA', 'Lâmpada LED', 'Fósforo', 'Isqueiro', 'Vela',
    'Papel alumínio', 'Filme plástico', 'Papel manteiga', 'Saco para freezer',
    'Pote plástico', 'Copo descartável', 'Prato descartável', 'Talher descartável',
    'Palito de dente', 'Canudo', 'Fita adesiva', 'Cola', 'Barbante', 'Pregador de roupa',
    'Cabide', 'Extensão elétrica', 'Fita isolante', 'Pilha de controle',
    'Filtro de café', 'Toalha de papel', 'Lixeira', 'Cesto de roupa',
  ],
  viagem: [
    'Protetor solar', 'Repelente', 'Carregador de celular', 'Power bank',
    'Adaptador de tomada', 'Fone de ouvido', 'Travesseiro de pescoço', 'Máscara de dormir',
    'Necessaire', 'Escova de dentes de viagem', 'Shampoo pequeno', 'Sabonete pequeno',
    'Toalha de banho', 'Chinelo', 'Roupa de banho', 'Óculos de sol', 'Boné',
    'Guarda-chuva', 'Capa de chuva', 'Documentos', 'Dinheiro trocado', 'Cadeado de mala',
    'Remédios de uso contínuo', 'Kit primeiros socorros', 'Garrafa de água',
    'Lanche para viagem', 'Cartão de embarque', 'Seguro viagem',
  ],
}

/** Total de produtos disponíveis, usado na tela do catálogo. */
const TOTAL_CATALOGO = Object.values(CATALOGO).reduce((n, l) => n + l.length, 0)

/** Remove acentos e caixa, para a busca não depender de digitação exata. */
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
