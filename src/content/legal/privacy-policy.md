# Co-Split Privacy Policy

**Effective Date:** November 12, 2026  
**Last Updated:** November 12, 2026

## 1. Introduction

Welcome to Co-Split ("Co-Split," "we," "our," or "us").

Co-Split is a collaborative group expense management application that allows users to create workspaces, record shared expenses, manage group memberships, calculate individual balances, and record settlements between members.

This Privacy Policy explains how Co-Split collects, uses, stores, and shares personal information when you access or use our website and application at [https://www.cosplit.site](https://www.cosplit.site).

We are committed to handling personal information responsibly and in accordance with applicable data protection laws, including the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), where applicable.

By using Co-Split, you acknowledge that you have read this Privacy Policy.

## 2. Personal Information We Collect

We collect information that you provide through the application and information generated when you use its functionality.

### 2.1 Account and Profile Information

Co-Split currently supports Google Sign-In through Supabase Authentication.

When you authenticate using Google, we receive and process account information made available through the authentication process, including:

- Email address.
- Display name.
- Profile picture URL, when available.
- Unique user account identifier.
- Account creation timestamp.

We use this information to identify your account, display your profile, and associate your activity with your account.

Co-Split does not request or store your Google account password. Authentication is handled through the Google and Supabase authentication services.

### 2.2 Workspace Information

When you create or participate in a workspace, we collect and store:

- Workspace name.
- Workspace identifier.
- Workspace owner's account identifier.
- Workspace currency.
- Allowed member limit.
- Workspace creation timestamp.
- Workspace membership information.
- Membership join timestamps.

This information allows Co-Split to organize users into shared expense workspaces and determine which users participate in a group.

### 2.3 Expense Information

When you create or manage an expense, we collect information entered into the expense form, including:

- Expense description.
- Expense amount.
- Expense category.
- Identity of the member who paid.
- Members included in the expense split.
- Associated workspace identifier.
- Expense creation timestamp.
- Account identifier associated with the expense creator, where recorded.

This information is used to calculate shared expenses, determine individual financial responsibilities, and maintain workspace expense records.

### 2.4 Settlement Information

Co-Split includes a settlement-recording feature that allows users to record payments made between workspace members.

When a settlement is recorded, the application stores it as an expense entry with a Payment or Settlement category.

This record may contain:

- Payment description.
- Payment amount.
- Identity of the paying member.
- Identity of the receiving member, represented through the expense split participants.
- Associated workspace.
- Recorded timestamp.

Co-Split uses these records to update outstanding balances and settlement calculations.

**Co-Split does not process, transfer, or hold money between users through this functionality.** Settlement records are used to track payments reported by users.

### 2.5 Invitation and Membership Information

Workspace owners and members can invite other users through shareable invitation links and workspace identifiers.

The application processes:

- Workspace invitation codes.
- Workspace identifiers.
- Membership associations.
- Information necessary to validate and process workspace invitations.

Invitation codes allow users to join the corresponding workspace through the application's invitation functionality.

Users should only share invitation links with individuals they intend to invite.

### 2.6 Email Notification Information

Co-Split currently provides automated email notifications when a new expense is added to a workspace.

For these notifications, the application processes:

- Recipient email address.
- Workspace name.
- Expense description.
- Expense amount.
- Workspace currency.
- Workspace link.

These notifications are sent to workspace members through Resend, our email delivery service.

The application excludes expenses categorized as Payment or Settlement from these new-expense notifications.

The notification system also maintains delivery-related records, including notification status, delivery attempts, timestamps, and error information.

### 2.7 Information Processed by the Application

When you access Co-Split, certain information is processed as necessary to operate the application, maintain authentication sessions, retrieve account information, and perform workspace operations.

The application also uses browser session storage to temporarily retain workspace or invitation information during authentication and navigation.

We do not describe IP-address collection, device fingerprinting, advertising profiles, or analytics tracking as application features because these are not implemented in the current application source code.

## 3. How We Use Your Information

We process personal information for the following purposes:

1. **Account Authentication:** To authenticate users through Google Sign-In and maintain their application sessions.
2. **Profile Management:** To identify users and display their profile information within the application.
3. **Workspace Management:** To create workspaces, manage workspace settings, and associate members with their respective groups.
4. **Expense Management:** To create, retrieve, update, and delete expense records.
5. **Expense Distribution:** To calculate individual expense shares and determine each member's financial balance.
6. **Settlement Tracking:** To record reported payments between members and calculate outstanding balances.
7. **Invitation Management:** To generate, validate, and process workspace invitation codes and links.
8. **Email Notifications:** To notify workspace members when a new eligible expense is recorded.
9. **Application Operation:** To retrieve and maintain application data and provide the functionality available through Co-Split.
10. **Security and Reliability:** To authenticate access, enforce configured database permissions, apply rate limits, and maintain the reliability of application services.
11. **Legal Compliance:** To comply with applicable laws and lawful requests from authorized authorities.

We process personal information only for purposes that are relevant to the operation of Co-Split and other applicable lawful purposes.

## 4. How We Share Your Information

We share personal information only where necessary to operate Co-Split, provide its functionality, or comply with applicable legal obligations.

### 4.1 Workspace Members

Co-Split is a collaborative application. Information associated with a workspace is intended to support the participation of its members.

Depending on the functionality and configured access permissions, workspace information may include:

- Workspace name and settings.
- Member names and profile pictures.
- Recorded expenses.
- Expense amounts and descriptions.
- Expense payer and split participants.
- Calculated balances.
- Recorded settlements.

Workspace members should understand that information entered into a shared workspace is not intended to be private from the other participants who are authorized to access that workspace.

### 4.2 Supabase

Co-Split uses Supabase for:

- User authentication.
- PostgreSQL database services.
- User profile storage.
- Workspace and membership records.
- Expense records.
- Database operations and related application functionality.

Information submitted through Co-Split is processed by Supabase as part of providing these services.

For more information, refer to the [Supabase Privacy Policy](https://supabase.com/privacy).

### 4.3 Google

Co-Split uses Google Sign-In through Supabase Authentication.

When you choose Google Sign-In, information necessary for authentication is exchanged between the authentication services and Co-Split.

Google processes information according to its own privacy policies.

For more information, refer to the [Google Privacy Policy](https://policies.google.com/privacy).

### 4.4 Resend

Co-Split uses Resend to deliver automated new-expense notification emails.

For this purpose, relevant recipient and expense information is transmitted to Resend, including the recipient's email address, workspace name, expense description, amount, and currency.

Resend processes this information to deliver the notification emails.

For more information, refer to the [Resend Privacy Policy](https://resend.com/legal/privacy-policy).

### 4.5 Legal Disclosures

We may disclose personal information if required by applicable law, a valid court order, or a lawful request from an authorized government authority.

We may also disclose information when reasonably necessary to protect the security of Co-Split, investigate suspected misuse, or protect the rights of users, subject to applicable law.

We do not disclose personal information for purposes unrelated to operating the application unless otherwise permitted or required by law.

## 5. Data Storage and Security

Co-Split uses Supabase PostgreSQL to store application data and Supabase Authentication to manage user authentication.

We implement database access controls and application-level safeguards intended to protect personal information.

The application also uses authenticated sessions and configured database permissions to support access to account and workspace functionality.

However, no electronic system or method of transmission over the internet can guarantee absolute security.

Users should protect their Google accounts and avoid sharing authentication credentials or private workspace invitation links with unauthorized individuals.

## 6. Data Retention

We retain personal information for as long as necessary to provide the application's functionality, maintain workspace records, and fulfill applicable legal obligations.

The retention of information depends on the type of record and its relationship to an active account or workspace.

### 6.1 Workspace Records

Workspace information, memberships, and associated expense records are maintained as part of the application's database.

Workspace owners can delete their workspaces through the workspace settings functionality.

Deleting a workspace permanently deletes its associated expenses and memberships through the database's configured cascading deletion behavior.

### 6.2 Account Information

Account and profile information is associated with the user's authentication account.

The current application does not provide a self-service account deletion feature.

For requests involving account deletion or personal information removal, contact us using the details in Section 11.

Some records may be affected by relationships with other users and workspaces. Requests will be handled subject to applicable legal requirements and the rights of other affected users.

### 6.3 Retention Periods

The current application does not define a fixed retention period for all categories of personal information.

We will review information that is no longer necessary for its original purpose and take appropriate action in accordance with applicable legal obligations.

## 7. Your Privacy Rights

Under the Philippine Data Privacy Act of 2012, you may exercise applicable rights concerning your personal information, subject to the conditions and limitations provided by law.

These rights include:

- **Right to Be Informed:** To be informed about the collection and processing of your personal information.
- **Right to Access:** To request reasonable access to your personal information.
- **Right to Object:** To object to certain forms of personal information processing when permitted by law.
- **Right to Rectification:** To request correction of inaccurate or incomplete personal information.
- **Right to Erasure or Blocking:** To request the removal or blocking of personal information under applicable circumstances.
- **Right to Data Portability:** To request a copy of your personal information in an appropriate electronic format when applicable.
- **Right to Damages:** To seek compensation for damages resulting from unlawful or unauthorized processing, subject to applicable law.
- **Right to File a Complaint:** To lodge a complaint with the National Privacy Commission when you believe your privacy rights have been violated.

To exercise these rights, contact us using the contact information in Section 11.

We may request reasonable information to verify your identity before processing a privacy-related request.

We will respond to requests in accordance with applicable legal requirements.

## 8. Cookies and Browser Storage

Co-Split uses browser-based storage for certain application functionality.

In particular, browser session storage is used to temporarily retain workspace identifiers and invitation codes during authentication and navigation.

Authentication session management is handled through Supabase Authentication.

The current application source does not implement advertising cookies, third-party advertising trackers, or a dedicated analytics tracking system.

You may manage or clear browser storage through your browser settings. Clearing stored information may affect your active application session or pending navigation.

## 9. Third-Party Services

Co-Split relies on third-party services to provide its functionality.

These currently include:

- Supabase for authentication and database services.
- Google for account authentication.
- Resend for email delivery.

These services have their own privacy policies and data processing practices.

Information processed by these providers may be subject to their respective terms and policies.

We encourage users to review the applicable third-party privacy policies.

The specific hosting and data-storage regions configured for these services are not identified in this Privacy Policy. Their applicable processing locations should be verified against the active service configurations.

## 10. Children's Privacy

Co-Split is not specifically designed for children, and we do not intentionally request information from children as a separate application feature.

If we become aware that personal information has been collected in circumstances that violate applicable children's privacy requirements, we will take appropriate action in accordance with applicable law.

Parents or legal guardians who have concerns regarding a child's personal information may contact us using the details below.

## 11. Contact Information

If you have questions, concerns, or requests relating to this Privacy Policy or the processing of your personal information, you may contact us through:

**Application:** Co-Split  
**Website:** [https://www.cosplit.site](https://www.cosplit.site)  
**Privacy and Support Email:** [cosplit.site@gmail.com](mailto:cosplit.site@gmail.com)

For privacy-related requests, please provide sufficient information for us to verify your identity and understand your request.

## 12. Changes to This Privacy Policy

We may update this Privacy Policy when changes are made to Co-Split's functionality, data processing practices, third-party services, or applicable legal requirements.

When this Privacy Policy is updated, we will revise the "Last Updated" date.

Material changes may also be communicated through the application or other appropriate communication channels.

We encourage users to review this Privacy Policy periodically.

---

**Co-Split**  
[https://www.cosplit.site](https://www.cosplit.site)
