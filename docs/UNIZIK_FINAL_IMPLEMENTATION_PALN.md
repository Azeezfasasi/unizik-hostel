 
UNIZIK Hostel Management System 
Product Inventory & Internal Review Document 
Features, Pages & Recommended Additions 
 
An accurate map of what exists today across the Hostel Management site and the 
operations portal, followed by a shortlist of standard hostel-management features worth 
adding next. Companion to the upgrade implementation plan. 
 
Metadata | Details 
Status | Draft for team review 
Scope | Public site + portal, ~85 API endpoints, ~85 pages 
Prepared | 16 Aug 2026 
 
PART 1: What Exists Today 
 
1.1 Public Website (Unauthenticated) 
Page | Route | What It Does 
- Home | / | Hero slider, company overview, why choose us, testimonials, team section, blog/news preview, gallery preview, CTA, newsletter signup 

- About Us | /about-us | Organization overview content 

-Check Availability | /check-availability | Public room search - filters by hostel 
and price, shows available bed count per room 

- Blog /blog, | /blog/[slug] | Listing and article detail, with categories, comments, and likes 

- Gallery | /gallery, /gallery/[id] | Photo listing and detail view, with likes 

- Contact Us | /contact-us | Contact form — submissions land in dashboard inbox 

-Login/Register | /login, /register | Authentication and self-service account creation 
 
 
1.2 Authentication & Account Capabilities 
● Account Lifecycle: Register, login, logout. 
● Password Management: Forgot password / reset password (email token flow), email 
verification, self-service password change, and admin-triggered resets. 
● Profile Management: Profile view and edit capabilities. 
● Role Enforcement: super admin, admin, staff, student, the actual enum enforced by 
the data layer. 
 
1.3 Hostel Operations Portal 
Hostel & Room Management 
● Hierarchy: Campus => Hostel => Room hierarchy; gender restriction, block/floor, 
facilities, rules & policies per hostel. 
● Operations: Room list with capacity, price, facilities, and status. 
● Allocations: Room requests (student picks room + bed => pending/approved/declined), 
direct admin assign/unassign, allocation history, per-student room history, occupancy 
dashboard. 
● Student View: "My Room Details" - student view with downloadable room card. 
 
 
Facility Management & Maintenance 
● Facility inventory with categories. 
● Damage reporting per facility with repair status and update notes. 
● "All Damage Reports" admin view. 
Student Management & Complaints 
● Student Records: Student list, admin-created student records (separate from 
self-registration). 
● Complaints Workflow: Category, location, description on submission => Status 
workflow: Open => In-Progress => Resolved => Closed. Includes priority, staff 
assignment, resolution notes, and student feedback/rating. 
Content Management (CMS) & Communications 
● CMS: Blog posts & categories, gallery, homepage content (hero slider, welcome CTA, 
testimonials, message slider, site logo), contact page content and contact-form inbox. 
● Communication: Newsletter send/subscribers/history via Brevo. 
● User Management: List, add, edit, role assignment, activate/deactivate, and admin 
password resets 
● Dashboard Overview: A welcome panel renders for everyone, but stats and charts 
(campus chart, hostel chart) currently render only for the super admin role, other roles 
land on a mostly empty dashboard home. 

1.4 In Navigation, Not Yet Functional 
These routes have active menu links, but their page files are placeholder stubs with no 
real UI or data logic yet. 
 
Announcements, Notifications  
/dashboard/announcements 
/dashboard/manage-announcements  
Finish implementation 

/dashboard/all-notifications - Finish or hide from nav 

My Transactions, Transaction History, Change User Password, User Detail View 
/dashboard/my-transactions 
/dashboard/transaction-history 
/dashboard/change-user-password 
/dashboard/all-users/[id] 
Finish implementation
 
 
2.1 Move-In / Move-Out Workflow [MUST-HAVE] 
Gap: Room assignment jumps straight from "approved" to "occupied," with no record of 
physical handover. 
● Check-In Checklist: Confirmation with a room/furniture condition checklist, signed off by 
student and staff. 
● Check-Out Checklist: Protects both hostel and student in a damage dispute, plugging 
directly into the existing Facility damage-report model. 
● Digital Rules Sign-off: Acknowledgment of hostel rules at check-in 
(Hostel.rulesAndPolicies already exists, this closes the loop on confirming it was read). 

2.2 Visitor & Security Logging [SHOULD-HAVE] 
● Visitor sign-in/sign-out log at the hostel gate, tied to a resident host. 
● Optional curfew/late-return logging. 
● Security Escalation: Distinguish security incidents (theft, trespassing, safety) from 
general facility complaints - "Security" is currently just one category value inside the 
general Complaints model, with no severity escalation. 
2.4 Notifications System [SHOULD-HAVE] 
Gap: The "All Notifications" page is a stub, and email only covers a couple of basic flows 
(registration welcome). 
● Defined Trigger Matrix: Room assigned/declined, payment due/received, complaint 
status change, damage-report update, announcement published. 
● In-app notification bell with real-time unread count.  
Gap: A student can request an initial room, but there's no structured way to request a 
transfer once assigned - this typically becomes an ad-hoc complaint or a manual admin 
reassignment today. 
● Formal "Request Room Change" flow, distinct from initial booking. 
● Optional roommate-initiated swap (two students agree, submit together, staff approves). 
2.6 Waitlist for Full Rooms [SHOULD-HAVE] 
Gap: Room.status already models "occupied," but a student who wants a full room has 
no way to be notified when a bed opens. 
● Waitlist queuing for high-demand hostels or fully occupied rooms with automated 
notifications when capacity opens up. 
2.7 Identity / Document Verification [SHOULD-HAVE] 
Gap: Registration only collects name/email/password today. Pairs naturally with the 
server-side role-assignment fix already flagged in the implementation plan. 
● Matriculation number + uploaded student ID or admission letter required at registration. 
● Queued for admin verification before a room request can be approved. 
2.8 Room Inspection Scheduling [NICE-TO-HAVE] 
● Recurring staff inspection checklist (safety, cleanliness, condition) on a scheduled basis, 
independent of student-submitted damage reports. 
2.9 Reporting & Data Export [NICE-TO-HAVE] 
Gap: No CSV/PDF export exists for any admin list view today. 
● One-click "Export current view to CSV" on heavy admin tables (all-students, 
all-room-requests, manage-complaints). 
2.10 Visual Floor Plan & Bed Map [NICE-TO-HAVE] 
● Interactive bed-map layout (visualizing open vs. occupied beds at a glance) 
complementing the existing tabular capacity data. 
2.11 FAQ & Help Center [NICE-TO-HAVE] 
● A lightweight self-service FAQ for common questions (room request processes, 
payments, maintenance) to reduce repeat submissions on the contact form. 
 