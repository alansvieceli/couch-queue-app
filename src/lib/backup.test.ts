import type { AppState } from './appState';
import {
  backupFileName,
  createBackupText,
  parseBackupText,
  type Sha256,
} from './backup';
import { makeState, makeTitle } from './stateFixtures';

// Deterministic stand-in for SHA-256; the real hash comes from expo-crypto in the app.
const sha256: Sha256 = async (text) => {
  let hash = 7;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `h${text.length}-${hash}`;
};

const exportedAt = new Date('2026-10-01T12:00:00.000Z');
const sample = () =>
  makeState({
    titles: [makeTitle({ id: 'a' }), makeTitle({ id: 'b', watchedAt: '2026-10-01' })],
  });
const sampleBackup = () => createBackupText(sample(), exportedAt, sha256);
type Envelope = {
  formatVersion: number;
  data: AppState;
  integrity?: { algorithm: string };
};
const tampered = 'Backup inválido: o conteúdo foi alterado ou está corrompido.';
const invalid = 'Arquivo inválido ou corrompido.';

test('round trip', async () => {
  expect(await parseBackupText(await sampleBackup(), sha256)).toEqual({
    ok: true,
    state: sample(),
  });
});

test('writes the documented envelope', async () => {
  const envelope = JSON.parse(await sampleBackup());
  expect(envelope).toMatchObject({
    format: 'couch-queue-backup',
    formatVersion: 1,
    exportedAt: '2026-10-01T12:00:00.000Z',
    app: { name: 'Couch Queue', storageVersion: 1 },
    integrity: { algorithm: 'SHA-256' },
  });
  expect(typeof envelope.integrity.canonicalPayloadHash).toBe('string');
});

test('backupFileName', () => {
  expect(backupFileName(new Date(2026, 9, 4))).toBe(
    'couch-queue-backup-2026-10-04.cqb',
  );
});

describe('errors', () => {
  const edit = async (change: (envelope: Envelope) => void) => {
    const envelope = JSON.parse(await sampleBackup());
    change(envelope);
    return parseBackupText(JSON.stringify(envelope), sha256);
  };

  test('invalid JSON or non-object', async () => {
    expect(await parseBackupText('{oops', sha256)).toEqual({
      ok: false,
      error: invalid,
    });
    expect(await parseBackupText('[1]', sha256)).toEqual({ ok: false, error: invalid });
  });

  test('wrong format', async () => {
    expect(await parseBackupText('{"format":"other"}', sha256)).toEqual({
      ok: false,
      error: 'Este arquivo não é um backup do Couch Queue.',
    });
  });

  test('version 2', async () => {
    expect(
      await edit((e) => {
        e.formatVersion = 2;
      }),
    ).toEqual({
      ok: false,
      error: 'Versão de backup não suportada.',
    });
  });

  test('hash mismatch, missing integrity and unsupported algorithm', async () => {
    const expected = { ok: false, error: tampered };
    expect(
      await edit((e) => {
        e.data.titles[0].name = 'Outro';
      }),
    ).toEqual(expected);
    expect(
      await edit((e) => {
        e.integrity = undefined;
      }),
    ).toEqual(expected);
    expect(
      await edit((e) => {
        e.integrity = { algorithm: 'MD5' };
      }),
    ).toEqual(expected);
  });

  test('rejects titles with unknown service', async () => {
    const state = makeState({ titles: [makeTitle({ serviceId: 'service-zzz' })] });
    const text = await createBackupText(state, exportedAt, sha256);
    expect(await parseBackupText(text, sha256)).toEqual({
      ok: false,
      error:
        'Backup inválido: há títulos ligados a grupos ou streamings que não existem.',
    });
  });

  test('rejects titles with unknown group', async () => {
    const state = makeState({ titles: [makeTitle({ groupId: 'group-zzz' })] });
    const text = await createBackupText(state, exportedAt, sha256);
    expect(await parseBackupText(text, sha256)).toEqual({
      ok: false,
      error:
        'Backup inválido: há títulos ligados a grupos ou streamings que não existem.',
    });
  });

  test('zero groups', async () => {
    const text = await createBackupText(makeState({ groups: [] }), exportedAt, sha256);
    expect(await parseBackupText(text, sha256)).toEqual({ ok: false, error: invalid });
  });
});
