/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { join } from 'path'

import { ApplicationContract } from '@ioc:Kubit/Application'
import { test } from '@japa/runner'

import { Connection } from '../../src/Connection'
import { QueryClient } from '../../src/QueryClient'
import { cleanup, fs, getConfig, setup, setupApplication } from '../../test-helpers'

let app: ApplicationContract

test.group('Query client | drop tables', (group) => {
  group.setup(async () => {
    app = await setupApplication()
    await setup()
  })

  group.teardown(async () => {
    await cleanup(['temp_posts', 'temp_users', 'table_that_should_not_be_dropped', 'ignore_me'])
    await cleanup()
    await fs.cleanup()
  })

  test('drop all tables', async ({ assert }) => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'temp'))
    const connection = new Connection('primary', getConfig(), app.logger)
    connection.connect()

    await connection.client!.schema.createTableIfNotExists('temp_users', (table) => {
      table.increments('id')
    })

    await connection.client!.schema.createTableIfNotExists('temp_posts', (table) => {
      table.increments('id')
      table.integer('temp_users_id').unsigned().references('id').inTable('temp_users')
    })

    const client = new QueryClient('dual', connection, app.container.use('Kubit/Event'))
    await client.dialect.dropAllTables(['public'])

    assert.isFalse(await connection.client!.schema.hasTable('temp_users'))
    assert.isFalse(await connection.client!.schema.hasTable('temp_posts'))
    assert.isFalse(await connection.client!.schema.hasTable('users'))
    assert.isFalse(await connection.client!.schema.hasTable('uuid_users'))
    assert.isFalse(await connection.client!.schema.hasTable('follows'))
    assert.isFalse(await connection.client!.schema.hasTable('friends'))
    assert.isFalse(await connection.client!.schema.hasTable('countries'))
    assert.isFalse(await connection.client!.schema.hasTable('skills'))
    assert.isFalse(await connection.client!.schema.hasTable('skill_user'))
    assert.isFalse(await connection.client!.schema.hasTable('posts'))
    assert.isFalse(await connection.client!.schema.hasTable('comments'))
    assert.isFalse(await connection.client!.schema.hasTable('profiles'))
    assert.isFalse(await connection.client!.schema.hasTable('identities'))

    await connection.disconnect()
  })

  test('drop all tables should not throw when there are no tables', async ({ assert }) => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'temp'))
    const connection = new Connection('primary', getConfig(), app.logger)
    connection.connect()

    const client = new QueryClient('dual', connection, app.container.use('Kubit/Event'))

    try {
      await client.dropAllTables()
      await client.dropAllTables()
    } catch (err) {
      assert.fail(err)
    }

    await connection.disconnect()
  })

  test('drop all tables except those defined in ignoreTables', async ({ assert }) => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'temp'))
    const config = getConfig()
    config.wipe = {}
    config.wipe.ignoreTables = ['table_that_should_not_be_dropped', 'ignore_me']

    const connection = new Connection('primary', config, app.logger)
    connection.connect()

    await connection.client!.schema.createTableIfNotExists('temp_users', (table) => {
      table.increments('id')
    })

    await connection.client!.schema.createTableIfNotExists('temp_posts', (table) => {
      table.increments('id')
    })

    await connection.client!.schema.createTableIfNotExists(
      'table_that_should_not_be_dropped',
      (table) => table.increments('id')
    )

    await connection.client!.schema.createTableIfNotExists('ignore_me', (table) =>
      table.increments('id')
    )

    const client = new QueryClient('dual', connection, app.container.use('Kubit/Event'))
    await client.dialect.dropAllTables(['public'])

    assert.isFalse(await connection.client!.schema.hasTable('temp_users'))
    assert.isFalse(await connection.client!.schema.hasTable('temp_posts'))
    assert.isTrue(await connection.client!.schema.hasTable('table_that_should_not_be_dropped'))
    assert.isTrue(await connection.client!.schema.hasTable('ignore_me'))

    await connection.disconnect()
  })
})
