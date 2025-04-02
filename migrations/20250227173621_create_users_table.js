export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').unique().notNullable();
      table.string('full_name').notNullable();
      table.string('email').unique().notNullable();
      table.string('mobile').notNullable();
      table.string('password').notNullable();
      table.timestamps(true, true);
      table.smallint('status').defaultTo(1).comment("1 active, 2 inactive, 3 deleted").notNullable();
    })
    .then(() =>
      knex.raw(`
        CREATE OR REPLACE FUNCTION trigger_set_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
      `)
    );
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
