/**
 * Convert PostgreSQL parameterized query ($1, $2, etc.) to MySQL (?) syntax
 * Usage: convertPostgresToMysql("SELECT * FROM users WHERE id = $1 AND name = $2", [1, "John"])
 * Returns: { sql: "SELECT * FROM users WHERE id = ? AND name = ?", values: [1, "John"] }
 */
export function convertPostgresToMysql(
  postgresQuery: string,
  values?: any[]
): { sql: string; values: any[] } {
  let sql = postgresQuery

  // Replace $1, $2, $3, etc. with ?
  sql = sql.replace(/\$\d+/g, '?')

  return {
    sql,
    values: values || [],
  }
}

/**
 * Helper to execute query with automatic conversion
 */
export async function smartQuery(
  postgresQuery: string,
  values?: any[]
): Promise<any[]> {
  const { query } = await import('@/lib/mysql')
  const { sql, values: convertedValues } = convertPostgresToMysql(postgresQuery, values)
  return query(sql, convertedValues)
}
