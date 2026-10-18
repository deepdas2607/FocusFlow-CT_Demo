// ============================================================================
// FILE: backend/src/controllers/webInboxController.js
// PURPOSE: Controller handling CleverTap Web Inbox notifications, message storage
// (SQLite with automatic seeding), read/unread state, deletion, and simulation.
// Official Docs: https://developer.clevertap.com/docs/web-inbox
// ============================================================================

const { db } = require('../database/sqliteDatabase');

const SEED_INBOX_MESSAGES = [
  {
    msgId: 'inbox_msg_001',
    title: 'Pomodoro Focus Streak Ignited! 🔥',
    body: 'You completed 7 daily focus blocks in a row. Claim your Golden Pomodoro Badge and maintain your momentum.',
    template: 'text_icon',
    // 1:1 Aspect ratio square icon
    iconUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=128&h=128&q=80',
    imageUrl: '',
    actionUrl: '/dashboard',
    actionText: 'Claim Badge',
    isRead: 0,
    isViewed: 0,
    wzrk_pivot: 'streak_milestone_v1',
    tags: 'all,habits'
  },
  {
    msgId: 'inbox_msg_002',
    title: 'New Binaural Alpha Soundscape Live 🎧',
    body: 'Boost deep work stamina by 34% with our newly released Rain & Theta Wave focus soundscape.',
    template: 'text_icon_image',
    // 1:1 Aspect ratio square icon
    iconUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=128&h=128&q=80',
    // 4:3 Aspect ratio rectangular image (800x600)
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&h=600&q=80',
    actionUrl: '/timer',
    actionText: 'Listen Now',
    isRead: 0,
    isViewed: 0,
    wzrk_pivot: 'soundscape_alpha_v2',
    tags: 'all,pro'
  },
  {
    msgId: 'inbox_msg_003',
    title: 'Elena, Your Weekly Focus Review is Ready 📊',
    body: 'You spent 185 productive minutes this week across 8 completed sessions. See how you compare to peers.',
    template: 'text_icon_image',
    // 1:1 Aspect ratio square icon
    iconUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80',
    // 4:3 Aspect ratio rectangular image (800x600)
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=600&q=80',
    actionUrl: '/progress',
    actionText: 'View Analytics',
    isRead: 1, // marked read for testing unread filter
    isViewed: 1,
    wzrk_pivot: 'weekly_recap_v1',
    tags: 'all,analytics'
  },
  {
    msgId: 'inbox_msg_004',
    title: 'CleverTap Web Inbox Connected',
    body: 'Your FocusFlow account is connected to the eu1 datacenter and receiving real-time stacked inbox notifications.',
    template: 'simple_text',
    iconUrl: '',
    imageUrl: '',
    actionUrl: '/settings',
    actionText: 'View Settings',
    isRead: 1,
    isViewed: 1,
    wzrk_pivot: 'system_sync_v1',
    tags: 'all,system'
  }
];

// Helper: Seed initial messages for a user if table is empty
function ensureSeedMessagesForUser(userId) {
  try {
    const existing = db.prepare('SELECT COUNT(*) as count FROM inbox_messages WHERE userId = ?').get(userId);
    if (!existing || existing.count === 0) {
      const now = new Date().toISOString();
      const insertStmt = db.prepare(`
        INSERT INTO inbox_messages (
          id, userId, msgId, title, body, template, iconUrl, imageUrl, actionUrl, actionText, isRead, isViewed, wzrk_pivot, tags, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      SEED_INBOX_MESSAGES.forEach((item, index) => {
        const id = `inbox_${userId}_${index + 1}_${Date.now()}`;
        insertStmt.run(
          id,
          userId,
          item.msgId,
          item.title,
          item.body,
          item.template,
          item.iconUrl,
          item.imageUrl,
          item.actionUrl,
          item.actionText,
          item.isRead,
          item.isViewed,
          item.wzrk_pivot,
          item.tags,
          now
        );
      });
    }
  } catch (err) {
    console.warn('[WebInbox] Seed error:', err);
  }
}

// 1. GET /api/inbox/messages?userId=...
function handleGetInboxMessages(req, res) {
  try {
    const userId = req.query.userId || 'usr_elena_vance';
    ensureSeedMessagesForUser(userId);

    const messages = db
      .prepare('SELECT * FROM inbox_messages WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId);

    const count = messages.length;
    const unreadCount = messages.filter((m) => m.isRead === 0).length;

    res.json({
      status: 'ok',
      userId,
      count,
      unreadCount,
      messages: messages.map((m) => ({
        ...m,
        isRead: Boolean(m.isRead),
        isViewed: Boolean(m.isViewed)
      }))
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 2. PATCH /api/inbox/messages/:msgId/read
function handleMarkMessageRead(req, res) {
  try {
    const { msgId } = req.params;
    const userId = req.body?.userId || req.query?.userId || 'usr_elena_vance';

    const result = db
      .prepare('UPDATE inbox_messages SET isRead = 1, isViewed = 1 WHERE (msgId = ? OR id = ?) AND userId = ?')
      .run(msgId, msgId, userId);

    const unread = db
      .prepare('SELECT COUNT(*) as unreadCount FROM inbox_messages WHERE userId = ? AND isRead = 0')
      .get(userId);

    res.json({
      status: 'ok',
      msgId,
      updated: result.changes > 0,
      unreadCount: unread?.unreadCount || 0
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 3. PATCH /api/inbox/messages/read-all
function handleMarkAllMessagesRead(req, res) {
  try {
    const userId = req.body?.userId || req.query?.userId || 'usr_elena_vance';

    const result = db
      .prepare('UPDATE inbox_messages SET isRead = 1, isViewed = 1 WHERE userId = ?')
      .run(userId);

    res.json({
      status: 'ok',
      userId,
      markedCount: result.changes,
      unreadCount: 0
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 4. DELETE /api/inbox/messages/:msgId
function handleDeleteInboxMessage(req, res) {
  try {
    const { msgId } = req.params;
    const userId = req.body?.userId || req.query?.userId || 'usr_elena_vance';

    const result = db
      .prepare('DELETE FROM inbox_messages WHERE (msgId = ? OR id = ?) AND userId = ?')
      .run(msgId, msgId, userId);

    const remaining = db
      .prepare('SELECT COUNT(*) as count FROM inbox_messages WHERE userId = ?')
      .get(userId);

    res.json({
      status: 'ok',
      msgId,
      deleted: result.changes > 0,
      remainingCount: remaining?.count || 0
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

// 5. POST /api/inbox/simulate
function handleSimulateIncomingInboxMessage(req, res) {
  try {
    const userId = req.body?.userId || 'usr_elena_vance';
    const template = req.body?.template || 'text_icon_image';
    const now = new Date().toISOString();
    const uniqueId = `inbox_${Date.now()}`;
    const msgId = `sim_msg_${Date.now()}`;

    let title = req.body?.title || '⚡ Flash Focus Challenge Active!';
    let body = req.body?.body || 'Complete 2 back-to-back 25-minute Pomodoro sessions in the next 3 hours for 2x XP.';
    let iconUrl = req.body?.iconUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=128&h=128&q=80';
    let imageUrl = req.body?.imageUrl || '';
    let actionUrl = req.body?.actionUrl || '/timer';
    let actionText = req.body?.actionText || 'Start Sprint';

    if (template === 'text_icon_image' && !imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=600&q=80';
    } else if (template === 'simple_text') {
      iconUrl = '';
      imageUrl = '';
    }

    db.prepare(`
      INSERT INTO inbox_messages (
        id, userId, msgId, title, body, template, iconUrl, imageUrl, actionUrl, actionText, isRead, isViewed, wzrk_pivot, tags, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'all', ?)
    `).run(
      uniqueId,
      userId,
      msgId,
      title,
      body,
      template,
      iconUrl,
      imageUrl,
      actionUrl,
      actionText,
      `pivot_${Date.now()}`,
      now
    );

    const newMessage = {
      id: uniqueId,
      userId,
      msgId,
      title,
      body,
      template,
      iconUrl,
      imageUrl,
      actionUrl,
      actionText,
      isRead: false,
      isViewed: false,
      wzrk_pivot: `pivot_${Date.now()}`,
      createdAt: now
    };

    res.status(201).json({
      status: 'ok',
      message: 'New Web Inbox message injected into SQLite',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

module.exports = {
  handleGetInboxMessages,
  handleMarkMessageRead,
  handleMarkAllMessagesRead,
  handleDeleteInboxMessage,
  handleSimulateIncomingInboxMessage,
  SEED_INBOX_MESSAGES
};
