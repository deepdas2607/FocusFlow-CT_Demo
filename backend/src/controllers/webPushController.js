// ============================================================================
// FILE: backend/src/controllers/webPushController.js
// PURPOSE: Controller handling VAPID Key Generation, Web Push Configuration,
// and CleverTap Web Push Status endpoints.
// Documentation: https://developer.clevertap.com/docs/web-push
// ============================================================================

const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const VAPID_STORE_PATH = path.join(__dirname, '../database/vapidKeys.json');

// Helper to load or initialize persistent VAPID keys
function getOrGenerateStoredVapidKeys() {
  if (fs.existsSync(VAPID_STORE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(VAPID_STORE_PATH, 'utf-8'));
      if (data.publicKey && data.privateKey) {
        return data;
      }
    } catch {
      // Re-generate if file corrupted
    }
  }

  // Generate fresh VAPID key pair using web-push package
  const keys = webpush.generateVAPIDKeys();
  const payload = {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    protocol: 'VAPID (RFC 8292)',
    generatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(VAPID_STORE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[WebPushController] Failed to persist VAPID keys to disk:', err.message);
  }

  return payload;
}

// 1. GET /api/push/vapid
function handleGetVapidKeys(req, res) {
  try {
    const keys = getOrGenerateStoredVapidKeys();
    res.json({
      status: 'ok',
      protocol: 'VAPID',
      keys: {
        publicKey: keys.publicKey,
        // Mask private key in basic fetch for security, provide flag if full export requested
        privateKeyMasked: keys.privateKey.slice(0, 6) + '...' + keys.privateKey.slice(-4),
        privateKey: req.query.reveal === 'true' ? keys.privateKey : undefined,
        generatedAt: keys.generatedAt
      },
      clevertapInstructions: {
        location: 'CleverTap Dashboard -> Settings -> Engage -> Channels -> Web Push',
        browsers: ['Google Chrome', 'Mozilla Firefox', 'Safari (macOS / iOS PWA)'],
        action: 'Enable radio buttons for each browser and paste your VAPID Public & Private key pair.'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 2. POST /api/push/vapid/generate
function handleGenerateVapidKeys(req, res) {
  try {
    const keys = webpush.generateVAPIDKeys();
    const payload = {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      protocol: 'VAPID (RFC 8292)',
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(VAPID_STORE_PATH, JSON.stringify(payload, null, 2), 'utf-8');

    res.json({
      status: 'ok',
      message: 'Fresh VAPID keys generated successfully using web-push package',
      keys: payload
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 3. GET /api/push/status
function handleGetWebPushStatus(req, res) {
  try {
    const keys = getOrGenerateStoredVapidKeys();
    res.json({
      status: 'ok',
      serviceWorker: {
        fileName: 'clevertap_sw.js',
        path: '/clevertap_sw.js',
        importScript: 'https://s3-eu-west-1.amazonaws.com/static.wizrocket.com/js/sw_webpush.js',
        documentRoot: true
      },
      manifest: {
        fileName: 'manifest.json',
        path: '/manifest.json',
        displayMode: 'standalone',
        requiredForIosSafari: true
      },
      vapidConfigured: Boolean(keys.publicKey && keys.privateKey),
      vapidPublicKey: keys.publicKey,
      clevertapRegion: 'eu1',
      supportedFeatures: {
        chrome: { cta: 'v53+', icon: 'v33+ (desktop), v42+ (android)', image: 'v56+', requiresInteraction: 'v47+' },
        firefox: { cta: 'No', icon: 'v26+', image: 'No', requiresInteraction: 'v117+' },
        safari: { cta: 'No', icon: 'No', image: 'No', requiresInteraction: 'No' }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 4. POST /api/push/simulate
function handleSimulatePushNotification(req, res) {
  try {
    const { title, body, icon, image, ctaButtons, deepLink } = req.body || {};
    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Notification title is required' });
    }

    const simulatedPayload = {
      id: `push_${Date.now()}`,
      notification: {
        title: title || 'FocusFlow Streak Alert',
        body: body || 'You are 1 session away from completing your daily deep work goal!',
        icon: icon || '/icon-192x192.png',
        image: image || null,
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
          deepLink: deepLink || 'http://localhost:3000/#timer',
          clevertapAccount: '587-878-Z97Z',
          region: 'eu1'
        },
        actions: Array.isArray(ctaButtons) ? ctaButtons : [
          { action: 'open_timer', title: 'Start Timer' },
          { action: 'dismiss', title: 'Later' }
        ]
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'ok',
      message: 'Simulated Web Push notification payload constructed',
      pushPayload: simulatedPayload
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

module.exports = {
  handleGetVapidKeys,
  handleGenerateVapidKeys,
  handleGetWebPushStatus,
  handleSimulatePushNotification
};

