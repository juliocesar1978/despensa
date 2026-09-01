export async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('nome').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.enu('role', ['admin', 'membro']).notNullable().defaultTo('membro');
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('settings', (t) => {
    t.string('chave').primary();
    t.string('valor');
  });

  await knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('nome').notNullable().unique();
  });

  await knex.schema.createTable('products', (t) => {
    t.increments('id').primary();
    t.string('nome').notNullable();
    t.string('ean').unique();
    t.integer('categoria_id').references('id').inTable('categories').onDelete('SET NULL');
    t.string('imagem_url');
    t.string('unidade').defaultTo('un');
    t.float('stock_minimo').defaultTo(0);
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('stock_items', (t) => {
    t.increments('id').primary();
    t.integer('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.float('quantidade').notNullable();
    t.date('validade');
    t.string('localizacao');
    t.integer('adicionado_por').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('movements', (t) => {
    t.increments('id').primary();
    t.integer('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.enu('tipo', ['entrada', 'consumo', 'desperdicio']).notNullable();
    t.float('quantidade').notNullable();
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('shopping_list', (t) => {
    t.increments('id').primary();
    t.integer('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.float('quantidade_sugerida').defaultTo(1);
    t.enu('estado', ['pendente', 'comprado']).notNullable().defaultTo('pendente');
    t.enu('origem', ['manual', 'auto_stock_baixo']).notNullable().defaultTo('manual');
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('shopping_list');
  await knex.schema.dropTableIfExists('movements');
  await knex.schema.dropTableIfExists('stock_items');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('users');
}
