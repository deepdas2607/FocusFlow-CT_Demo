// ============================================================================
// FILE: backend/src/controllers/webNativeDisplayController.js
// PURPOSE: Controller handling CleverTap Web Native Display Campaigns,
// Priority Resolution Engine, and Simulated Event Delivery.
// Documentation: https://developer.clevertap.com/docs/web-native-display
// ============================================================================

const DEFAULT_NATIVE_CAMPAIGNS = [
  {
    id: 'camp_cart_dropoff_v1',
    name: 'Cart Drop-off (20% Off)',
    type: 'kv_pair',
    eventName: 'CT_web_native_display',
    selector: null,
    priority: 2,
    topic: 'Cart drop-off',
    payload: {
      kv: {
        topic: 'Cart drop-off',
        Name: 'Elena Vance',
        Cart: 'Roadster Jacket',
        DiscountCode: 'SALE20',
        DiscountPercent: '20%',
        ExpiryHours: 24,
        BannerImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
      },
      msgId: '1649748667_20261018_c1',
      wzrk_pivot: 'wzrk_default'
    }
  },
  {
    id: 'camp_cart_dropoff_v2',
    name: 'Cart Drop-off VIP (30% Off)',
    type: 'kv_pair',
    eventName: 'CT_web_native_display',
    selector: null,
    priority: 4,
    topic: 'Cart drop-off',
    payload: {
      kv: {
        topic: 'Cart drop-off',
        Name: 'Elena Vance',
        Cart: 'FocusFlow Noise-Canceling Headset',
        DiscountCode: 'VIP30',
        DiscountPercent: '30%',
        ExpiryHours: 12,
        BannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      },
      msgId: '1649748667_20261018_c2',
      wzrk_pivot: 'variant_high_priority'
    }
  },
  {
    id: 'camp_streak_milestone',
    name: 'Focus Streak Celebration',
    type: 'kv_pair',
    eventName: 'CT_web_native_display',
    selector: null,
    priority: 3,
    topic: 'Focus Streak Milestone',
    payload: {
      kv: {
        topic: 'Focus Streak Milestone',
        Name: 'Elena Vance',
        StreakCount: 7,
        MilestoneBadge: 'Golden Pomodoro Champion',
        CelebrationMessage: 'Unstoppable! 7 consecutive deep work days completed.'
      },
      msgId: '1649748667_20261018_c3',
      wzrk_pivot: 'streak_v1'
    }
  },
  {
    id: 'camp_pro_upgrade',
    name: 'Pro Upgrade Special Offer',
    type: 'kv_pair',
    eventName: 'CT_web_native_display',
    selector: null,
    priority: 2,
    topic: 'Pro Upgrade Offer',
    payload: {
      kv: {
        topic: 'Pro Upgrade Offer',
        Name: 'Elena Vance',
        PlanName: 'FocusFlow Annual Pro',
        OriginalPrice: '$59.99',
        OfferPrice: '$29.99',
        Perks: 'Binaural Soundscapes, Unlimited Analytics, Priority Sync'
      },
      msgId: '1649748667_20261018_c4',
      wzrk_pivot: 'annual_pro_50off'
    }
  },
  {
    id: 'camp_banner_standard',
    name: 'Summer Focus Accelerator Banner',
    type: 'banner',
    eventName: 'CT_web_native_display_builder',
    selector: '#native-banner-container',
    priority: 1,
    topic: null,
    payload: {
      headline: 'Summer Deep Work Accelerator',
      subheadline: 'Join over 12,000 knowledge workers sprinting towards Q4 goals.',
      imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Explore Accelerator',
      divHeight: '180px',
      msgId: '1649748667_20261018_b1'
    }
  },
  {
    id: 'camp_banner_vip',
    name: 'VIP Masterclass Banner (High Priority)',
    type: 'banner',
    eventName: 'CT_web_native_display_builder',
    selector: '#native-banner-container',
    priority: 3,
    topic: null,
    payload: {
      headline: 'Elite Flow State Masterclass: Free Access',
      subheadline: 'Exclusive neuro-productivity webinar hosted with Dr. Andrew Huberman.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Claim Free Pass',
      divHeight: '210px',
      msgId: '1649748667_20261018_b2'
    }
  },
  {
    id: 'camp_json_ai_recommender',
    name: 'AI Habit Recommender (JSON Campaign)',
    type: 'json_based',
    eventName: 'CT_web_native_display_json',
    selector: null,
    priority: 2,
    topic: null,
    payload: {
      recommendations: [
        { title: 'Morning Deep Sprint (9:00 AM)', duration: '50m', boost: '+35% focus retention' },
        { title: 'Post-Lunch Recharge (2:00 PM)', duration: '20m', boost: '+40% energy bounce' }
      ],
      algorithm: 'Circadian-Flow-v2',
      msgId: '1649748667_20261018_j1'
    }
  }
];

// 1. GET /api/native/campaigns
function handleGetNativeCampaigns(req, res) {
  try {
    res.json({
      status: 'ok',
      campaigns: DEFAULT_NATIVE_CAMPAIGNS,
      rules: {
        kvPairTopicConflict: 'When multiple KV Pair campaigns share the same topic, only the highest-priority campaign executes.',
        uniqueKvTopics: 'KV Pair campaigns with unique topics all execute concurrently without conflict.',
        selectorConflict: 'When multiple Banner/Carousel campaigns target the same CSS selector, only the highest-priority campaign executes.',
        crossEventIsolation: 'Visual Editor (CT_web_native_display) and JSON (CT_web_native_display_json) campaigns do not compete with each other.'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 2. POST /api/native/resolve-priority
// Evaluates an arbitrary array of campaigns according to CleverTap's Priority Specification
function handleResolveCampaignPriorities(req, res) {
  try {
    const campaignsToEvaluate = req.body?.campaigns || DEFAULT_NATIVE_CAMPAIGNS;

    const executed = [];
    const suppressed = [];

    // Group 1: Customer Handled KV Pair Campaigns (grouped by topic under CT_web_native_display)
    const kvByTopic = {};
    const otherCustomerEvents = {};

    // Group 2: CleverTap Handled Campaigns (grouped by selector, e.g. #native-banner-container)
    const domBySelector = {};

    campaignsToEvaluate.forEach((camp) => {
      if (camp.type === 'kv_pair' && camp.eventName === 'CT_web_native_display') {
        const topic = camp.topic || camp.payload?.kv?.topic || 'default_topic';
        if (!kvByTopic[topic]) kvByTopic[topic] = [];
        kvByTopic[topic].push(camp);
      } else if (camp.type === 'banner' || camp.type === 'carousel' || camp.selector) {
        const sel = camp.selector || 'default_selector';
        if (!domBySelector[sel]) domBySelector[sel] = [];
        domBySelector[sel].push(camp);
      } else {
        const ev = camp.eventName || 'other';
        if (!otherCustomerEvents[ev]) otherCustomerEvents[ev] = [];
        otherCustomerEvents[ev].push(camp);
      }
    });

    // Resolve KV Pair Topic Conflicts: Highest Priority Wins per topic
    Object.entries(kvByTopic).forEach(([topic, camps]) => {
      // Sort descending by priority (higher number = higher priority)
      camps.sort((a, b) => b.priority - a.priority);
      const winner = camps[0];
      executed.push({
        ...winner,
        executionReason: `Highest priority (${winner.priority}) for topic "${topic}".`
      });

      for (let i = 1; i < camps.length; i++) {
        suppressed.push({
          ...camps[i],
          suppressionReason: `Suppressed by higher priority campaign "${winner.name}" (Priority ${winner.priority} vs ${camps[i].priority}) on topic "${topic}".`
        });
      }
    });

    // Resolve DOM Selector Conflicts: Highest Priority Wins per selector
    Object.entries(domBySelector).forEach(([sel, camps]) => {
      camps.sort((a, b) => b.priority - a.priority);
      const winner = camps[0];
      executed.push({
        ...winner,
        executionReason: `Highest priority (${winner.priority}) targeting selector "${sel}".`
      });

      for (let i = 1; i < camps.length; i++) {
        suppressed.push({
          ...camps[i],
          suppressionReason: `Suppressed by higher priority campaign "${winner.name}" (Priority ${winner.priority} vs ${camps[i].priority}) targeting common selector "${sel}".`
        });
      }
    });

    // Resolve Other Events (e.g. CT_web_native_display_json): highest priority per event name
    Object.entries(otherCustomerEvents).forEach(([ev, camps]) => {
      camps.sort((a, b) => b.priority - a.priority);
      const winner = camps[0];
      executed.push({
        ...winner,
        executionReason: `Highest priority (${winner.priority}) for event "${ev}". Independent from other event types.`
      });

      for (let i = 1; i < camps.length; i++) {
        suppressed.push({
          ...camps[i],
          suppressionReason: `Suppressed by higher priority campaign "${winner.name}" under event "${ev}".`
        });
      }
    });

    res.json({
      status: 'ok',
      totalSubmitted: campaignsToEvaluate.length,
      executedCount: executed.length,
      suppressedCount: suppressed.length,
      executed,
      suppressed
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 3. POST /api/native/simulate-event
function handleSimulateNativeEvent(req, res) {
  try {
    const { topic, campaignId, customKv } = req.body || {};
    const selectedCamp = DEFAULT_NATIVE_CAMPAIGNS.find(c => c.id === campaignId || (topic && c.topic === topic)) || DEFAULT_NATIVE_CAMPAIGNS[0];

    const eventPayload = {
      eventName: selectedCamp.eventName,
      detail: {
        kv: {
          topic: topic || selectedCamp.topic || 'Cart drop-off',
          ...(selectedCamp.payload?.kv || {}),
          ...(customKv || {})
        },
        msgId: selectedCamp.payload?.msgId || `1649748667_${Date.now()}`,
        wzrk_pivot: selectedCamp.payload?.wzrk_pivot || 'wzrk_default'
      }
    };

    res.json({
      status: 'ok',
      message: 'Simulated Web Native Display CustomEvent constructed',
      eventPayload
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

module.exports = {
  DEFAULT_NATIVE_CAMPAIGNS,
  handleGetNativeCampaigns,
  handleResolveCampaignPriorities,
  handleSimulateNativeEvent
};
