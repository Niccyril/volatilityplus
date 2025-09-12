import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, website, promotionMethods } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if application already exists
    const existingApplication = await sql`
      SELECT id FROM affiliate_applications WHERE email = ${email} AND status = 'pending'
    `;

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'You already have a pending affiliate application' });
    }

    // Insert affiliate application
    await sql`
      INSERT INTO affiliate_applications (name, email, website, promotion_methods, status, applied_at)
      VALUES (${name}, ${email}, ${website || ''}, ${promotionMethods || ''}, 'pending', NOW())
    `;

    res.status(201).json({
      message: 'Affiliate application submitted successfully'
    });

  } catch (error) {
    console.error('Affiliate application error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
