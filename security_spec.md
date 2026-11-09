# Security Specification & Test Matrix

## 1. Data Invariants
- Admin write privileges for level unlocks and student roster management require authenticated teacher status (`isAdmin()`).
- Student profiles have bounded field lengths (e.g. `displayName` <= 100 chars, `studentCode` <= 32 chars).
- Student attempt logs must have legitimate schema types (boolean `isCorrect`, numeric `scoreAwarded`).
- Level unlocks require all 5 defined keys (`tamanPancasila`, `perpustakaanCeria`, `kantinPintar`, `studioKreatif`, `lapanganPersahabatan`).
- Default deny: all undocumented collections and paths are closed (`match /{document=**} { allow read, write: if false; }`).

## 2. Dirty Dozen Threat Payloads
1. **Ghost Field in Student Profile**: Injecting `{ role: "admin", isSuperUser: true }` into `/students/{studentId}`.
2. **Oversized Display Name**: Injecting a 50KB string into `displayName`.
3. **Malicious Negative Score**: Attempting to set `scoreAwarded: -9999` or non-number `scoreAwarded: "hacked"`.
4. **Unauthorized Level Unlock Override**: Unauthenticated or spoofed client setting `perpustakaanCeria: true` without teacher rights.
5. **Direct Catch-all Write**: Attempting to write to arbitrary root collection `/system_secrets/keys`.
6. **Student ID Spoofing in Attempt Log**: Attempting to log answers with missing `studentId` or empty fields.
7. **Malformed Level ID**: Injecting script tags or SQL injection strings into `levelId`.
8. **Unauthorized Roster Deletion**: Unauthenticated client attempting to wipe `/students/{studentId}`.
9. **Log Field Flooding**: Adding arbitrary untyped metadata arrays to `/attemptLogs/{logId}`.
10. **Admin Privilege Escalation**: Non-admin attempting to write to `/admins/{uid}`.
11. **Empty Unlock Keys**: Attempting to set `levelUnlocks` without required mission flags.
12. **Fake Timestamp Tampering**: Non-string timestamp payload.
