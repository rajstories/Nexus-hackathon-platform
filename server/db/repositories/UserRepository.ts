import { query } from '../sql';
import { User } from '../../types/database';

export class UserRepository {
  static async findAll(): Promise<User[]> {
    const result = await query<User>('SELECT * FROM users ORDER BY created_at DESC');
    return result.recordset;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = @id',
      { id }
    );
    return result.recordset[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE email = @email',
      { email }
    );
    return result.recordset[0] || null;
  }

  static async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE firebase_uid = @firebaseUid',
      { firebaseUid }
    );
    return result.recordset[0] || null;
  }

  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (firebase_uid, email, name, role)
       OUTPUT INSERTED.*
       VALUES (@firebase_uid, @email, @name, @role)`,
      userData
    );
    return result.recordset[0];
  }

  static async update(id: string, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const setClause = Object.keys(userData)
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    if (!setClause) return null;

    const result = await query<User>(
      `UPDATE users 
       SET ${setClause}, updated_at = GETUTCDATE()
       OUTPUT INSERTED.*
       WHERE id = @id`,
      { id, ...userData }
    );
    return result.recordset[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = @id',
      { id }
    );
    return result.rowsAffected[0] > 0;
  }

  static async countByRole(role: string): Promise<number> {
    const result = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE role = @role',
      { role }
    );
    return result.recordset[0].count;
  }
}