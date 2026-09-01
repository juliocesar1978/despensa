export async function up(knex) {
  await knex.schema.createTable('push_subscriptions', (t) => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('endpoint').notNullable().unique();
    t.string('p256dh').notNullable();
    t.string('auth').notNullable();
    t.timestamp('criado_em').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('push_subscriptions');
}
