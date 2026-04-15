import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

/**
 * GET /api/contracts/[contractNo]
 * Fetch contract details with pre-installation materials and steps
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { contractNo: string } }
) {
  try {
    const { contractNo } = params

    if (!contractNo) {
      return NextResponse.json({ success: false, error: 'Contract number required' }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      // Get contract details
      const [contracts]: any = await connection.query(
        `SELECT * FROM contracts WHERE contractNo = ?`,
        [contractNo]
      )

      if (contracts.length === 0) {
        return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 })
      }

      const contract = contracts[0]

      // Get pre-installation materials if pre_inst_id exists
      let materials: any[] = []
      let steps: any[] = []

      if (contract.pre_inst_id) {
        // Fetch materials
        const [materialsResult]: any = await connection.query(
          `SELECT
            material_code,
            material_name,
            quantity,
            unit,
            notes
          FROM pre_installation_materials
          WHERE pre_inst_id = ?
          ORDER BY id`,
          [contract.pre_inst_id]
        )
        materials = materialsResult

        // Fetch steps
        const [stepsResult]: any = await connection.query(
          `SELECT
            step_number,
            step_name,
            description,
            duration_minutes,
            assigned_to
          FROM pre_installation_steps
          WHERE pre_inst_id = ?
          ORDER BY step_number`,
          [contract.pre_inst_id]
        )
        steps = stepsResult
      }

      return NextResponse.json({
        success: true,
        contract,
        materials,
        steps
      })
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Contract API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
