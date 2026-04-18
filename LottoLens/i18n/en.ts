/**
 * i18n/en.ts — English translations
 */
const en = {
  // Home
  home_subtitle: 'Scan your Mega-Sena ticket and check results instantly',
  home_scan: '📷  Scan Ticket',
  home_history: '📋  View History',

  // Camera
  camera_permission: 'LottoLens needs camera access to scan tickets.',
  camera_grant: 'Grant Permission',
  camera_preview: 'Preview',
  camera_retake: 'Retake',
  camera_confirm: 'Confirm Image',
  camera_hint: 'Position the ticket inside the frame',
  camera_error: 'Failed to capture image. Please try again.',

  // Review
  review_title: 'Review Ticket',
  review_subtitle_one: '{count} game detected — verify and correct',
  review_subtitle_other: '{count} games detected — verify and correct',
  review_loading: 'Processing ticket image...',
  review_loading_hint: 'Extracting games from your ticket',
  review_no_games: 'No games detected. Please enter the ticket data manually.',
  review_ocr_failed: 'OCR processing failed. Please enter the ticket data manually.',
  review_image_failed: 'Failed to read image. Please enter data manually.',
  review_contest: 'Contest',
  review_contest_placeholder: 'e.g. 3662',
  review_date: 'Date',
  review_date_placeholder: 'dd/mm/yyyy',
  review_game_title: 'Game {letter} — {count} numbers',
  review_add_game: '+ Add Game',
  review_confirm: 'Check Results',
  review_limit: 'Limit',
  review_limit_msg: 'A game can have at most 15 numbers.',
  review_minimum: 'Minimum',
  review_minimum_msg: 'A game must have at least 6 numbers.',
  review_cannot_remove: 'Cannot Remove',
  review_cannot_remove_msg: 'You need at least one game.',
  review_remove_game: 'Remove Game',
  review_remove_game_msg: 'Remove Game {letter}?',
  review_missing_contest: 'Missing Contest',
  review_missing_contest_msg: 'Please enter the contest number.',
  review_game_invalid: 'Game {letter} Invalid',
  review_check_numbers: 'Check the numbers.',

  // Result
  result_loading: 'Fetching results...',
  result_try_again: 'Try Again',
  result_back_home: 'Back to Home',
  result_best_match_one: 'Best Match ({count} game)',
  result_best_match_other: 'Best Match ({count} games)',
  result_contest_info: 'Contest {contest}',
  result_drawn: 'Drawn Numbers',
  result_your_games: 'Your Games',
  result_game_title: 'Game {letter}',
  result_match_one: '{count} match',
  result_match_other: '{count} matches',
  result_legend_match: 'Match',
  result_legend_your: 'Your number',
  result_legend_drawn: 'Drawn',
  result_scan_again: 'Scan Another Ticket',

  // History
  history_ticket_one: '{count} Ticket',
  history_ticket_other: '{count} Tickets',
  history_clear_all: 'Clear All',
  history_clear_title: 'Clear History',
  history_clear_msg: 'Are you sure you want to delete all scan history?',
  history_clear_cancel: 'Cancel',
  history_clear_confirm: 'Clear',
  history_contest: 'Contest {contest}',
  history_best: 'Best: {count}',
  history_game_one: '{count} game',
  history_game_other: '{count} games',
  history_empty: 'No scans yet',
  history_empty_hint: 'Scan a lottery ticket to see it here',

  // Navigation headers
  nav_scan_ticket: 'Scan Ticket',
  nav_review: 'Review Games',
  nav_results: 'Results',
  nav_history: 'Scan History',

  // Validation (checker)
  validation_min_numbers: 'Each game must have at least 6 numbers.',
  validation_max_numbers: 'A game can have at most 15 numbers.',
  validation_range: 'Each number must be between 1 and 60. Invalid: {n}',
  validation_duplicates: 'Numbers must not have duplicates.',

  // API errors
  api_not_found: 'Contest {contest} not found. It may not have been drawn yet.',
  api_error: 'API error: {status} {statusText}',
  api_timeout: 'Request timed out. Please check your connection.',

  // Language
  language: 'Language',
};

export default en;
