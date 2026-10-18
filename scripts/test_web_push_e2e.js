// ============================================================================
// FILE: scripts/test_web_push_e2e.js
// PURPOSE: Automated End-to-End (E2E) Test Suite for FocusFlow & CleverTap Web Push:
// - Document Root Service Worker (clevertap_sw.js)
// - Web App Manifest & iOS Safari PWA metadata (manifest.json)
// - PNG App Icons (/icon-192x192.png, /icon-512x512.png)
// - Backend VAPID Key Retrieval (GET /api/push/vapid)
// - Backend VAPID Key Generation (POST /api/push/vapid/generate)
// - Backend Web Push Status (GET /api/push/status)
// - Backend Push Notification Simulator (POST /api/push/simulate)
// - SDK Version Compatibility (v1.1.0+ and v2.7.1+ checks)
// - clevertap.notifications.push() Soft Prompt invocation
// - 1-Week Permission Frequency Rule & Cooldown enforcement
// - Token Migration Simulator (Cases 1, 2, 3)
// - Browser Capability & Feature Support Matrix
// ============================================================================

const assert = require('assert');
const http = require('http');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✕ ${description}`);
    console.error(`    Error: ${error.message}`);
    process.exitCode = 1;
  }
}

async function asyncIt(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✕ ${description}`);
    console.error(`    Error: ${error.message}`);
    process.exitCode = 1;
  }
}

function fetchHttp(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Mock browser globals for SDK service testing
const mockStorage = new Map();
global.window = {
  location: { protocol: 'http:', hostname: 'localhost' },
  navigator: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    serviceWorker: {
      getRegistration: async () => ({ scope: '/', active: { state: 'activated' } })
    }
  },
  localStorage: {
    getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k)
  },
  Notification: {
    permission: 'default',
    requestPermission: async () => 'granted'
  },
  clevertap: {
    notifications: [],
    getSDKVersion: () => 'web-sdk-v3.0.3'
  }
};
global.document = {
  documentElement: {
    addEventListener: () => {},
    removeEventListener: () => {}
  }
};

const {
  getCleverTapSdkVersion,
  getBrowserWebPushSupport,
  getNotificationPermissionStatus,
  requestNativeBrowserPermission,
  getPushRejectionCooldown,
  recordPushRejection,
  clearPushRejectionCooldown,
  requestCleverTapPushPermission,
  evaluateTokenMigration
} = require('../frontend/src/services/clevertapSdkService');

console.log('================================================================');
console.log('FocusFlow & CleverTap Web Push & VAPID E2E Test Suite');
console.log('================================================================\n');

async function runTestSuite() {
  // --------------------------------------------------------------------------
  // TEST SUITE 1: Service Worker & Public Assets Verification
  // --------------------------------------------------------------------------
  console.log('Test Suite 1: Document Root Service Worker & Manifest Assets');

  await asyncIt('1.1 GET /clevertap_sw.js returns 200 OK and imports CleverTap service worker', async () => {
    const res = await fetchHttp('http://localhost:3000/clevertap_sw.js');
    assert.strictEqual(res.status, 200);
    assert(
      res.data.includes("importScripts('https://s3-eu-west-1.amazonaws.com/static.wizrocket.com/js/sw_webpush.js')"),
      'Missing required CleverTap service worker import script'
    );
  });

  await asyncIt('1.2 GET /manifest.json returns 200 OK and valid PWA metadata', async () => {
    const res = await fetchHttp('http://localhost:3000/manifest.json');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.short_name, 'FocusFlow');
    assert.strictEqual(res.json.display, 'standalone');
    assert.strictEqual(res.json.theme_color, '#4f46e5');
    assert(Array.isArray(res.json.icons) && res.json.icons.length >= 2);
  });

  await asyncIt('1.3 GET /icon-192x192.png and /icon-512x512.png return 200 OK image/png', async () => {
    const [res192, res512] = await Promise.all([
      fetchHttp('http://localhost:3000/icon-192x192.png'),
      fetchHttp('http://localhost:3000/icon-512x512.png')
    ]);
    assert.strictEqual(res192.status, 200);
    assert.strictEqual(res192.headers['content-type'], 'image/png');
    assert.strictEqual(res512.status, 200);
    assert.strictEqual(res512.headers['content-type'], 'image/png');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Backend VAPID API Endpoints
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 2: Backend VAPID Keys & Push Configuration API');

  let generatedPublicKey = null;

  await asyncIt('2.1 GET /api/push/vapid returns valid P-256 VAPID public key and instructions', async () => {
    const res = await fetchHttp('http://localhost:4000/api/push/vapid');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.status, 'ok');
    assert.strictEqual(res.json.protocol, 'VAPID');
    assert(typeof res.json.keys.publicKey === 'string');
    // VAPID P-256 public key is 87 characters base64url encoded
    assert.strictEqual(res.json.keys.publicKey.length, 87);
    assert(res.json.keys.privateKeyMasked.includes('...'));
    assert(Array.isArray(res.json.clevertapInstructions.browsers));
  });

  await asyncIt('2.2 POST /api/push/vapid/generate generates a fresh VAPID key pair', async () => {
    const res = await fetchHttp('http://localhost:4000/api/push/vapid/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.status, 'ok');
    assert.strictEqual(res.json.keys.publicKey.length, 87);
    assert.strictEqual(res.json.keys.privateKey.length, 43);
    generatedPublicKey = res.json.keys.publicKey;
  });

  await asyncIt('2.3 GET /api/push/status confirms VAPID configured and CleverTap region eu1', async () => {
    const res = await fetchHttp('http://localhost:4000/api/push/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.vapidConfigured, true);
    assert.strictEqual(res.json.clevertapRegion, 'eu1');
    assert.strictEqual(res.json.serviceWorker.fileName, 'clevertap_sw.js');
    assert.strictEqual(res.json.manifest.fileName, 'manifest.json');
    assert.strictEqual(res.json.supportedFeatures.chrome.cta, 'v53+');
  });

  await asyncIt('2.4 POST /api/push/simulate constructs structured push payload with actions', async () => {
    const res = await fetchHttp('http://localhost:4000/api/push/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Deep Work Reminder',
        body: 'Time to begin your 25-minute Pomodoro session!',
        ctaButtons: [
          { action: 'start_timer', title: 'Start Focus' },
          { action: 'postpone', title: 'Later' }
        ]
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.pushPayload.notification.title, 'Deep Work Reminder');
    assert.strictEqual(res.json.pushPayload.notification.actions.length, 2);
    assert.strictEqual(res.json.pushPayload.notification.data.region, 'eu1');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 3: CleverTap SDK Version Compatibility
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 3: CleverTap Web SDK Version & Protocol Requirements');

  it('3.1 SDK Version meets VAPID requirement (>= 1.1.0)', () => {
    const ver = getCleverTapSdkVersion();
    assert.strictEqual(ver.meetsVapidRequirement, true);
    assert(ver.major >= 3);
  });

  it('3.2 SDK Version meets Custom VAPID + Soft Prompt requirement (>= 2.7.1)', () => {
    const ver = getCleverTapSdkVersion();
    assert.strictEqual(ver.meetsCustomVapidSoftPrompt, true);
    assert.strictEqual(ver.version, '3.0.3');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Soft Prompt & 1-Week Permission Frequency Rule
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 4: Soft Prompt & 1-Week Permission Frequency Rule');

  it('4.1 requestCleverTapPushPermission builds canonical payload and pushes to clevertap.notifications', () => {
    clearPushRejectionCooldown();
    global.window.clevertap.notifications = [];

    const result = requestCleverTapPushPermission({
      titleText: 'Get Daily Focus Alerts',
      bodyText: 'We send gentle nudges when your streak is about to reset.',
      okButtonText: 'Allow',
      rejectButtonText: 'Dismiss',
      okButtonColor: '#4f46e5',
      askAgainTimeInSeconds: 10
    });

    assert.strictEqual(result.status, 'PROMPT_REQUESTED');
    assert.strictEqual(global.window.clevertap.notifications.length, 1);
    assert.strictEqual(global.window.clevertap.notifications[0].titleText, 'Get Daily Focus Alerts');
    assert.strictEqual(global.window.clevertap.notifications[0].serviceWorkerPath, '/clevertap_sw.js');
  });

  it('4.2 Rejection activates cooldown and suppresses subsequent prompt calls', () => {
    // Record rejection at current timestamp
    recordPushRejection(Date.now());

    // With 10s custom cooldown, call should be suppressed
    const result = requestCleverTapPushPermission({
      askAgainTimeInSeconds: 10
    });

    assert.strictEqual(result.status, 'SUPPRESSED_COOLDOWN');
    assert.strictEqual(result.cooldown.inCooldown, true);
    assert(result.cooldown.remainingSeconds > 0);
  });

  it('4.3 Cooldown clears upon clearPushRejectionCooldown() allowing prompts again', () => {
    clearPushRejectionCooldown();
    const cooldown = getPushRejectionCooldown();
    assert.strictEqual(cooldown.inCooldown, false);

    const result = requestCleverTapPushPermission();
    assert.strictEqual(result.status, 'PROMPT_REQUESTED');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Token Migration Evaluation (Cases 1, 2, 3)
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 5: Token Migration Handling Across 3 Provider Cases');

  it('5.1 Case 1: Existing registered user is auto-migrated without showing soft prompt', () => {
    const res = evaluateTokenMigration('registered');
    assert.strictEqual(res.showSoftPrompt, false);
    assert.strictEqual(res.tokenMigrated, true);
  });

  it('5.2 Case 2: Existing declined user generates no token and skips soft prompt', () => {
    const res = evaluateTokenMigration('declined');
    assert.strictEqual(res.showSoftPrompt, false);
    assert.strictEqual(res.tokenMigrated, false);
  });

  it('5.3 Case 3: New user displays soft prompt and registers on acceptance', () => {
    const res = evaluateTokenMigration('new_user');
    assert.strictEqual(res.showSoftPrompt, true);
    assert.strictEqual(res.tokenMigrated, false);
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Browser Compatibility & Feature Matrix Detection
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 6: Browser Compatibility Matrix Detection');

  it('6.1 Chrome user agent detects CTA, icon, image, and requiresInteraction', () => {
    const support = getBrowserWebPushSupport();
    assert.strictEqual(support.browser, 'chrome');
    assert(support.features.cta.includes('v53+'));
    assert(support.features.icon.includes('v33+'));
    assert(support.features.image.includes('v56+'));
    assert(support.features.requiresInteraction.includes('v47+'));
    assert.strictEqual(support.serviceWorker, true);
  });

  it('6.2 Notification permission status returns default when unprompted', () => {
    const perm = getNotificationPermissionStatus();
    assert.strictEqual(perm, 'default');
  });

  console.log('\n================================================================');
  console.log(`Web Push E2E Test Results: ${passedTests} passed, ${totalTests - passedTests} failed out of ${totalTests} total tests`);
  console.log('================================================================\n');

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
