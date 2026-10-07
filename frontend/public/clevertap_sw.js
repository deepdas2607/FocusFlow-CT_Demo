/**
 * CleverTap Web Push Service Worker
 *
 * This service worker listens for push notifications dispatched from CleverTap
 * campaigns and handles notification clicks in the browser.
 *
 * Hosted at: /clevertap_sw.js (root scope)
 */

importScripts('https://s3-eu-west-1.amazonaws.com/static.wizrocket.com/js/sw_webpush.js');

