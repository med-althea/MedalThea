export function up(knex) {
    return knex.schema.createTable("topics", (table) => {
      table.increments("topic_id").primary();
      table.string("name", 255).notNullable();
      table.text("image").nullable();
      table
        .integer("category_id")
        .unsigned()
        .references("category_id")
        .inTable("categories")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("topics");
  }
  