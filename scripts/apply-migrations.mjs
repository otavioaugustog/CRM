#!/usr/bin/env node
/**
 * Aplica todas as migrations via Supabase Management API.
 *
 * Pré-requisito: SUPABASE_ACCESS_TOKEN no ambiente.
 *   → Obter em: https://supabase.com/dashboard → Account → Access Tokens
 *
 * Uso:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migrations.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'hbvlqbgxzkyxoutckurc'
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations')
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

const token = process.env.SUPABASE_ACCESS_TOKEN
if (!token) {
  console.error('❌  SUPABASE_ACCESS_TOKEN não definido.')
  console.error('   Obtenha em: https://supabase.com/dashboard → Account → Access Tokens')
  console.error('   Uso: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migrations.mjs')
  process.exit(1)
}

async function runQuery(sql) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }

  return res.json()
}

async function main() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  console.log(`\n🚀  Aplicando ${files.length} migration(s) no projeto ${PROJECT_REF}...\n`)

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    process.stdout.write(`   ${file} ... `)
    try {
      await runQuery(sql)
      console.log('✅')
    } catch (err) {
      console.log('❌')
      console.error(`\n   Erro em ${file}:\n   ${err.message}\n`)
      process.exit(1)
    }
  }

  console.log('\n✅  Todas as migrations aplicadas com sucesso!\n')
}

main()
