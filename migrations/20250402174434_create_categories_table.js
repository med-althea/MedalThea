export function up(knex) {
    return knex.schema.createTable("categories", (table) => {
      table.increments("category_id").primary();
      table.string("name", 255).notNullable().unique();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("categories");
  }
  