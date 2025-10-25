# Screen Lock Implementation Flowchart

## Overview

The screen lock feature provides secure session locking with automatic inactivity timeout, cross-tab synchronization, and password protection.

---

## When Does Screen Lock Appear?

### Scenario 1: Automatic Inactivity Lock

**Trigger:** User is inactive for 45 minutes

**Activity Detection:**

- Mouse movement
- Mouse clicks
- Keyboard input
- Scroll actions
- Touch events

**Flow:**

1. Last activity time is tracked continuously
2. After 45 minutes without any activity → Screen locks automatically
3. All open tabs lock simultaneously
4. User sees lock screen with password prompt

### Scenario 2: Manual Screen Lock

**Trigger:** User clicks the lock button

**Flow:**

1. User clicks lock button (🔒 icon) in the header
2. Screen locks immediately
3. All open tabs lock simultaneously
4. User sees lock screen

### Scenario 3: Page Refresh While Locked

**Trigger:** User refreshes a locked page

**Flow:**

1. If screen was previously locked (state saved in sessionStorage)
2. Lock screen appears immediately on page load
3. User must enter password to continue

### Scenario 4: Opening New Tab While Locked

**Trigger:** User opens new tab while locked

**Flow:**

1. New tab loads → checks sessionStorage
2. Finds locked state → Shows lock screen immediately
3. User must enter password

---

## Key Scenarios:

| Scenario         | When It Happens              | Time Threshold   |
| ---------------- | ---------------------------- | ---------------- |
| **Auto-lock**    | No user activity             | After 45 minutes |
| **Manual lock**  | User clicks lock button      | Immediate        |
| **Refresh lock** | Page reload while locked     | Immediate        |
| **New tab lock** | Opening new tab while locked | Immediate        |

---

## Core Features

### 1. **Manual Screen Lock**

- User can manually lock screen by clicking lock button
- Saves current tab's path in session storage
- Broadcasts lock event to all tabs

### 2. **Automatic Inactivity Lock**

- Monitors user activity (mouse, keyboard, scroll, touch)
- After 45 minutes of inactivity → automatically locks screen
- Tracks last activity timestamp

### 3. **Cross-Tab Synchronization**

- Uses `BroadcastChannel` API for real-time communication
- When one tab locks → all tabs lock simultaneously
- When password entered in one tab → all tabs unlock simultaneously

### 4. **Password Protection**

- Requires correct password to unlock
- Tracks failed login attempts (max 3 attempts)
- Account locks after max attempts reached
- Shows progress bar and success animation

### 5. **Session Persistence**

- Lock state persists across page refreshes
- Each tab maintains its own navigation path
- Prevents back button/navigation when locked

---

## Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTIVITY                                │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  User Inactive?     │
                    │  (45 min timeout)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────┴───────────┐
                    │                     │
                  YES                    NO
                    │                     │
                    ▼                     ▼
        ┌───────────────────┐   ┌─────────────────┐
        │  LOCK SCREEN      │   │  Update Last    │
        │  All Tabs         │   │  Activity Time  │
        └──────────┬────────┘   └─────────┬───────┘
                   │                      │
                   │                      │ (Continue Monitoring)
                   │                      │
                   ▼                      ▼
      ┌──────────────────────────────────────────┐
      │      SAVE LOCK STATE                      │
      │  1. Set isLocked = true                   │
      │  2. Save path to sessionStorage           │
      │  3. Broadcast LOCK to all tabs            │
      │  4. Save timestamp                        │
      └──────────────────┬───────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │        LOCK SCREEN DIALOG                 │
      │  • Shows current time                     │
      │  • Shows user info                        │
      │  • Password input field                   │
      │  • Disabled all navigation                │
      └──────────────────┬───────────────────────┘
                         │
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │    USER ENTERS PASSWORD                   │
      └──────────────────┬───────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │     VALIDATE PASSWORD                     │
      │  • Send to applocklogIn API               │
      │  • Check response.result                  │
      └──────────────────┬───────────────────────┘
                         │
              ┌──────────┴───────────┐
              │                     │
          VALID                  INVALID
              │                     │
              ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  SUCCESS         │  │  INCREMENT       │
    │  1. Show success │  │  FAILED ATTEMPTS │
    │     animation    │  └────────┬─────────┘
    │  2. Unlock tab   │           │
    │  3. Clear state  │           │
    └────────┬─────────┘           │
             │                     │
             │        ┌────────────┴──────────┐
             │        │                       │
             │   < MAX (3)              >= MAX (3)
             │        │                       │
             │        ▼                       ▼
             │  ┌──────────┐        ┌────────────────┐
             │  │ Show     │        │ ACCOUNT LOCKED │
             │  │ Error    │        │ Contact Admin  │
             │  │ Message  │        │ Return Login   │
             │  └────┬─────┘        └────────────────┘
             │       │
             │       │ (Can retry)
             │       │
             │       └──────┐
             │              │
             │              ▼
             │  ┌─────────────────────────────┐
             └─▶│  SHOW LOCK SCREEN AGAIN     │
                │  (Prompt for password)      │
                └─────────────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │   BROADCAST UNLOCK TO ALL TABS            │
      │   1. Post UNLOCK message to channel       │
      │   2. All tabs receive message             │
      └──────────────────┬───────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │   ALL TABS UNLOCKED                       │
      │   1. Set isLocked = false                 │
      │   2. Clear sessionStorage                 │
      │   3. Navigate to tab-specific path        │
      │   4. Reset failed attempts                │
      │   5. Clear error messages                 │
      └──────────────────┬───────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │   USER CONTINUES WORK                     │
      │   Activity monitoring resumes             │
      └──────────────────────────────────────────┘
```

---

## Cross-Tab Synchronization Details

### BroadcastChannel Communication

```typescript
// Channel: "auth"
// Message Types: "LOCK" | "UNLOCK"

// LOCK Message Structure:
{
  type: "LOCK",
  data: {
    lastPath: string,      // Current path where lock occurred
    timestamp: number,      // When lock happened
    tabId: string          // Unique tab identifier
  }
}

// UNLOCK Message Structure:
{
  type: "UNLOCK",
  data: {
    tabId: string          // Tab that initiated unlock
  }
}
```

### Key Fix Applied (2024)

**Problem:**

- Password entered in one tab only unlocked that specific tab
- Other tabs remained locked, requiring multiple password entries

**Solution:**

```typescript
// BEFORE (Bug):
if (type === "UNLOCK") {
  if (data?.tabId === tabId) {
    return // ❌ Only unlocked the initiating tab
  }
  // Other tabs stayed locked
}

// AFTER (Fixed):
if (type === "UNLOCK") {
  // ✅ Unlock ALL tabs when broadcast received
  setIsLocked(false)
  setAppLocked(false)
  sessionStorage.removeItem(LOCK_STATE_KEY)
  // Clear all state and reset for all tabs
}
```

---

## State Management

### Session Storage Keys

1. **`appLocked`** - Main lock state

   ```json
   {
     "isLocked": true,
     "lastPath": "/ar/invoice",
     "timestamp": 1234567890,
     "tabId": "abc123"
   }
   ```

2. **`tab_specific_path_{tabId}`** - Per-tab navigation path
   ```
   Key: tab_specific_path_abc123
   Value: /ar/invoice
   ```

---

## Security Features

1. **Failed Attempt Tracking**
   - Tracks consecutive failed password attempts
   - Maximum 3 attempts allowed
   - After max attempts: Account locked, requires admin

2. **Session Persistence**
   - Lock state survives page refresh
   - Timestamp validation (24-hour expiry)
   - Prevents navigation when locked

3. **Inactivity Protection**
   - 45-minute auto-lock timeout
   - Activity monitoring: mouse, keyboard, scroll, touch
   - Continuous background checking

4. **Cross-Tab Security**
   - If user closes locked tab and opens new tab → still locked
   - If user opens new tab while locked → shows lock screen
   - Consistent security state across all tabs

---

## User Experience Flow

### Scenario 1: Normal Lock/Unlock

1. User inactive for 45 minutes
2. All tabs auto-lock
3. User sees lock screen with time/date/greeting
4. User enters password once
5. All tabs unlock simultaneously ✅
6. User continues where they left off

### Scenario 2: Manual Lock

1. User clicks lock button
2. All tabs lock immediately
3. User enters password
4. All tabs unlock
5. User returns to work

### Scenario 3: Multiple Tabs

1. User has 5 tabs open
2. Screen locks (auto or manual)
3. User enters password in ANY tab
4. All 5 tabs unlock at once ✅
5. No need to enter password 5 times

---

## Implementation Files

### Main Component

- **`components/layout/screen-lock.tsx`** (699 lines)
  - Core screen lock component
  - BroadcastChannel integration
  - State management
  - UI rendering

### Supporting Files

- **`stores/auth-store.ts`** - Authentication state management
- **`hooks/use-session-expiry.ts`** - Session expiry handling

---

## Key Constants

```typescript
INACTIVITY_TIMEOUT = 45 * 60 * 1000 // 45 minutes
MAX_FAILED_ATTEMPTS = 3
LOCK_STATE_KEY = "appLocked"
BROADCAST_CHANNEL = "auth"
TAB_SPECIFIC_PATH_KEY = "tab_specific_path"
```

---

## Testing Checklist

- [x] Manual screen lock works
- [x] Auto-lock after 45 min inactivity
- [x] Password validation
- [x] Failed attempt tracking (max 3)
- [x] Account lock after max attempts
- [x] Cross-tab synchronization (LOCK)
- [x] Cross-tab synchronization (UNLOCK) ✅ **FIXED**
- [x] Session persistence
- [x] Navigation prevention when locked
- [x] Tab-specific path restoration

---

## Future Enhancements (Optional)

1. **Configurable Timeout**
   - Allow admin to set custom inactivity timeout
   - Store in database settings

2. **Biometric Authentication**
   - Add fingerprint/face recognition support
   - Modern browser APIs

3. **Activity-Based Unlock**
   - Alternative to password (face detection)
   - Motion detection

4. **Notification Before Lock**
   - Warning 5 minutes before auto-lock
   - User can extend session

---

## Troubleshooting

### Issue: Screen won't unlock

- Check browser console for errors
- Verify BroadcastChannel support
- Check sessionStorage is enabled
- Clear browser cache and retry

### Issue: Multiple tabs not syncing

- Verify all tabs are same origin
- Check BroadcastChannel is working
- Ensure no ad blockers interfering

### Issue: Lock screen appears repeatedly

- ✅ **FIXED** - Now unlocks all tabs with one password entry
- Previously required password per tab
- Cross-tab synchronization now works correctly

---

## Version History

### v1.0 (Initial)

- Basic screen lock functionality
- Manual and auto-lock
- Password protection

### v1.1 (Fixed - 2024)

- ✅ Fixed cross-tab unlock synchronization
- All tabs unlock with single password entry
- Improved user experience

---

## Related Documentation

- [Session Expiry Flowchart](./session-expiry-flowchart.md)
- [Auth Store Documentation](../stores/auth-store.ts)
