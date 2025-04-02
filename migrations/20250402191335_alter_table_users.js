export function up(knex) {
    return knex.schema.alterTable("users", (table) => {
      table.smallint("role_id").defaultTo(2).notNullable();
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable("users", (table) => {
      table.dropColumn("role_id");
    });
  }
  