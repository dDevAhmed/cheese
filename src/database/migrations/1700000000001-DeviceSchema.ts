import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Device registration + signature nonce schema.
 * Runs after AuthSchema migration (001).
 */
export class DeviceSchema1700000000001 implements MigrationInterface {
  name = 'DeviceSchema1700000000001';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`CREATE TYPE device_platform_enum  AS ENUM ('ios','android','web')`);
    await qr.query(`CREATE TYPE key_algorithm_enum    AS ENUM ('ed25519','secp256k1')`);
    await qr.query(`CREATE TYPE device_status_enum    AS ENUM ('active','revoked')`);

    // ── devices ───────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE devices (
        id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id             VARCHAR(255) NOT NULL UNIQUE,
        device_name           VARCHAR(255) NOT NULL,
        platform              device_platform_enum NOT NULL,
        os_version            VARCHAR(100),
        app_version           VARCHAR(50),
        device_model          VARCHAR(255),
        public_key            TEXT         NOT NULL,
        key_algorithm         key_algorithm_enum   NOT NULL DEFAULT 'ed25519',
        key_version           SMALLINT     NOT NULL DEFAULT 1,
        public_key_fingerprint CHAR(64)    NOT NULL,
        whitelisted           BOOLEAN      NOT NULL DEFAULT TRUE,
        status                device_status_enum   NOT NULL DEFAULT 'active',
        revoked_at            TIMESTAMPTZ,
        revocation_reason     VARCHAR(200),
        revoked_by            VARCHAR(100),
        registration_ip       INET,
        signature_count       BIGINT       NOT NULL DEFAULT 0,
        last_used_at          TIMESTAMPTZ,
        created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`CREATE INDEX idx_devices_user_id          ON devices(user_id)`);
    await qr.query(`CREATE INDEX idx_devices_user_whitelisted  ON devices(user_id, whitelisted) WHERE status = 'active'`);
    await qr.query(`CREATE INDEX idx_devices_fingerprint       ON devices(public_key_fingerprint)`);

    await qr.query(`
      CREATE TRIGGER devices_updated_at
      BEFORE UPDATE ON devices
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `);

    // ── signature_nonces ──────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE signature_nonces (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        nonce      UUID        NOT NULL UNIQUE,
        device_id  UUID        NOT NULL,
        user_id    UUID        NOT NULL,
        action     VARCHAR(100) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`CREATE INDEX idx_nonces_expires   ON signature_nonces(expires_at)`);
    await qr.query(`CREATE INDEX idx_nonces_device_id ON signature_nonces(device_id)`);

    // Automatic cleanup of expired nonces via pg rule (belt-and-suspenders with scheduler)
    // Alternatively configure pg_partman for time-based partitioning on signature_nonces
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS signature_nonces CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS devices          CASCADE`);
    await qr.query(`DROP TYPE IF EXISTS device_status_enum`);
    await qr.query(`DROP TYPE IF EXISTS key_algorithm_enum`);
    await qr.query(`DROP TYPE IF EXISTS device_platform_enum`);
  }
}
