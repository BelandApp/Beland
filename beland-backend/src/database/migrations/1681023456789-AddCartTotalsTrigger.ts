// src/database/migrations
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCartTotalsTrigger1681023456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_cart_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE carts
        SET
          total_amount = COALESCE((
            SELECT SUM(subtotal)
            FROM cart_items
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
          ), 0),
          total_items = COALESCE((
            SELECT SUM(quantity)
            FROM cart_items
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
          ), 0),
          updated_at = NOW()
        WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_update_cart_totals ON cart_items;

      CREATE TRIGGER trg_update_cart_totals
      AFTER INSERT OR UPDATE OR DELETE ON cart_items
      FOR EACH ROW EXECUTE FUNCTION update_cart_totals();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_update_cart_totals ON cart_items;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_cart_totals();`);
  }
}
