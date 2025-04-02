export function up(knex) {
    return knex.schema.alterTable("users", (table) => {
      table.smallint("is_subscribed").defaultTo(2).notNullable();
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable("users", (table) => {
      table.dropColumn("is_subscribed");
    });
  }
  