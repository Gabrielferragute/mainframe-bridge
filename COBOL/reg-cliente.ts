/**
 * ============================================================
 * REG-CLIENTE — TypeScript Interface
 * Source: COBOL Copybook (Mainframe Modernization)
 * Generated: 2026-04-29
 * ============================================================
 *
 * Original COBOL Layout:
 *   01  REG-CLIENTE.
 *       05  CLI-DADOS-BASICOS.
 *       05  CLI-SALDO-CONTA       PIC S9(13)V99 COMP-3.
 *       05  CLI-ENDERECO.
 *       05  CLI-CONTATOS           OCCURS 3 TIMES.
 *       05  CLI-RESERVA            PIC X(20).
 *       05  CLI-RESERVA-REDEF      REDEFINES CLI-RESERVA.
 * ============================================================
 */

// ─── Level 88 Enums ────────────────────────────────────────

/** 
 * CLI-TIPO-PESSOA — Level 88 values
 * COBOL: 88 CLI-FISICA VALUE 'F' / 88 CLI-JURIDICA VALUE 'J' 
 */
export type CliTipoPessoa = 'F' | 'J';

/**
 * CLI-TIPO-CONTATO — Level 88 values
 * COBOL: 88 CLI-TEL-FIXO VALUE 1 / 88 CLI-TEL-CEL VALUE 2 / 88 CLI-EMAIL VALUE 3
 */
export type CliTipoContato = 1 | 2 | 3;

// ─── REDEFINES: CLI-RESERVA-REDEF ──────────────────────────

/**
 * Redefined view of CLI-RESERVA (PIC X(20)).
 * Same 20-byte area interpreted as two sub-fields:
 *   10  CLI-COD-PROMO       PIC 9(05)   → integer (5 digits)
 *   10  CLI-STATUS-INTERNO   PIC X(15)   → string  (15 chars)
 */
export interface ICliReservaRedef {
  /** PIC 9(05) — Promotional code, 5-digit integer */
  cliCodPromo: number;
  /** PIC X(15) — Internal status descriptor */
  cliStatusInterno: string;
}

// ─── Group: CLI-CONTATOS (OCCURS 3 TIMES) ──────────────────

/**
 * Contact entry — repeats exactly 3 times in the record.
 * COBOL: 05 CLI-CONTATOS OCCURS 3 TIMES.
 */
export interface ICliContato {
  /** PIC 9(01) — Contact type: 1=Fixo, 2=Cel, 3=Email */
  cliTipoContato: CliTipoContato;
  /** PIC X(50) — Contact description/value */
  cliDescricao: string;
}

// ─── Group: CLI-DADOS-BASICOS ──────────────────────────────

/**
 * Basic client identification data.
 * COBOL: 05 CLI-DADOS-BASICOS.
 */
export interface ICliDadosBasicos {
  /** PIC 9(09) — Unique client identifier, 9-digit integer */
  cliId: number;
  /** PIC X(40) — Client full name */
  cliNome: string;
  /** PIC X(01) — Person type: 'F' = Física, 'J' = Jurídica */
  cliTipoPessoa: CliTipoPessoa;
  /** PIC 9(08) — Birth date in YYYYMMDD format (integer) */
  cliDataNasc: number;
}

// ─── Group: CLI-ENDERECO ───────────────────────────────────

/**
 * Client address block.
 * COBOL: 05 CLI-ENDERECO.
 */
export interface ICliEndereco {
  /** PIC X(30) — Street address */
  cliLogradouro: string;
  /** PIC X(20) — City name */
  cliCidade: string;
  /** PIC X(02) — State code (UF) */
  cliUf: string;
}

// ─── Root Record: REG-CLIENTE (Level 01) ───────────────────

/**
 * Main client record — maps the full 01-level COBOL structure.
 *
 * Total estimated record size: ~280 bytes (EBCDIC)
 */
export interface IRegCliente {
  /** 05 CLI-DADOS-BASICOS — Client identification group */
  cliDadosBasicos: ICliDadosBasicos;

  /**
   * 05 CLI-SALDO-CONTA — PIC S9(13)V99 COMP-3
   * Signed numeric with 2 implicit decimal places.
   * COMP-3 (packed decimal) format on mainframe; represented as
   * a standard floating-point number in the modern layer.
   * Range: -9999999999999.99 to +9999999999999.99
   */
  cliSaldoConta: number;

  /** 05 CLI-ENDERECO — Address group */
  cliEndereco: ICliEndereco;

  /**
   * 05 CLI-CONTATOS — OCCURS 3 TIMES
   * Fixed-length array of exactly 3 contact entries.
   */
  cliContatos: [ICliContato, ICliContato, ICliContato];

  /**
   * 05 CLI-RESERVA / CLI-RESERVA-REDEF (REDEFINES)
   *
   * Union Type: The same 20-byte memory area can be read as:
   *   • string        → raw reserved field (PIC X(20))
   *   • ICliReservaRedef → structured promo code + internal status
   *
   * At runtime, the consumer must determine which interpretation
   * applies based on business context.
   */
  cliReserva: string | ICliReservaRedef;
}
