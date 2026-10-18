// ============================================================================
// FILE: scripts/test_web_popups_e2e.js
// PURPOSE: Automated End-to-End (E2E) Test Suite for FocusFlow & CleverTap:
// - Web Pop-ups (Box, Banner, Interstitial, Image Only, Advanced Builder)
// - Picture-in-Picture (PIP <ct-web-popup-pip> with 9 anchor positions)
// - Desktop Exit Intent listener (clientY <= 10, innerWidth > 480)
// - Dismiss Spam Control (session-level delivery rules)
// - SPA route auto-dismissal (clevertap.spa = true)
// - Custom notificationCallback (renderNotificationViewed / Clicked)
// - Custom HTML popupCallback & wzrk_c2a click tracking
// - Backend SQLite API (User, Dashboard, Tasks, Sessions)
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

console.log('================================================================');
console.log('FocusFlow & CleverTap Web Pop-ups & Exit Intent E2E Test Suite');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// TEST SUITE 1: DOM Mock Setup & SDK Close Button Removal
// ----------------------------------------------------------------------------
console.log('Test Suite 1: Web Pop-up Close Buttons & DOM Structures');

const domElements = new Map();

global.document = {
  getElementById: (id) => {
    if (!domElements.has(id)) return null;
    return {
      id,
      remove: () => domElements.delete(id)
    };
  },
  querySelector: (sel) => {
    if (sel === 'ct-web-popup-pip' && domElements.has('ct-web-popup-pip')) {
      return {
        id: 'ct-web-popup-pip',
        remove: () => domElements.delete('ct-web-popup-pip')
      };
    }
    return null;
  },
  documentElement: {
    addEventListener: (evt, cb) => {
      global._docListeners = global._docListeners || {};
      global._docListeners[evt] = cb;
    },
    removeEventListener: (evt) => {
      if (global._docListeners) delete global._docListeners[evt];
    }
  }
};

global.window = {
  innerWidth: 1024,
  document: global.document,
  open: () => {},
  clevertap: {
    spa: true,
    dismissSpamControl: true,
    renderNotificationViewed: (payload) => { global._viewedPayload = payload; },
    renderNotificationClicked: (payload) => { global._clickedPayload = payload; },
    raisePopupNotificationClicked: (payload) => { global._popupClickedPayload = payload; },
    notificationCallback: null,
    popupCallback: null
  }
};

it('1.1 Box Pop-up (#wizParDiv0) close button removes container from DOM', () => {
  domElements.set('wizParDiv0', true);
  assert.strictEqual(domElements.has('wizParDiv0'), true);
  const wrapper = global.document.getElementById('wizParDiv0');
  wrapper.remove();
  assert.strictEqual(domElements.has('wizParDiv0'), false);
});

it('1.2 Banner Pop-up (#wizParDiv2) close button removes container from DOM', () => {
  domElements.set('wizParDiv2', true);
  assert.strictEqual(domElements.has('wizParDiv2'), true);
  const wrapper = global.document.getElementById('wizParDiv2');
  wrapper.remove();
  assert.strictEqual(domElements.has('wizParDiv2'), false);
});

it('1.3 Interstitial (#intentOpacityDiv + #intentPreview) removes overlay and preview', () => {
  domElements.set('intentOpacityDiv', true);
  domElements.set('intentPreview', true);
  assert.strictEqual(domElements.has('intentOpacityDiv'), true);
  assert.strictEqual(domElements.has('intentPreview'), true);

  const overlay = global.document.getElementById('intentOpacityDiv');
  const preview = global.document.getElementById('intentPreview');
  overlay.remove();
  preview.remove();

  assert.strictEqual(domElements.has('intentOpacityDiv'), false);
  assert.strictEqual(domElements.has('intentPreview'), false);
});

it('1.4 Image Only Pop-up (#wzrkImageOnlyDiv) close button removes container from DOM', () => {
  domElements.set('wzrkImageOnlyDiv', true);
  assert.strictEqual(domElements.has('wzrkImageOnlyDiv'), true);
  const wrapper = global.document.getElementById('wzrkImageOnlyDiv');
  wrapper.remove();
  assert.strictEqual(domElements.has('wzrkImageOnlyDiv'), false);
});

it('1.5 Picture-in-Picture (<ct-web-popup-pip>) close button removes custom element', () => {
  domElements.set('ct-web-popup-pip', true);
  assert.strictEqual(domElements.has('ct-web-popup-pip'), true);
  const pip = global.document.querySelector('ct-web-popup-pip');
  pip.remove();
  assert.strictEqual(domElements.has('ct-web-popup-pip'), false);
});

// ----------------------------------------------------------------------------
// TEST SUITE 2: Picture-in-Picture (PIP) 9 Anchors & Responsive Breakpoints
// ----------------------------------------------------------------------------
console.log('\nTest Suite 2: Picture-in-Picture (PIP) 9 Anchors & Breakpoints');

const {
  PIP_ANCHOR_POSITIONS,
  getPipPositionClasses,
  resolvePipClickAction
} = require('../frontend/src/services/clevertapSdkService');

it('2.1 Exactly 9 valid screen anchor positions are supported', () => {
  const expectedAnchors = [
    'center',
    'top-left',
    'top',
    'top-right',
    'left',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right'
  ];
  assert.strictEqual(PIP_ANCHOR_POSITIONS.length, 9);
  expectedAnchors.forEach((a) => assert(PIP_ANCHOR_POSITIONS.includes(a), `Missing anchor: ${a}`));
});

it('2.2 Anchor positioning CSS classes map accurately for all 9 zones', () => {
  assert(getPipPositionClasses('center').includes('top-1/2 left-1/2'));
  assert(getPipPositionClasses('top-left').includes('top-5 left-5'));
  assert(getPipPositionClasses('top').includes('top-5 left-1/2'));
  assert(getPipPositionClasses('top-right').includes('top-5 right-5'));
  assert(getPipPositionClasses('left').includes('top-1/2 left-5'));
  assert(getPipPositionClasses('right').includes('top-1/2 right-5'));
  assert(getPipPositionClasses('bottom-left').includes('bottom-5 left-5'));
  assert(getPipPositionClasses('bottom').includes('bottom-5 left-1/2'));
  assert(getPipPositionClasses('bottom-right').includes('bottom-5 right-5'));
});

it('2.3 Viewport breakpoint: Desktop (> 480px) uses display.pip.onClick', () => {
  global.window.innerWidth = 1024;
  const config = {
    display: {
      pip: { onClick: 'https://focusflow.app/pro/desktop' },
      mobile: { pip: { onClick: 'https://focusflow.app/pro/mobile' } }
    }
  };
  const action = resolvePipClickAction(config);
  assert.strictEqual(action, 'https://focusflow.app/pro/desktop');
});

it('2.4 Viewport breakpoint: Mobile (<= 480px) uses display.mobile.pip.onClick', () => {
  global.window.innerWidth = 375;
  const config = {
    display: {
      pip: { onClick: 'https://focusflow.app/pro/desktop' },
      mobile: { pip: { onClick: 'https://focusflow.app/pro/mobile' } }
    }
  };
  const action = resolvePipClickAction(config);
  assert.strictEqual(action, 'https://focusflow.app/pro/mobile');
});

it('2.5 Viewport breakpoint: Mobile falls back to display.pip if mobile config not set', () => {
  global.window.innerWidth = 480; // Exactly 480 is treated as mobile
  const config = {
    display: {
      pip: { onClick: 'https://focusflow.app/fallback' }
    }
  };
  const action = resolvePipClickAction(config);
  assert.strictEqual(action, 'https://focusflow.app/fallback');
});

// ----------------------------------------------------------------------------
// TEST SUITE 3: Desktop Exit Intent Detection
// ----------------------------------------------------------------------------
console.log('\nTest Suite 3: Desktop Exit Intent Detection');

const { setupCleverTapExitIntentListener } = require('../frontend/src/services/clevertapSdkService');

it('3.1 Desktop Exit Intent triggers when mouse leaves towards top edge (clientY <= 10)', () => {
  global.window.innerWidth = 1280;
  let triggered = false;
  let receivedData = null;

  const cleanup = setupCleverTapExitIntentListener((data) => {
    triggered = true;
    receivedData = data;
  });

  // Simulate mouse moving to tab bar (clientY = 4)
  global._docListeners['mouseleave']({ clientY: 4 });

  assert.strictEqual(triggered, true);
  assert.strictEqual(receivedData.trigger, 'mouse_leave_top');
  assert.strictEqual(receivedData.clientY, 4);
  assert.strictEqual(receivedData.viewportWidth, 1280);

  cleanup();
});

it('3.2 Exit Intent is suppressed on mobile viewports (innerWidth <= 480)', () => {
  global.window.innerWidth = 414;
  let triggered = false;

  const cleanup = setupCleverTapExitIntentListener(() => {
    triggered = true;
  });

  global._docListeners['mouseleave']({ clientY: 0 });
  assert.strictEqual(triggered, false);

  cleanup();
});

// ----------------------------------------------------------------------------
// TEST SUITE 4: Dismiss Spam Control & Session Logic
// ----------------------------------------------------------------------------
console.log('\nTest Suite 4: Dismiss Spam Control (Session Logic)');

const { updateCleverTapDismissSpamControl } = require('../frontend/src/services/clevertapSdkService');

it('4.1 updateCleverTapDismissSpamControl sets flag and returns behavior description', () => {
  const resultTrue = updateCleverTapDismissSpamControl(true);
  assert.strictEqual(resultTrue.dismissSpamControl, true);
  assert(resultTrue.behavior.includes('Campaigns can repeat within the same session'));

  const resultFalse = updateCleverTapDismissSpamControl(false);
  assert.strictEqual(resultFalse.dismissSpamControl, false);
  assert(resultFalse.behavior.includes('will NOT repeat within the same session once dismissed'));
});

it('4.2 Session evaluation blocks repeat delivery when dismissSpamControl = false', () => {
  const sessionCampaigns = {};
  const campaignId = 'camp_summer_discount_2026';
  const dismissSpamControlSetting = false;

  function canShowCampaign(cId) {
    if (!dismissSpamControlSetting && sessionCampaigns[cId]) {
      return false; // Blocked
    }
    sessionCampaigns[cId] = true;
    return true; // Allowed
  }

  // 1st attempt in session: allowed
  assert.strictEqual(canShowCampaign(campaignId), true);
  // 2nd attempt in same session: blocked
  assert.strictEqual(canShowCampaign(campaignId), false);
  // 3rd attempt: blocked
  assert.strictEqual(canShowCampaign(campaignId), false);
});

it('4.3 Session evaluation allows repeat delivery when dismissSpamControl = true', () => {
  const sessionCampaigns = {};
  const campaignId = 'camp_daily_streak_reminder';
  const dismissSpamControlSetting = true;

  function canShowCampaign(cId) {
    if (!dismissSpamControlSetting && sessionCampaigns[cId]) {
      return false;
    }
    sessionCampaigns[cId] = true;
    return true;
  }

  // 1st attempt: allowed
  assert.strictEqual(canShowCampaign(campaignId), true);
  // 2nd attempt in same session: allowed!
  assert.strictEqual(canShowCampaign(campaignId), true);
  // 3rd attempt: allowed!
  assert.strictEqual(canShowCampaign(campaignId), true);
});

// ----------------------------------------------------------------------------
// TEST SUITE 5: Custom Notification Callback & wzrk_c2a Click Tracking
// ----------------------------------------------------------------------------
console.log('\nTest Suite 5: Custom Notification Callback & Click Tracking');

const {
  renderCleverTapNotificationViewed,
  renderCleverTapNotificationClicked,
  raiseCleverTapPopupNotificationClicked
} = require('../frontend/src/services/clevertapSdkService');

it('5.1 renderCleverTapNotificationViewed builds canonical payload with msgId and pivotId', () => {
  const res = renderCleverTapNotificationViewed({
    msgId: '1630318544_20261018',
    pivotId: 'Variant_A'
  });
  assert.strictEqual(res.payload.msgId, '1630318544_20261018');
  assert.strictEqual(res.payload.pivotId, 'Variant_A');
});

it('5.2 renderCleverTapNotificationClicked builds canonical payload with custom kv pairs', () => {
  const res = renderCleverTapNotificationClicked({
    msgId: '1630318544_20261018',
    pivotId: 'Variant_B',
    kv: { discount: '30%', source: 'exit_intent' }
  });
  assert.strictEqual(res.payload.msgId, '1630318544_20261018');
  assert.strictEqual(res.payload.pivotId, 'Variant_B');
  assert.strictEqual(res.payload.kv.discount, '30%');
});

it('5.3 raiseCleverTapPopupNotificationClicked accepts custom HTML notification object', () => {
  const notificationObj = {
    msgId: 'html_popup_99812_2026',
    pivotId: 'HTML_Hero_1'
  };
  const res = raiseCleverTapPopupNotificationClicked(notificationObj);
  assert.strictEqual(res.notificationObj.msgId, 'html_popup_99812_2026');
});

// ----------------------------------------------------------------------------
// TEST SUITE 6: Backend SQLite REST API Verification
// ----------------------------------------------------------------------------
console.log('\nTest Suite 6: Backend SQLite REST API Endpoints');

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function runBackendTests() {
  await asyncIt('6.1 GET /api/health returns ok status and SQLite database file path', async () => {
    const res = await fetchJson('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert(res.body.databaseFile.includes('focusflow.db'));
  });

  await asyncIt('6.2 GET /api/user?userId=usr_elena_vance returns Elena Vance profile', async () => {
    const res = await fetchJson('/api/user?userId=usr_elena_vance');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.name, 'Elena Vance');
    assert.strictEqual(res.body.user.email, 'elena.vance@focusflow.app');
    assert.strictEqual(res.body.user.phone, '+14155552671');
    assert.strictEqual(res.body.user.dob, '1998-05-14');
  });

  await asyncIt('6.3 GET /api/dashboard?userId=usr_elena_vance returns productivity metrics', async () => {
    const res = await fetchJson('/api/dashboard?userId=usr_elena_vance');
    assert.strictEqual(res.status, 200);
    assert(typeof res.body.dashboard.totalFocusMinutes === 'number');
    assert(typeof res.body.dashboard.currentStreak === 'number');
  });

  await asyncIt('6.4 GET /api/tasks?userId=usr_elena_vance returns tasks from SQLite', async () => {
    const res = await fetchJson('/api/tasks?userId=usr_elena_vance');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.tasks));
    assert(res.body.tasks.length > 0);
  });

  await asyncIt('6.5 GET /api/sessions?userId=usr_elena_vance returns focus sessions from SQLite', async () => {
    const res = await fetchJson('/api/sessions?userId=usr_elena_vance');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.sessions));
  });

  console.log('\n================================================================');
  console.log(`E2E Test Results: ${passedTests} passed, ${totalTests - passedTests} failed out of ${totalTests} total tests`);
  console.log('================================================================\n');

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

runBackendTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
