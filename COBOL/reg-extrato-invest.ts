/**
 * ============================================================
 * REG-EXTRATO-INVEST — TypeScript Interface
 * Source: COBOL Copybook (Mainframe Modernization)
 * Generated: 2026-04-29
 * ============================================================
 *
 * Original COBOL Layout:
 *   01  REG-EXTRATO-INVEST.
 *       05  EXT-CABECALHO.
 *       05  EXT-RESUMO-TOTAL.
 *       05  EXT-CARTEIRA             OCCURS 5 TIMES.
 *           10  EXT-MOVIMENTACOES    OCCURS 10 TIMES.  ← Bidimensional
 *       05  EXT-STATUS-PROCESSAMENTO PIC 9(02).
 *
 * Complexity Highlights:
 *   • Nested OCCURS (5 × 10) — bidimensional table
 *   • PIC Z.ZZZ.ZZ9,99 — edited display field (string)
 *   • COMP-3 (packed decimal) vs COMP (native binary)
 * ============================================================
 */

// ─── Level 88 Enums ────────────────────────────────────────

/**
 * EXT-TIPO-INVEST — Level 88 values
 * COBOL: 88 EXT-RENDA-FIXA VALUE 01 / 88 EXT-ACOES VALUE 02 / 88 EXT-FII VALUE 03
 */
export type ExtTipoInvest = 1 | 2 | 3;

/**
 * EXT-TIPO-MOV — Level 88 values
 * COBOL: 88 EXT-APLICACAO VALUE 'A' / 88 EXT-RESGATE VALUE 'R'
 */
export type ExtTipoMov = 'A' | 'R';

/**
 * EXT-STATUS-PROCESSAMENTO — Level 88 values
 * COBOL: 88 EXT-SUCESSO VALUE 00 / 88 EXT-ERRO-SALDO VALUE 01 / 88 EXT-CONTA-BLOQU VALUE 02
 */
export type ExtStatusProcessamento = 0 | 1 | 2;

// ─── Level 15: EXT-MOVIMENTACOES (Inner OCCURS) ────────────

/**
 * Single movement/transaction entry.
 * COBOL: 10 EXT-MOVIMENTACOES OCCURS 10 TIMES.
 *
 * This is the INNER dimension of the bidimensional table:
 *   EXT-CARTEIRA(i).EXT-MOVIMENTACOES(j)
 *
 * Total cells: 5 portfolios × 10 movements = 50 entries max.
 */
export interface IExtMovimentacao {
  /**
   * PIC 9(08) — Movement date in YYYYMMDD format (integer).
   * Example: 20260415 = April 15, 2026
   */
  extDataMov: number;

  /**
   * PIC X(01) — Movement type
   *   'A' = Aplicação (deposit/buy)
   *   'R' = Resgate (withdrawal/sell)
   */
  extTipoMov: ExtTipoMov;

  /**
   * PIC S9(09)V99 COMP — Movement value.
   *
   * ⚠️  COMP (binary) storage — differs from COMP-3 (packed BCD).
   *   • COMP uses native binary representation (typically 4 or 8 bytes).
   *   • COMP-3 uses packed decimal (BCD, 1 nibble per digit).
   *   Both are mapped to `number` in the modern layer since the
   *   storage format is a mainframe transport concern.
   *
   * Signed with 2 implicit decimal places.
   * Range: -999999999.99 to +999999999.99
   */
  extValorMov: number;
}

// ─── Level 10: EXT-CARTEIRA (Outer OCCURS) ─────────────────

/**
 * Single portfolio/investment product entry.
 * COBOL: 05 EXT-CARTEIRA OCCURS 5 TIMES.
 *
 * This is the OUTER dimension of the bidimensional table.
 * Each portfolio entry contains up to 10 movement records,
 * forming a 5×10 matrix: CARTEIRA(i).MOVIMENTACOES(j).
 */
export interface IExtCarteira {
  /**
   * PIC 9(02) — Investment type code
   *   01 = Renda Fixa (fixed income)
   *   02 = Ações (stocks)
   *   03 = FII (real estate funds)
   */
  extTipoInvest: ExtTipoInvest;

  /** PIC X(20) — Product/fund name */
  extNomeProduto: string;

  /**
   * PIC S9(11)V99 COMP-3 — Current market value.
   * Packed decimal, signed, 2 implicit decimal places.
   * Range: -99999999999.99 to +99999999999.99
   */
  extValorAtual: number;

  /**
   * OCCURS 10 TIMES — Movement history for this portfolio.
   * Fixed array of exactly 10 movement slots.
   *
   * ┌─────────────────────────────────────────────────┐
   * │  BIDIMENSIONAL TABLE STRUCTURE                  │
   * │                                                 │
   * │  EXT-CARTEIRA(1).EXT-MOVIMENTACOES(1..10)       │
   * │  EXT-CARTEIRA(2).EXT-MOVIMENTACOES(1..10)       │
   * │  EXT-CARTEIRA(3).EXT-MOVIMENTACOES(1..10)       │
   * │  EXT-CARTEIRA(4).EXT-MOVIMENTACOES(1..10)       │
   * │  EXT-CARTEIRA(5).EXT-MOVIMENTACOES(1..10)       │
   * │                                                 │
   * │  Total: 5 × 10 = 50 movement cells              │
   * └─────────────────────────────────────────────────┘
   */
  extMovimentacoes: IExtMovimentacao[];
}

// ─── Group: EXT-CABECALHO ──────────────────────────────────

/**
 * Statement header with account identification.
 * COBOL: 05 EXT-CABECALHO.
 */
export interface IExtCabecalho {
  /** PIC 9(10) — Source account number, 10-digit integer */
  extContaOrigem: number;

  /** PIC X(50) — Account holder full name */
  extNomeTitular: string;

  /** PIC 9(08) — Statement generation date in YYYYMMDD format */
  extDataGeracao: number;
}

// ─── Group: EXT-RESUMO-TOTAL ───────────────────────────────

/**
 * Portfolio summary totals.
 * COBOL: 05 EXT-RESUMO-TOTAL.
 */
export interface IExtResumoTotal {
  /**
   * PIC S9(13)V99 COMP-3 — Total amount invested.
   * Packed decimal, signed, 2 implicit decimal places.
   * Range: -9999999999999.99 to +9999999999999.99
   */
  extTotalAplicado: number;

  /**
   * PIC S9(11)V99 COMP-3 — Total yield/earnings.
   * Packed decimal, signed, 2 implicit decimal places.
   * Range: -99999999999.99 to +99999999999.99
   */
  extTotalRendimento: number;

  /**
   * PIC Z.ZZZ.ZZ9,99 — Pre-formatted display total.
   *
   * ⚠️  EDITED PICTURE — This is NOT a computational field.
   *
   * In COBOL, edited pictures embed formatting characters directly
   * into the stored data. This field occupies 14 bytes and contains:
   *   • 'Z' = zero-suppressed digit (replaced by space if leading zero)
   *   • '.' = literal dot (thousand separator, Brazilian format)
   *   • '9' = always-displayed digit
   *   • ',' = literal comma (decimal separator, Brazilian format)
   *
   * Examples of raw mainframe content:
   *   "  1.500.042,75"  (positive value)
   *   "          0,00"  (zero with suppressed leading zeros)
   *   "  9.999.999,99"  (near maximum)
   *
   * Mapped as `string` because the field contains pre-formatted
   * display text — it CANNOT be used in COBOL arithmetic (COMPUTE).
   * If numeric operations are needed downstream, parse to number by:
   *   1. Removing dots → "1500042,75"
   *   2. Replacing comma with period → "1500042.75"
   *   3. parseFloat() → 1500042.75
   */
  extTotalEditado: string;
}

// ─── Root Record: REG-EXTRATO-INVEST (Level 01) ────────────

/**
 * Main investment statement record — maps the full 01-level COBOL structure.
 *
 * Bidimensional Table Layout:
 *   EXT-CARTEIRA (dim 1: 5 portfolios)
 *     └─ EXT-MOVIMENTACOES (dim 2: 10 movements each)
 *
 * Total addressable cells: CARTEIRA(1..5) × MOVIMENTACOES(1..10) = 50
 *
 * Estimated record size: ~2,200 bytes (EBCDIC)
 */
export interface IRegExtratoInvest {
  /** 05 EXT-CABECALHO — Statement header identification */
  extCabecalho: IExtCabecalho;

  /** 05 EXT-RESUMO-TOTAL — Aggregated portfolio summary */
  extResumoTotal: IExtResumoTotal;

  /**
   * 05 EXT-CARTEIRA — OCCURS 5 TIMES
   * Array of 5 portfolio entries, each containing up to 10 movements.
   * @minItems 5
   * @maxItems 5
   */
  extCarteira: IExtCarteira[];

  /**
   * 05 EXT-STATUS-PROCESSAMENTO — PIC 9(02)
   * Processing result code:
   *   0 = Sucesso (success)
   *   1 = Erro de Saldo (balance error)
   *   2 = Conta Bloqueada (blocked account)
   */
  extStatusProcessamento: ExtStatusProcessamento;
}
