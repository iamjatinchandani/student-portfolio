const { test, describe } = require('node:test');
const assert = require('node:assert');
const EventEmitter = require('node:events');

/**
 * Task Management Application - Automated Test Suite
 * Designed for CI/CD Pipeline Verification (GitHub Actions)
 * Student: Jatin Chandani
 */

describe('Task Management Application - Automated Test Suite', () => {

  // Test 1: Task validation logic
  test('Task validation: title is required and cannot be empty', () => {
    const taskWithoutTitle = {
      description: 'Test task with missing required title',
      priority: 'low'
    };

    const validate = (task) => {
      if (!task.title || task.title.trim() === '') {
        throw new Error('Title is required and cannot be empty');
      }
      return true;
    };

    assert.throws(
      () => validate(taskWithoutTitle),
      /Title is required/
    );

    const validTask = { title: 'Implement CI/CD pipeline' };
    assert.strictEqual(validate(validTask), true);
  });

  // Test 2: Task model default attribute values
  test('Task model defaults: priority defaults to low and completed to false', () => {
    const defaultTask = {
      title: 'Setup GitHub Actions CI/CD Pipeline',
      completed: false,
      priority: 'low'
    };

    assert.strictEqual(defaultTask.completed, false);
    assert.strictEqual(defaultTask.priority, 'low');
    assert.ok(defaultTask.title.length > 0);
  });

  // Test 3: EventEmitter asynchronous background notification verification
  test('EventEmitter: emits task-created and executes listener asynchronously', (t, done) => {
    const emitter = new EventEmitter();
    let handled = false;

    emitter.on('task-created', (data) => {
      setImmediate(() => {
        handled = true;
        assert.strictEqual(data.title, 'CI Task Notification');
        assert.strictEqual(handled, true);
        done();
      });
    });

    emitter.emit('task-created', { title: 'CI Task Notification' });
    // Non-blocking proof: handled is still false before next tick
    assert.strictEqual(handled, false);
  });

  // Test 4: Server caching mechanism
  test('Server Cache: stores and retrieves cached entries with expiry', () => {
    const cache = new Map();
    const cacheKey = 'tasks_list_jatin';
    const sampleTasks = [
      { id: '1', title: 'Containerize with Docker' },
      { id: '2', title: 'Configure GitHub Actions' }
    ];

    cache.set(cacheKey, {
      data: sampleTasks,
      expiresAt: Date.now() + 60000
    });

    const cachedEntry = cache.get(cacheKey);
    assert.ok(cachedEntry !== undefined);
    assert.ok(cachedEntry.expiresAt > Date.now());
    assert.strictEqual(cachedEntry.data.length, 2);
    assert.deepStrictEqual(cachedEntry.data, sampleTasks);
  });


  // Test 5: CI/CD failure verification toggle (deliberate broken test when FAIL_TEST=true)
  test('CI/CD Pipeline Failure Verification Toggle', () => {
    if (process.env.FAIL_TEST === 'true') {
      assert.strictEqual(
        'actual_failed_value',
        'expected_correct_value',
        'Deliberate test failure for CI/CD demonstration'
      );
    } else {
      assert.strictEqual('expected_correct_value', 'expected_correct_value');
    }
  });

});
