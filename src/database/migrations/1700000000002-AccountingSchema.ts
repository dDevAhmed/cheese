import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Accounting schema migration.
 * Creates: accounts, transactions, ledger_entries tables
 * with all constraints, enums, indexes, and triggers.
 */
export class AccountingSchema1700000000002 implements MigrationInterface {
  name = 'AccountingSchema1700000000002';

  async up(qr: QueryRunner): Promise<void> {
    // ── Extensions ────────────────────────────────────────────────────────────
    await qr.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ── Shared trigger function (reuse if auth migration already created it) ──
    await qr.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `);

    // ── Enum types ────────────────────────────────────────────────────────────
    await qr.query(`CREATE TYPE account_currency_enum    AS ENUM ('NGN','USDT')`);
    await qr.query(`CREATE TYPE account_status_enum      AS ENUM ('active','suspended','frozen')`);
    await qr.query(`CREATE TYPE transaction_type_enum    AS ENUM ('payment','reversal','fee','settlement')`);
    await qr.query(`CREATE TYPE transaction_status_enum  AS ENUM ('pending','processing','completed','failed','reversed')`);
    await qr.query(`CREATE TYPE entry_type_enum          AS ENUM ('debit','credit')`);

    // ── accounts ──────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE accounts (
        id             UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID                  NOT NULL UNIQUE,
        naira_balance  NUMERIC(18,2)         NOT NULL DEFAULT 0.00,
        usdt_balance   NUMERIC(18,8)         NOT NULL DEFAULT 0.00000000,
        currency       account_currency_enum NOT NULL DEFAULT 'NGN',
        status         account_status_enum   NOT NULL DEFAULT 'active',
        created_at     TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_naira_balance_non_negative CHECK (naira_balance >= 0),
        CONSTRAINT chk_usdt_balance_non_negative  CHECK (usdt_balance  >= 0)
      )
    `);

    await qr.query(`CREATE UNIQUE INDEX uq_accounts_user_id ON accounts(user_id)`);
    await qr.query(`CREATE INDEX idx_accounts_status ON accounts(status)`);
    await qr.query(`
      CREATE TRIGGER accounts_updated_at
      BEFORE UPDATE ON accounts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `);

    // ── transactions ──────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE transactions (
        id                       UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
        reference                VARCHAR(30)              NOT NULL UNIQUE,
        sender_account_id        UUID                     NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
        receiver_account_id      UUID                     NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
        amount_naira             NUMERIC(18,2)            NOT NULL,
        amount_usdt              NUMERIC(18,8)            NOT NULL,
        exchange_rate            NUMERIC(18,8)            NOT NULL,
        fx_rate_source           VARCHAR(100)             NOT NULL,
        transaction_type         transaction_type_enum    NOT NULL DEFAULT 'payment',
        status                   transaction_status_enum  NOT NULL DEFAULT 'pending',
        recipient_bank_code      VARCHAR(10)              NOT NULL,
        recipient_account_number VARCHAR(20)              NOT NULL,
        recipient_account_name   VARCHAR(200)             NOT NULL,
        metadata                 JSONB,
        failure_reason           TEXT,
        original_transaction_id  UUID,
        initiated_at             TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
        completed_at             TIMESTAMPTZ,
        created_at               TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
        updated_at               TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_amount_naira_positive CHECK (amount_naira > 0),
        CONSTRAINT chk_amount_usdt_positive  CHECK (amount_usdt  > 0),
        CONSTRAINT chk_exchange_rate_positive CHECK (exchange_rate > 0)
      )
    `);

    await qr.query(`CREATE UNIQUE INDEX uq_transactions_reference   ON transactions(reference)`);
    await qr.query(`CREATE INDEX idx_transactions_sender   ON transactions(sender_account_id)`);
    await qr.query(`CREATE INDEX idx_transactions_receiver ON transactions(receiver_account_id)`);
    await qr.query(`CREATE INDEX idx_transactions_status   ON transactions(status)`);
    await qr.query(`CREATE INDEX idx_transactions_created  ON transactions(created_at DESC)`);
    await qr.query(`CREATE INDEX idx_transactions_type     ON transactions(transaction_type)`);
    -- Partial index for fast pending/processing lookups (most operationally relevant)
    await qr.query(`
      CREATE INDEX idx_transactions_active
      ON transactions(created_at DESC)
      WHERE status IN ('pending','processing')
    `);
    await qr.query(`
      CREATE TRIGGER transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `);

    // ── ledger_entries ────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE ledger_entries (
        id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id  UUID                  NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
        account_id      UUID                  NOT NULL REFERENCES accounts(id)     ON DELETE RESTRICT,
        entry_type      entry_type_enum       NOT NULL,
        amount_naira    NUMERIC(18,2)         NOT NULL DEFAULT 0.00,
        amount_usdt     NUMERIC(18,8)         NOT NULL DEFAULT 0.00000000,
        currency        account_currency_enum NOT NULL,
        balance_before  NUMERIC(18,8)         NOT NULL,
        balance_after   NUMERIC(18,8)         NOT NULL,
        description     TEXT                  NOT NULL,
        created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_ledger_amount_non_negative CHECK (amount_naira >= 0 AND amount_usdt >= 0)
      )
    `);

    await qr.query(`CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id)`);
    await qr.query(`CREATE INDEX idx_ledger_account     ON ledger_entries(account_id)`);
    await qr.query(`CREATE INDEX idx_ledger_created     ON ledger_entries(created_at DESC)`);
    await qr.query(`CREATE INDEX idx_ledger_entry_type  ON ledger_entries(entry_type)`);
    -- Composite for the getLedgerByAccount query pattern
    await qr.query(`
      CREATE INDEX idx_ledger_account_created
      ON ledger_entries(account_id, created_at DESC)
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS ledger_entries CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS transactions   CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS accounts       CASCADE`);
    await qr.query(`DROP TYPE IF EXISTS entry_type_enum`);
    await qr.query(`DROP TYPE IF EXISTS transaction_status_enum`);
    await qr.query(`DROP TYPE IF EXISTS transaction_type_enum`);
    await qr.query(`DROP TYPE IF EXISTS account_status_enum`);
    await qr.query(`DROP TYPE IF EXISTS account_currency_enum`);
  }
}
