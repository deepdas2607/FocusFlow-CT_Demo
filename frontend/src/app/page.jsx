'use client';

// ============================================================================
// FILE: frontend/src/app/page.jsx
// PURPOSE: Main FocusFlow application container connecting the ViewModel
// (useFocusFlowViewModel) to the modular Views (Sidebar, Dashboard, Tasks,
// Focus Timer, Progress, Settings, Pro Modal, and Live Activity & Payload Inspector).
// ============================================================================

import React from 'react';
import { useFocusFlowViewModel } from '../viewmodels/useFocusFlowViewModel';
import AuthView from '../views/AuthView';
import SidebarNavigationView from '../views/SidebarNavigationView';
import DashboardView from '../views/DashboardView';
import TasksView from '../views/TasksView';
import FocusTimerView from '../views/FocusTimerView';
import ProgressAnalyticsView from '../views/ProgressAnalyticsView';
import ProfileSettingsView from '../views/ProfileSettingsView';
import UpgradeProModalView from '../views/UpgradeProModalView';
import ActivityLogInspectorView from '../views/ActivityLogInspectorView';
import WebPopupsStudioView from '../views/WebPopupsStudioView';
import WebPopupsOverlayView from '../views/WebPopupsOverlayView';
import WebPushStudioView from '../views/WebPushStudioView';
import WebNativeDisplayStudioView from '../views/WebNativeDisplayStudioView';
import WebInboxStudioView from '../views/WebInboxStudioView';
import WebInboxOverlayView from '../views/WebInboxOverlayView';

export default function FocusFlowAppPage() {
  const vm = useFocusFlowViewModel();

  // If the user signed out, render the Login / Register screen
  if (!vm.isAuthenticated) {
    return (
      <AuthView
        onLogin={vm.handleLoginUser}
        onRegister={vm.handleRegisterUser}
        errorMessage={vm.errorMessage}
        setErrorMessage={vm.setErrorMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* 1. Left Sidebar Navigation */}
      <SidebarNavigationView
        activeTab={vm.activeTab}
        onSelectTab={vm.setActiveTab}
        user={vm.user}
        activeSession={vm.activeSession}
        secondsRemaining={vm.secondsRemaining}
        activityLogsCount={vm.activityLogs.length}
        isInspectorOpen={vm.isInspectorOpen}
        onToggleInspector={() => vm.setIsInspectorOpen(!vm.isInspectorOpen)}
        clevertapConfig={vm.clevertapConfig}
        isProUser={vm.isProUser}
        onOpenProModal={() => vm.setIsProModalOpen(true)}
        onSignOut={vm.handleSignOut}
        inboxUnreadCount={vm.inboxUnreadCount}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Navigation Bar with Official CleverTap Web Inbox Bell */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">FocusFlow</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800 capitalize">
              {vm.activeTab === 'native' ? 'Web Native Display' : vm.activeTab === 'inbox' ? 'Web Inbox' : vm.activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Official Web Inbox Bell Element ID: #ct-inbox-bell-trigger */}
            <button
              id="ct-inbox-bell-trigger"
              type="button"
              onClick={vm.handleToggleInbox}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                vm.isInboxOpen
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-900'
              }`}
              title="Click to toggle Web Inbox window"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {vm.inboxUnreadCount > 0 && (
                <span
                  id="unviewedBadge"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                >
                  {vm.inboxUnreadCount > 9 ? '9+' : vm.inboxUnreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-600">eu1</span>
            </div>
          </div>
        </header>
        {/* Top Status / Feedback Bar */}
        {(vm.statusMessage || vm.errorMessage) && (
          <div className="px-6 pt-4">
            {vm.statusMessage && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                <span>{vm.statusMessage}</span>
              </div>
            )}
            {vm.errorMessage && (
              <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
                <span>{vm.errorMessage}</span>
                <button
                  type="button"
                  onClick={() => vm.setErrorMessage('')}
                  className="text-rose-600 hover:text-rose-900 font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Screen View */}
        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto">
          {vm.activeTab === 'dashboard' && (
            <DashboardView
              user={vm.user}
              dashboard={vm.dashboard}
              onNavigateTab={vm.setActiveTab}
              onToggleTaskComplete={vm.handleToggleTaskComplete}
            />
          )}

          {vm.activeTab === 'tasks' && (
            <TasksView
              tasks={vm.tasks}
              onCreateTask={vm.handleCreateTask}
              onToggleTaskComplete={vm.handleToggleTaskComplete}
              onDeleteTask={vm.handleDeleteTask}
            />
          )}

          {vm.activeTab === 'focus' && (
            <FocusTimerView
              tasks={vm.tasks}
              sessions={vm.sessions}
              activeSession={vm.activeSession}
              selectedPreset={vm.selectedPreset}
              secondsRemaining={vm.secondsRemaining}
              selectedTaskId={vm.selectedTaskId}
              onSelectTaskId={vm.setSelectedTaskId}
              onSelectPreset={vm.handleSelectTimerPreset}
              onStartSession={vm.handleStartFocusSession}
              onCompleteSession={vm.handleCompleteFocusSession}
              onAbandonSession={vm.handleAbandonFocusSession}
            />
          )}

          {vm.activeTab === 'progress' && (
            <ProgressAnalyticsView
              dashboard={vm.dashboard}
              tasks={vm.tasks}
              sessions={vm.sessions}
            />
          )}

          {vm.activeTab === 'settings' && (
            <ProfileSettingsView
              user={vm.user}
              clevertapConfig={vm.clevertapConfig}
              isProUser={vm.isProUser}
              onOpenProModal={() => vm.setIsProModalOpen(true)}
              onSaveProfile={vm.handleSaveUserProfile}
              onManualOnUserLogin={vm.handleManualOnUserLoginPush}
              onManualProfilePush={vm.handleManualProfilePush}
              onUpdateCleverTapConfig={vm.handleUpdateCleverTapConfig}
              onPurchaseProPlan={vm.handlePurchaseProPlan}
              onSetLocation={vm.handleSetLocation}
              onIncrementProperty={vm.handleIncrementProperty}
              onDecrementProperty={vm.handleDecrementProperty}
              onPrivacyChange={vm.handlePrivacyChange}
              onDebugLevelChange={vm.handleDebugLevelChange}
              onToggleOfflineMode={vm.handleToggleOfflineMode}
              onFireCustomEvent={vm.handleFireCustomEvent}
            />
          )}

          {vm.activeTab === 'popups' && (
            <WebPopupsStudioView
              activePopup={vm.activePopup}
              dismissSpamControl={vm.dismissSpamControl}
              exitIntentEnabled={vm.exitIntentEnabled}
              pipConfig={vm.pipConfig}
              customNotificationMsg={vm.customNotificationMsg}
              popupAnalytics={vm.popupAnalytics}
              shownCampaignsInSession={vm.shownCampaignsInSession}
              onTriggerPopup={vm.handleTriggerPopup}
              onClosePopup={vm.handleCloseActivePopup}
              onPopupActionClick={vm.handlePopupActionClicked}
              onToggleDismissSpamControl={vm.handleToggleDismissSpamControl}
              onToggleExitIntent={vm.handleToggleExitIntent}
              onPipAnchorChange={vm.handlePipAnchorChange}
              onPipControl={vm.handlePipControl}
              onResetSessionCampaigns={vm.handleResetSessionCampaigns}
              onNavigateTab={vm.setActiveTab}
            />
          )}

          {vm.activeTab === 'push' && (
            <WebPushStudioView
              permissionStatus={vm.pushPermissionStatus}
              sdkVersionInfo={vm.sdkVersionInfo}
              browserSupport={vm.browserPushSupport}
              vapidKeys={vm.vapidKeys}
              cooldownInfo={vm.pushCooldownInfo}
              softPromptOptions={vm.softPromptOptions}
              onRequestSoftPrompt={vm.handleRequestSoftPrompt}
              onRequestNativePermission={vm.handleRequestNativePermission}
              onUpdateSoftPromptOptions={vm.handleUpdateSoftPromptOptions}
              onResetCooldown={vm.handleResetPushCooldown}
              onGenerateVapidKeys={vm.handleGenerateVapidKeys}
              onRefreshVapidKeys={vm.handleFetchVapidKeys}
              onSimulateTokenMigration={vm.handleSimulateTokenMigration}
              migrationResult={vm.migrationResult}
              onSimulatePushNotification={vm.handleSimulatePushNotification}
              simulatedPushResult={vm.simulatedPushResult}
              isLoadingVapid={vm.isLoadingVapid}
            />
          )}

          {vm.activeTab === 'native' && (
            <WebNativeDisplayStudioView
              nativeDisplayData={vm.nativeDisplayData}
              activeTopic={vm.activeNativeTopic}
              onTriggerTopic={vm.handleTriggerNativeTopic}
              onResetToFallback={vm.handleResetNativeFallback}
              onElementActionClicked={vm.handleNativeElementActionClicked}
              onResolvePriorities={vm.handleResolveNativePriorities}
              priorityResults={vm.priorityResults}
              isResolvingPriority={vm.isResolvingPriority}
              campaignsList={vm.nativeCampaignsList}
            />
          )}

          {vm.activeTab === 'inbox' && (
            <WebInboxStudioView
              inboxMessages={vm.inboxMessages}
              unreadCount={vm.inboxUnreadCount}
              isInboxOpen={vm.isInboxOpen}
              onToggleInbox={vm.handleToggleInbox}
              inboxPosition={vm.inboxPosition}
              onSetPosition={vm.handleSetInboxPosition}
              inboxStyles={vm.inboxStyles}
              onUpdateStyles={vm.handleUpdateInboxStyles}
              onSimulateIncomingMessage={vm.handleSimulateIncomingInboxMessage}
              onMarkRead={vm.handleMarkInboxMessageRead}
              onMarkAllRead={vm.handleMarkAllInboxMessagesRead}
              onDeleteMessage={vm.handleDeleteInboxMessage}
              onNotificationClicked={vm.handleInboxNotificationClicked}
              apiSuiteResults={vm.inboxApiTestResult}
              onRunApiTest={vm.handleRunInboxApiTest}
            />
          )}
        </main>
      </div>

      {/* Pop-up Overlay Renderer (Box, Banner, Interstitial, Image Only, PIP, Custom HTML) */}
      <WebPopupsOverlayView
        popup={vm.activePopup}
        pipConfig={vm.pipConfig}
        onClose={vm.handleCloseActivePopup}
        onActionClick={vm.handlePopupActionClicked}
        onPipControl={vm.handlePipControl}
      />

      {/* Official CleverTap Web Inbox Window (<ct-web-inbox>) */}
      <WebInboxOverlayView
        isOpen={vm.isInboxOpen}
        onClose={vm.handleCloseInbox}
        messages={vm.inboxMessages}
        unreadCount={vm.inboxUnreadCount}
        positionStyle={vm.inboxPositionStyle}
        inboxStyles={vm.inboxStyles}
        onNotificationViewed={vm.handleInboxNotificationViewed}
        onNotificationClicked={vm.handleInboxNotificationClicked}
        onMarkRead={vm.handleMarkInboxMessageRead}
        onMarkAllRead={vm.handleMarkAllInboxMessagesRead}
        onDeleteMessage={vm.handleDeleteInboxMessage}
      />

      {/* 3. Collapsible Right-Side Live Activity & Payload Inspector */}
      <ActivityLogInspectorView
        isOpen={vm.isInspectorOpen}
        onClose={() => vm.setIsInspectorOpen(false)}
        logs={vm.activityLogs}
        onClearLogs={vm.handleClearActivityLogs}
      />

      {/* 4. Floating Quick-Open Button when Payload Inspector is closed */}
      {!vm.isInspectorOpen && (
        <button
          type="button"
          onClick={() => vm.setIsInspectorOpen(true)}
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Activity &amp; Payloads</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[11px] font-mono">
            {vm.activityLogs.length}
          </span>
        </button>
      )}

      {/* 5. Upgrade to Pro Modal (Triggers "Charged" Event) */}
      <UpgradeProModalView
        isOpen={vm.isProModalOpen}
        onClose={() => vm.setIsProModalOpen(false)}
        onPurchase={vm.handlePurchaseProPlan}
        isProUser={vm.isProUser}
      />
    </div>
  );
}
