import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
let tabelaPronta = false;

async function garantirTabela() {
  if (tabelaPronta) return;
  await sql`
    CREATE TABLE IF NOT EXISTS ranking (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      pontos INTEGER NOT NULL DEFAULT 0,
      planetas INTEGER NOT NULL DEFAULT 0,
      comandante BOOLEAN NOT NULL DEFAULT false,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tabelaPronta = true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await garantirTabela();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, nome, pontos, planetas, comandante
        FROM ranking
        ORDER BY pontos DESC
        LIMIT 20
      `;
      return res.status(200).json({ ok: true, ranking: rows });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, nome, pontos, planetas, comandante } = body;
      if (!id || !nome) {
        return res.status(400).json({ ok: false, error: 'id e nome sao obrigatorios' });
      }
      const nomeSeguro = String(nome).slice(0, 24);
      const pontosSeguro = Math.max(0, Math.min(999999, parseInt(pontos, 10) || 0));
      const planetasSeguro = Math.max(0, Math.min(8, parseInt(planetas, 10) || 0));
      await sql`
        INSERT INTO ranking (id, nome, pontos, planetas, comandante, atualizado_em)
        VALUES (${String(id).slice(0, 64)}, ${nomeSeguro}, ${pontosSeguro}, ${planetasSeguro}, ${!!comandante}, now())
        ON CONFLICT (id) DO UPDATE SET
          nome = EXCLUDED.nome,
          pontos = EXCLUDED.pontos,
          planetas = EXCLUDED.planetas,
          comandante = EXCLUDED.comandante,
          atualizado_em = now()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'metodo nao suportado' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'erro interno' });
  }
}
