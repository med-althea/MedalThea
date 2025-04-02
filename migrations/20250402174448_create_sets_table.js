export function up(knex) {
    return knex.schema.createTable("sets", (table) => {
      table.increments("set_id").primary();
      table.string("name", 255).notNullable();
      table.text("image").nullable();
      table
        .integer("topic_id")
        .unsigned()
        .references("topic_id")
        .inTable("topics")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable("sets");
  }
  