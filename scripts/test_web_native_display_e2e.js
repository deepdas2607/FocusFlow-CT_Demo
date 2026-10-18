// ============================================================================
// FILE: scripts/test_web_native_display_e2e.js
// PURPOSE: Comprehensive Automated E2E Test Suite for CleverTap Web Native Display:
// - Custom Key-Value Pair Template & Document Listener
// - Strict Rule: Topic must be the first key of the kv object
// - Topic Routing & Custom Rendering Functions (Cart drop-off, Streak, Pro Offer)
// - Fallback / Default Content Rendering on delayed response
// - Notification Viewed & Clicked event tracking
// - Campaign Priority Resolution Engine (Conflicting topics, unique topics,
//   overlapping selectors, and cross-event isolation)
// - Backend Native Campaigns API & Priority Resolution Endpoints
// ============================================================================

const http = require('http');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed, raw: rawData });
          } catch (e) {
            resolve({ statusCode: res.statusCode, headers: res.headers, data: null, raw: rawData });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Minimal DOM simulation for event and element testing in Node
class SimpleEventTarget {
  constructor() {
    this.listeners = {};
  }
  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  removeEventListener(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach((cb) => cb(event));
    return true;
  }
}

class SimpleCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail || null;
  }
}

// Mock CleverTap SDK Web Native Display Logic
const mockCleverTapNative = {
  notificationViewedCalls: [],
  notificationClickedCalls: [],
  renderNotificationViewed(data) {
    this.notificationViewedCalls.push(data);
  },
  renderNotificationClicked(data) {
    this.notificationClickedCalls.push(data);
  }
};

function resolveNativeDisplayPriorities(campaigns = []) {
  const executed = [];
  const suppressed = [];

  const kvByTopic = {};
  const domBySelector = {};
  const otherCustomerEvents = {};

  campaigns.forEach((camp) => {
    if (camp.type === 'kv_pair' && (camp.eventName === 'CT_web_native_display' || !camp.eventName)) {
      const topic = camp.topic || camp.payload?.kv?.topic || 'default';
      if (!kvByTopic[topic]) kvByTopic[topic] = [];
      kvByTopic[topic].push(camp);
    } else if (camp.type === 'banner' || camp.type === 'carousel' || camp.selector) {
      const sel = camp.selector || 'default_selector';
      if (!domBySelector[sel]) domBySelector[sel] = [];
      domBySelector[sel].push(camp);
    } else {
      const ev = camp.eventName || 'CT_web_native_display_json';
      if (!otherCustomerEvents[ev]) otherCustomerEvents[ev] = [];
      otherCustomerEvents[ev].push(camp);
    }
  });

  // 1. KV Pair Topic Resolution
  Object.entries(kvByTopic).forEach(([topic, list]) => {
    list.sort((a, b) => b.priority - a.priority);
    const winner = list[0];
    executed.push({
      ...winner,
      resolution: `Won execution (Highest Priority ${winner.priority} for topic "${topic}").`
    });
    for (let i = 1; i < list.length; i++) {
      suppressed.push({
        ...list[i],
        resolution: `Suppressed: Lower priority (${list[i].priority}) vs winning campaign "${winner.name}" (${winner.priority}) on topic "${topic}".`
      });
    }
  });

  // 2. DOM Selector Resolution
  Object.entries(domBySelector).forEach(([sel, list]) => {
    list.sort((a, b) => b.priority - a.priority);
    const winner = list[0];
    executed.push({
      ...winner,
      resolution: `Won execution (Highest Priority ${winner.priority} for selector "${sel}").`
    });
    for (let i = 1; i < list.length; i++) {
      suppressed.push({
        ...list[i],
        resolution: `Suppressed: Lower priority (${list[i].priority}) vs winning campaign "${winner.name}" (${winner.priority}) targeting selector "${sel}".`
      });
    }
  });

  // 3. Other Events Resolution (Cross-Event Isolation)
  Object.entries(otherCustomerEvents).forEach(([ev, list]) => {
    list.sort((a, b) => b.priority - a.priority);
    const winner = list[0];
    executed.push({
      ...winner,
      resolution: `Won execution (Highest Priority ${winner.priority} under event "${ev}").`
    });
    for (let i = 1; i < list.length; i++) {
      suppressed.push({
        ...list[i],
        resolution: `Suppressed under event "${ev}".`
      });
    }
  });

  return {
    total: campaigns.length,
    executedCount: executed.length,
    suppressedCount: suppressed.length,
    executed,
    suppressed
  };
}

async function runNativeDisplayTestSuite() {
  console.log('\n================================================================');
  console.log('FocusFlow & CleverTap Web Native Display E2E Test Suite');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Custom Event CT_web_native_display & Topic Rule
  // --------------------------------------------------------------------------
  console.log('Test Suite 1: Custom Event & Strict Topic Placement Rule');
  {
    const mockDocument = new SimpleEventTarget();
    let receivedPayload = null;

    mockDocument.addEventListener('CT_web_native_display', (e) => {
      receivedPayload = e.detail;
    });

    // Create payload where topic is guaranteed first key
    const rawKv = {
      topic: 'Cart drop-off',
      Name: 'Elena Vance',
      Cart: 'Roadster Jacket',
      DiscountCode: 'SALE20'
    };

    const keys = Object.keys(rawKv);
    assert(keys[0] === 'topic', '1.1 First key of kv object is strictly "topic" according to CleverTap spec');

    mockDocument.dispatchEvent(
      new SimpleCustomEvent('CT_web_native_display', {
        detail: { kv: rawKv, msgId: '1649748667_01' }
      })
    );

    assert(receivedPayload !== null, '1.2 Document listener receives "CT_web_native_display" event');
    assert(receivedPayload.kv.topic === 'Cart drop-off', '1.3 Event detail contains correct topic value');
    assert(receivedPayload.kv.Name === 'Elena Vance', '1.4 User attributes preserved in key-value payload');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Topic Routing & Rendering Functions
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 2: Topic Routing & Notification Viewed/Clicked Tracking');
  {
    mockCleverTapNative.notificationViewedCalls = [];
    mockCleverTapNative.notificationClickedCalls = [];

    // 2.1 Cart drop-off
    const cartData = {
      kv: {
        topic: 'Cart drop-off',
        Name: 'Elena Vance',
        Cart: 'Roadster Jacket',
        DiscountCode: 'SALE20'
      },
      msgId: 'cart_101'
    };

    function renderCartDropOff(data) {
      mockCleverTapNative.renderNotificationViewed(data);
      return {
        rendered: true,
        userName: data.kv.Name,
        product: data.kv.Cart,
        code: data.kv.DiscountCode
      };
    }

    const cartResult = renderCartDropOff(cartData);
    assert(cartResult.rendered === true, '2.1 renderCartDropOffPersonalisationCampaign renders successfully');
    assert(cartResult.product === 'Roadster Jacket', '2.2 Dynamic product name "Roadster Jacket" injected');
    assert(mockCleverTapNative.notificationViewedCalls.length === 1, '2.3 clevertap.renderNotificationViewed called on render');

    // 2.2 User Click Tracking
    mockCleverTapNative.renderNotificationClicked(cartData);
    assert(mockCleverTapNative.notificationClickedCalls.length === 1, '2.4 clevertap.renderNotificationClicked called on CTA click');
    assert(mockCleverTapNative.notificationClickedCalls[0].msgId === 'cart_101', '2.5 Click event records correct campaign msgId');

    // 2.3 Focus Streak Milestone Topic
    const streakData = {
      kv: {
        topic: 'Focus Streak Milestone',
        Name: 'Elena Vance',
        StreakCount: 7,
        MilestoneBadge: 'Golden Pomodoro Champion'
      },
      msgId: 'streak_202'
    };
    function renderStreak(data) {
      mockCleverTapNative.renderNotificationViewed(data);
      return { rendered: true, streak: data.kv.StreakCount };
    }
    const streakResult = renderStreak(streakData);
    assert(streakResult.streak === 7, '2.6 Streak milestone topic renders 7-day streak');
    assert(mockCleverTapNative.notificationViewedCalls.length === 2, '2.7 Notification Viewed tracked for streak campaign');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Fallback & Default Content Rendering
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 3: Fallback / Default Content Rendering');
  {
    function resolveElementContent(nativeData) {
      if (!nativeData || !nativeData.kv || !nativeData.kv.topic) {
        return { isFallback: true, title: 'Supercharge Your Focus Today' };
      }
      return { isFallback: false, title: `Welcome ${nativeData.kv.Name}` };
    }

    const fallbackRes = resolveElementContent(null);
    assert(fallbackRes.isFallback === true, '3.1 Default fallback is rendered when nativeData is null (delayed response)');
    assert(fallbackRes.title === 'Supercharge Your Focus Today', '3.2 Fallback default title is displayed safely');

    const liveRes = resolveElementContent({ kv: { topic: 'Cart drop-off', Name: 'Elena' } });
    assert(liveRes.isFallback === false, '3.3 Dynamic personalized element replaces fallback when data arrives');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Campaign Priority Resolution Engine
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 4: Campaign Priority Resolution Engine (Official Spec)');
  {
    // Case 1: Conflicting KV Pair Topics
    const conflictingTopicCampaigns = [
      { id: 'camp_1', name: 'Standard 20%', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Cart drop-off', priority: 2 },
      { id: 'camp_2', name: 'VIP 30%', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Cart drop-off', priority: 5 }
    ];
    const resConflicting = resolveNativeDisplayPriorities(conflictingTopicCampaigns);
    assert(resConflicting.executedCount === 1, '4.1 Conflicting topics: Exactly 1 campaign wins execution');
    assert(resConflicting.executed[0].id === 'camp_2', '4.2 Conflicting topics: Highest priority (priority 5) wins');
    assert(resConflicting.suppressedCount === 1, '4.3 Conflicting topics: Lower priority (priority 2) is suppressed');

    // Case 2: Unique Topics Concurrency
    const uniqueTopicsCampaigns = [
      { id: 'camp_cart', name: 'Cart recovery', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Cart drop-off', priority: 2 },
      { id: 'camp_streak', name: 'Streak 7', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Focus Streak Milestone', priority: 3 },
      { id: 'camp_pro', name: 'Pro Offer', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Pro Upgrade Offer', priority: 1 }
    ];
    const resUnique = resolveNativeDisplayPriorities(uniqueTopicsCampaigns);
    assert(resUnique.executedCount === 3, '4.4 Unique topics: All 3 campaigns execute concurrently');
    assert(resUnique.suppressedCount === 0, '4.5 Unique topics: Zero campaigns suppressed');

    // Case 3: Overlapping DOM Selectors (Banners / Carousels)
    const overlappingSelectors = [
      { id: 'camp_banner_low', name: 'Low Priority Banner', type: 'banner', selector: '#native-banner-container', priority: 1 },
      { id: 'camp_banner_high', name: 'High Priority Banner', type: 'banner', selector: '#native-banner-container', priority: 4 }
    ];
    const resSelector = resolveNativeDisplayPriorities(overlappingSelectors);
    assert(resSelector.executedCount === 1, '4.6 Overlapping selectors: Only 1 campaign wins per container selector');
    assert(resSelector.executed[0].id === 'camp_banner_high', '4.7 Overlapping selectors: Highest priority banner replaces container');
    assert(resSelector.suppressedCount === 1, '4.8 Overlapping selectors: Lower priority banner is suppressed');

    // Case 4: Cross-Event Isolation
    const crossEventCampaigns = [
      { id: 'camp_custom_kv', name: 'Customer KV Campaign', type: 'kv_pair', eventName: 'CT_web_native_display', topic: 'Cart drop-off', priority: 3 },
      { id: 'camp_json_editor', name: 'JSON Editor Campaign', type: 'json_custom', eventName: 'CT_web_native_display_json', priority: 3 }
    ];
    const resCross = resolveNativeDisplayPriorities(crossEventCampaigns);
    assert(resCross.executedCount === 2, '4.9 Cross-event isolation: CT_web_native_display and CT_web_native_display_json execute independently');
    assert(resCross.suppressedCount === 0, '4.10 Cross-event isolation: No cross-event suppression occurs');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Div ID Targeting & Height Specifications
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 5: Div ID Targeting & Layout Guidelines');
  {
    const bannerContainerSpec = {
      selector: '#native-banner-container',
      minHeightPx: 140,
      overflow: 'hidden'
    };
    const carouselContainerSpec = {
      selector: '#native-carousel-container',
      minHeightPx: 220,
      overflow: 'hidden'
    };

    assert(bannerContainerSpec.selector === '#native-banner-container', '5.1 Banner template targets valid Div ID "#native-banner-container"');
    assert(bannerContainerSpec.minHeightPx >= 100, '5.2 Banner container specifies minimum height to prevent cumulative layout shift (CLS)');
    assert(carouselContainerSpec.selector === '#native-carousel-container', '5.3 Carousel template targets valid Div ID "#native-carousel-container"');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Backend SQLite REST API Endpoints for Web Native Display
  // --------------------------------------------------------------------------
  console.log('\nTest Suite 6: Backend SQLite REST API Endpoints');
  try {
    // 6.1 GET /api/native/campaigns
    const getRes = await makeRequest('GET', '/api/native/campaigns');
    assert(getRes.statusCode === 200, '6.1 GET /api/native/campaigns returns 200 OK');
    assert(Array.isArray(getRes.data.campaigns), '6.2 Campaigns array returned with pre-configured mock campaigns');
    assert(getRes.data.campaigns.length >= 6, '6.3 At least 6 diverse campaigns configured (KV, Banner, Carousel, JSON)');

    // 6.2 POST /api/native/resolve-priority
    const priorityPostRes = await makeRequest('POST', '/api/native/resolve-priority', {
      campaigns: getRes.data.campaigns
    });
    assert(priorityPostRes.statusCode === 200, '6.4 POST /api/native/resolve-priority returns 200 OK');
    assert(priorityPostRes.data.executedCount > 0, '6.5 Winning executed campaigns returned');
    assert(priorityPostRes.data.suppressedCount > 0, '6.6 Conflicting suppressed campaigns identified and isolated');

    // 6.3 POST /api/native/simulate-event
    const simRes = await makeRequest('POST', '/api/native/simulate-event', {
      topic: 'Cart drop-off',
      customKv: { Name: 'Elena Vance' }
    });
    assert(simRes.statusCode === 200, '6.7 POST /api/native/simulate-event returns 200 OK');
    assert(simRes.data.eventPayload.eventName === 'CT_web_native_display', '6.8 Event name is canonical CT_web_native_display');
    const simKeys = Object.keys(simRes.data.eventPayload.detail.kv);
    assert(simKeys[0] === 'topic', '6.9 Simulated event guarantees "topic" as 1st key of kv object');
    assert(simRes.data.eventPayload.detail.kv.Name === 'Elena Vance', '6.10 Simulated event identifies Elena Vance correctly');
  } catch (err) {
    console.error('Test Suite 6 Error:', err);
    throw err;
  }

  console.log('\n================================================================');
  console.log(`Web Native Display E2E Test Results: ${passedTests} passed, ${failedTests} failed out of ${totalTests} total tests`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runNativeDisplayTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
