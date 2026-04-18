/**
 * i18n/pt.ts — Portuguese translations (default language)
 */
const pt = {
  // Home
  home_subtitle: 'Escaneie seu bilhete da Mega-Sena e confira os resultados',
  home_scan: '📷  Escanear Bilhete',
  home_history: '📋  Ver Histórico',

  // Camera
  camera_permission: 'LottoLens precisa de acesso à câmera para escanear bilhetes.',
  camera_grant: 'Permitir Acesso',
  camera_preview: 'Visualização',
  camera_retake: 'Tirar Outra',
  camera_confirm: 'Confirmar Imagem',
  camera_hint: 'Posicione o bilhete dentro da moldura',
  camera_error: 'Falha ao capturar imagem. Tente novamente.',

  // Review
  review_title: 'Revisar Bilhete',
  review_subtitle_one: '{count} jogo detectado — verifique e corrija',
  review_subtitle_other: '{count} jogos detectados — verifique e corrija',
  review_loading: 'Processando imagem do bilhete...',
  review_loading_hint: 'Extraindo jogos do seu bilhete',
  review_no_games: 'Nenhum jogo detectado. Insira os dados manualmente.',
  review_ocr_failed: 'Falha no OCR. Insira os dados manualmente.',
  review_image_failed: 'Falha ao ler imagem. Insira os dados manualmente.',
  review_contest: 'Concurso',
  review_contest_placeholder: 'ex. 3662',
  review_date: 'Data',
  review_date_placeholder: 'dd/mm/aaaa',
  review_game_title: 'Jogo {letter} — {count} números',
  review_add_game: '+ Adicionar Jogo',
  review_confirm: 'Verificar Resultados',
  review_limit: 'Limite',
  review_limit_msg: 'Um jogo pode ter no máximo 15 números.',
  review_minimum: 'Mínimo',
  review_minimum_msg: 'Um jogo deve ter no mínimo 6 números.',
  review_cannot_remove: 'Não é possível remover',
  review_cannot_remove_msg: 'Você precisa de pelo menos um jogo.',
  review_remove_game: 'Remover Jogo',
  review_remove_game_msg: 'Remover Jogo {letter}?',
  review_missing_contest: 'Concurso Ausente',
  review_missing_contest_msg: 'Insira o número do concurso.',
  review_game_invalid: 'Jogo {letter} Inválido',
  review_check_numbers: 'Verifique os números.',

  // Result
  result_loading: 'Buscando resultados...',
  result_try_again: 'Tentar Novamente',
  result_back_home: 'Voltar ao Início',
  result_best_match_one: 'Melhor Acerto ({count} jogo)',
  result_best_match_other: 'Melhor Acerto ({count} jogos)',
  result_contest_info: 'Concurso {contest}',
  result_drawn: 'Números Sorteados',
  result_your_games: 'Seus Jogos',
  result_game_title: 'Jogo {letter}',
  result_match_one: '{count} acerto',
  result_match_other: '{count} acertos',
  result_legend_match: 'Acerto',
  result_legend_your: 'Seu número',
  result_legend_drawn: 'Sorteado',
  result_scan_again: 'Escanear Outro Bilhete',

  // History
  history_ticket_one: '{count} Bilhete',
  history_ticket_other: '{count} Bilhetes',
  history_clear_all: 'Limpar Tudo',
  history_clear_title: 'Limpar Histórico',
  history_clear_msg: 'Tem certeza que deseja apagar todo o histórico?',
  history_clear_cancel: 'Cancelar',
  history_clear_confirm: 'Limpar',
  history_contest: 'Concurso {contest}',
  history_best: 'Melhor: {count}',
  history_game_one: '{count} jogo',
  history_game_other: '{count} jogos',
  history_empty: 'Nenhum escaneamento',
  history_empty_hint: 'Escaneie um bilhete de loteria para vê-lo aqui',

  // Navigation headers
  nav_scan_ticket: 'Escanear Bilhete',
  nav_review: 'Revisar Jogos',
  nav_results: 'Resultados',
  nav_history: 'Histórico',

  // Validation (checker)
  validation_min_numbers: 'Cada jogo deve ter no mínimo 6 números.',
  validation_max_numbers: 'Um jogo pode ter no máximo 15 números.',
  validation_range: 'Cada número deve ser entre 1 e 60. Inválido: {n}',
  validation_duplicates: 'Os números não podem ter duplicatas.',

  // API errors
  api_not_found: 'Concurso {contest} não encontrado. Pode ainda não ter sido sorteado.',
  api_error: 'Erro na API: {status} {statusText}',
  api_timeout: 'Tempo esgotado. Verifique sua conexão.',

  // Language
  language: 'Idioma',
};

export default pt;
