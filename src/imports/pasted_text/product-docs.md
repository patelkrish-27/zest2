Absolutely. For this product, I’d make the documentation itself part of the product architecture. The files should be detailed enough that a coding agent can read them and implement the website without making major design decisions on its own.

Below is a strong **V1 documentation set** for the website.

---

## `theme.md`

# Theme Specification

## Product

**Name:** Blueprint

**Purpose:**
Blueprint is a structured project-planning tool designed for hackathons and rapid software development.

The product helps users move from:

`Problem Statement → Product Definition → Design → Architecture → Development Blueprint`

The application does not use its own AI model. Instead, it generates a carefully structured prompt that the user copies into their preferred AI system. The user then brings the AI response back into Blueprint, where it is parsed, stored, and converted into a downloadable project-planning package.

---

# Design Philosophy

The interface should communicate:

* Precision
* Structure
* Confidence
* Technical sophistication
* Minimalism
* Focus
* Engineering discipline

The website should feel like a **developer tool**, not a generic SaaS dashboard.

The visual language should be:

> Black + white + grayscale + typography + borders + spacing.

Avoid unnecessary decoration.

---

# Visual Direction

Primary aesthetic:

**Monochrome Editorial Developer Tool**

References in spirit:

* Developer tooling
* Modern SaaS infrastructure products
* Editorial typography
* Terminal interfaces
* Architecture diagrams
* Engineering documentation

Do not copy another product's design directly.

---

# Core Characteristics

## 1. Monochrome

The entire product uses grayscale.

No permanent colorful accents should be required for the core interface.

Status colors may be introduced later if necessary, but V1 should remain monochromatic.

---

## 2. Typography First

Large typography should communicate hierarchy.

Hero headings can be extremely large.

Example:

> THE PLANNING LAYER
> BETWEEN IDEA & CODE.

Typography should feel intentional rather than decorative.

---

## 3. Thin Borders

Cards should primarily be separated using:

* 1px borders
* Background contrast
* Spacing

Avoid heavy shadows.

---

## 4. Large Negative Space

The UI should breathe.

Do not fill every available area.

Whitespace is an important part of the design system.

---

## 5. Sharp but Soft

Use relatively small corner radii.

Recommended:

* Inputs: 6–8px
* Buttons: 6px
* Cards: 8–12px
* Large containers: 12–16px

Avoid highly rounded "pill everything" interfaces.

---

# Motion Philosophy

Animation should be subtle and purposeful.

Use animation for:

* Page transitions
* Step transitions
* Progress changes
* Hover states
* Expanding sections
* Validation feedback
* Copy confirmation
* ZIP generation feedback

Avoid:

* Constant floating elements
* Excessive parallax
* Distracting background animations
* Long animations

Default duration:

* Micro interaction: 120–180ms
* Standard transition: 200–300ms
* Page transition: 300–450ms

Use reduced-motion preferences.

---

# Layout Philosophy

Desktop:

`1440px` design target.

Maximum content width:

`1280–1344px`

Main content should generally be centered.

Planner screens use:

```text
┌──────────────┬─────────────────────────────┐
│              │                             │
│   STEPS      │       CONTENT               │
│              │                             │
│              │                             │
└──────────────┴─────────────────────────────┘
```

Sidebar width:

Approximately `280–320px`.

---

# Responsive Philosophy

Desktop:

* Sidebar visible
* Large content area
* Two-column layouts where appropriate

Tablet:

* Sidebar becomes compact
* Content width reduces
* Cards may become single-column

Mobile:

* Sidebar becomes top progress navigation
* One-column layout
* Buttons become full-width where appropriate
* Large typography scales down
* Textareas remain comfortable to use

Never allow horizontal scrolling for normal application content.

---

# Product Personality

Blueprint should feel:

**Calm. Serious. Technical. Focused. Precise.**

It should not feel:

* childish
* overly colorful
* playful
* corporate-heavy
* AI-gimmicky
* overly futuristic

The user should feel:

> "I am preparing this project properly."

---

## `colors.md`

# Color System

Blueprint uses a monochromatic color system.

The color system should remain intentionally small.

---

# Core Colors

## Black

```text
#000000
```

Use for:

* Primary dark backgrounds
* Strong contrast
* Hero sections when required

---

## Near Black

```text
#090909
```

Use for:

* Application background
* Main dark surfaces

---

## Surface 1

```text
#111111
```

Use for:

* Cards
* Sidebars
* Elevated sections

---

## Surface 2

```text
#181818
```

Use for:

* Secondary cards
* Input backgrounds
* Hover backgrounds

---

## Surface 3

```text
#222222
```

Use for:

* Active elements
* Strong separators

---

# Gray Scale

```text
#333333
#444444
#555555
#666666
#777777
#888888
#999999
#AAAAAA
#BBBBBB
#CCCCCC
#DDDDDD
#EEEEEE
```

---

# White

```text
#FFFFFF
```

Primary light-mode surface and highest-contrast text.

---

# Dark Theme Text

Primary:

```text
#F5F5F5
```

Secondary:

```text
#A3A3A3
```

Muted:

```text
#737373
```

Disabled:

```text
#525252
```

---

# Light Theme

If a light interface is required:

Background:

```text
#FAFAFA
```

Surface:

```text
#FFFFFF
```

Primary text:

```text
#111111
```

Secondary text:

```text
#666666
```

Muted text:

```text
#999999
```

Border:

```text
#E5E5E5
```

---

# Borders

Default:

```text
#262626
```

Strong:

```text
#3A3A3A
```

Subtle:

```text
#1A1A1A
```

Light-mode border:

```text
#E5E5E5
```

---

# Semantic States

V1 should stay monochromatic wherever possible.

Success:

```text
#FFFFFF
```

with an icon/checkmark.

Warning:

```text
#BDBDBD
```

Error:

```text
#FFFFFF
```

with stronger border treatment.

Do not introduce bright red/green/blue UI unless accessibility or usability requires it.

---

# Color Usage Rule

Do not use color merely for decoration.

Color should communicate:

* hierarchy
* state
* interaction
* readability

The primary visual hierarchy should come from:

1. Typography
2. Spacing
3. Contrast
4. Borders
5. Color

---

## `flow.md`

# Product Flow

## High-Level Flow

```text
Landing
   ↓
Start Planning
   ↓
Project Setup
   ↓
Product Definition
   ↓
UX & User Flow
   ↓
Design System
   ↓
Frontend
   ↓
Backend
   ↓
Database
   ↓
Architecture
   ↓
Finalize
   ↓
Generate AI Prompt
   ↓
Copy Prompt
   ↓
User Uses External AI
   ↓
Paste AI Response
   ↓
Parse Response
   ↓
Review Blueprint
   ↓
Download ZIP
```

---

# Phase 01 — Project

Collect:

* Problem statement
* Project name
* Project type
* Optional tagline

Project types:

* Website
* Web application
* Mobile application
* Desktop application
* Browser extension
* API/backend
* Other

---

# Phase 02 — Product

Collect:

* Target users
* Primary problem
* Proposed solution
* Value proposition
* Primary user goal
* MVP scope
* Nice-to-have features
* Explicit non-goals
* Project constraints
* Hackathon judging requirements

---

# Phase 03 — UX

Collect:

* User journey
* Main user flow
* Authentication requirements
* Navigation model
* Important states
* Empty states
* Loading states
* Error states
* Success states

---

# Phase 04 — Design

Collect:

* Visual style
* Theme
* Color system
* Typography
* UI library
* Icon library
* Animation library
* Animation intensity
* Border radius
* Shadows
* Responsive strategy
* Accessibility requirements

---

# Phase 05 — Frontend

Collect:

* Framework
* Language
* CSS solution
* UI library
* Component architecture
* State management
* Data fetching
* Forms
* Validation
* Routing
* SEO
* Performance requirements

---

# Phase 06 — Backend

Collect:

* Runtime
* Framework
* API architecture
* Authentication
* Authorization
* Validation
* Error handling
* Rate limiting
* External services
* File storage
* Background jobs

---

# Phase 07 — Database

Collect:

* Database provider
* Tables
* Fields
* Primary keys
* Foreign keys
* Relationships
* Indexes
* Constraints
* Required seed data

---

# Phase 08 — Architecture

Generate:

* System architecture
* Folder structure
* Feature architecture
* API structure
* Data flow
* Dependency map
* Environment variables
* Development rules

---

# Phase 09 — Finalize

Calculate:

* Planning completeness
* Missing decisions
* Contradictions
* Undefined requirements
* Required documents

Then allow:

```text
Generate Planning Prompt
```

---

# External AI Flow

Blueprint does not call an AI API.

Instead:

```text
Blueprint
   ↓
Generate structured prompt
   ↓
Copy
   ↓
ChatGPT / Claude / Gemini / Other
   ↓
AI generates markdown package
   ↓
User copies response
   ↓
Blueprint
   ↓
Parse
   ↓
Store
```

---

# Response Validation

Blueprint should validate:

* Required files
* File names
* File boundaries
* Markdown structure
* Empty documents
* Missing documents

If valid:

```text
Blueprint ready.
```

If invalid:

```text
8 / 12 documents detected.

Missing:
- DATABASE.md
- TESTING.md
- SECURITY.md
- DEPLOYMENT.md

[Generate missing-files prompt]
```

---

# Final Flow

The final state is:

```text
PROJECT
   +
USER DECISIONS
   +
AI GENERATED DOCUMENTATION
   =
PROJECT BLUEPRINT
```

The blueprint can then be downloaded as a ZIP.

---

## `pages.md`

# Pages

## 01 — Landing

Route:

```text
/
```

Purpose:

Introduce Blueprint and start the planning process.

Sections:

1. Navbar
2. Hero
3. Workflow preview
4. Why planning matters
5. Planning phases
6. Final CTA
7. Footer

Primary CTA:

```text
Start planning
```

---

# 02 — Planner

Route:

```text
/plan
```

Main application shell.

Layout:

```text
Sidebar
+
Planning content
```

Sidebar contains all phases.

---

# 03 — Project Setup

Route:

```text
/plan/project
```

Fields:

* Problem statement
* Project name
* Tagline
* Project type

---

# 04 — Product

Route:

```text
/plan/product
```

Fields:

* Target users
* Problem
* Solution
* Value proposition
* Primary goal
* MVP
* Nice-to-have
* Non-goals
* Constraints

---

# 05 — UX

Route:

```text
/plan/ux
```

Fields:

* User journey
* Navigation
* Authentication
* User flow
* UX states

---

# 06 — Design

Route:

```text
/plan/design
```

Sections:

* Visual style
* Color
* Typography
* UI library
* Icons
* Animation
* Responsive design
* Accessibility

---

# 07 — Frontend

Route:

```text
/plan/frontend
```

Sections:

* Framework
* Language
* Styling
* UI library
* Component architecture
* State management
* Data fetching
* Forms
* Validation
* Routing

---

# 08 — Backend

Route:

```text
/plan/backend
```

Sections:

* Runtime
* Framework
* API
* Authentication
* Authorization
* Services
* Validation
* Security

---

# 09 — Database

Route:

```text
/plan/database
```

Sections:

* Provider
* Tables
* Columns
* Relationships
* Indexes
* Constraints

---

# 10 — Architecture

Route:

```text
/plan/architecture
```

Sections:

* System architecture
* Folder structure
* Data flow
* API structure
* Environment variables
* Development rules

---

# 11 — Review

Route:

```text
/plan/review
```

Shows:

* Readiness score
* Completed phases
* Missing decisions
* Project summary
* Stack summary
* Page summary
* Feature summary

---

# 12 — AI Prompt

Route:

```text
/plan/prompt
```

Shows:

* Generated prompt
* Prompt length
* Required output files
* Copy button

Actions:

```text
Copy prompt
```

---

# 13 — AI Response

Route:

```text
/plan/response
```

User pastes the response generated by their external AI.

Actions:

```text
Process response
```

---

# 14 — Blueprint

Route:

```text
/blueprint/:projectId
```

Shows all generated Markdown documents.

Features:

* File browser
* Markdown preview
* Search
* Copy
* Download

---

# 15 — Download

No dedicated page is required.

Download should happen from the Blueprint page.

Generated ZIP:

```text
project-blueprint.zip
```

---

# 16 — Settings

Route:

```text
/settings
```

Future V1.1/V2 page.

Potential settings:

* Theme
* Default stack
* Preferred AI
* Export preferences
* Account

---

## `components.md`

# Components

## Application Shell

### AppShell

Contains:

* Sidebar
* Main content
* Header
* Progress indicator

---

## Navigation

### Navbar

Contains:

* Logo
* Navigation links
* Start planning CTA

### PlannerSidebar

Contains:

* Project name
* Readiness percentage
* Phase list
* Current phase
* Completed phases

### StepItem

States:

* Default
* Current
* Completed
* Locked
* Warning

---

# Buttons

### Button

Variants:

```text
Primary
Secondary
Ghost
Danger
```

Sizes:

```text
Small
Medium
Large
```

States:

```text
Default
Hover
Active
Focus
Disabled
Loading
```

---

# Form Components

### TextInput

Used for:

* Project name
* Tagline
* Short answers

States:

* Default
* Focus
* Filled
* Error
* Disabled

---

### Textarea

Used for:

* Problem statement
* Product description
* Requirements
* Architecture notes

Should support:

* Character count
* Resize
* Error
* Placeholder
* Autosave

---

### Select

Used for:

* Framework
* Database
* UI library
* AI provider

---

### MultiSelect

Used when multiple technologies/options are allowed.

---

### RadioGroup

Used for mutually exclusive decisions.

---

### Checkbox

Used for feature selections.

---

### Toggle

Used for optional features.

---

# Planning Components

### QuestionCard

Contains:

```text
Question
Description
Input
Helper text
```

---

### OptionCard

Selectable card used for:

* Project type
* UI libraries
* Frameworks
* Animation styles
* Design styles

States:

```text
Default
Hover
Selected
Disabled
```

---

### SectionHeader

Contains:

```text
Eyebrow
Title
Description
```

---

### PlanningSection

Groups related questions.

---

### ProgressBar

Displays planning completion.

---

### ReadinessScore

Displays:

```text
96%
```

plus visual progress.

---

### CompletionChecklist

Displays completed planning areas.

---

# Product Architecture Components

### PageBuilder

Allows users to define project pages.

Each page:

```text
Name
Purpose
Route
Access
Priority
```

---

### ComponentBuilder

Allows users to define reusable components.

Fields:

```text
Name
Purpose
Used by
Variants
```

---

### FeatureBuilder

Defines:

```text
Feature
Description
Priority
Dependencies
User story
```

---

### DatabaseTableBuilder

Allows users to define tables.

Fields:

```text
Table name
Columns
Type
Required
Default
Relations
```

---

### RelationshipEditor

Displays relationships between database tables.

---

# AI Components

### PromptPreview

Displays generated prompt.

Features:

* Syntax-like formatting
* Copy button
* Expand/collapse
* Character count

---

### CopyButton

States:

```text
Copy
Copied
Error
```

---

### AIProviderCard

Displays:

* ChatGPT
* Claude
* Gemini
* Other

This is informational only.

Blueprint does not directly communicate with these services.

---

### ResponseInput

Large textarea for pasting external AI response.

---

### ResponseValidator

Displays:

```text
Detected files
Missing files
Invalid files
Valid files
```

---

# Blueprint Components

### FileTree

Displays generated Markdown files.

---

### FileItem

States:

```text
Default
Selected
Missing
Generated
```

---

### MarkdownViewer

Displays document content.

---

### DownloadButton

Generates the ZIP package.

---

# Feedback

### Toast

Used for:

* Copied
* Saved
* Blueprint generated
* Download prepared
* Error

---

### EmptyState

Used when no content exists.

---

### ErrorState

Used when something fails.

---

### LoadingState

Used while:

* Parsing response
* Generating ZIP
* Saving project

---

### Skeleton

Used for asynchronous UI loading.

---

# Component Rules

Every reusable component should:

* Have predictable variants
* Support keyboard navigation
* Have accessible labels
* Have visible focus states
* Support dark/light surfaces where applicable
* Avoid unnecessary animation
* Use the global spacing system
* Use the global typography system

---

## `specs.md`

# Product Specifications

## Core Principle

Blueprint is a **planning and documentation system**, not an AI system.

The application must not depend on an AI API to perform its core functionality.

---

# Data Ownership

User planning data belongs to the user's project.

The system should store:

```text
Project
Planning Answers
Generated Prompt
External AI Response
Parsed Markdown Files
Blueprint Metadata
```

---

# Project Object

```text
id
name
tagline
type
problemStatement
status
createdAt
updatedAt
```

---

# Planning Object

```text
product
ux
design
frontend
backend
database
architecture
```

---

# External AI Response

```text
id
projectId
rawResponse
provider
createdAt
validationStatus
```

`provider` is optional.

The user may choose not to specify which AI they used.

---

# Generated Document

```text
id
projectId
filename
content
category
createdAt
updatedAt
```

---

# Required Documents

Minimum V1 package:

```text
PROJECT_CONTEXT.md
PRODUCT_REQUIREMENTS.md
USER_FLOWS.md
DESIGN_SYSTEM.md
FRONTEND_ARCHITECTURE.md
BACKEND_ARCHITECTURE.md
DATABASE.md
PAGES.md
COMPONENTS.md
FEATURES.md
API.md
DEVELOPMENT_RULES.md
TESTING.md
SECURITY.md
DEPLOYMENT.md
MASTER_IMPLEMENTATION_PROMPT.md
```

---

# Response Contract

The external AI should return files using:

```text
--- FILE: filename.md ---

content

--- END FILE ---
```

Blueprint parses these boundaries.

---

# Parser Requirements

Parser must:

1. Find file markers
2. Extract filename
3. Extract content
4. Validate filename
5. Remove duplicate files
6. Detect missing required files
7. Preserve Markdown
8. Store original response

---

# ZIP Requirements

ZIP structure:

```text
project-blueprint/
├── PROJECT_CONTEXT.md
├── PRODUCT_REQUIREMENTS.md
├── USER_FLOWS.md
├── DESIGN_SYSTEM.md
├── FRONTEND/
│   └── FRONTEND_ARCHITECTURE.md
├── BACKEND/
│   ├── BACKEND_ARCHITECTURE.md
│   └── API.md
├── DATABASE/
│   └── DATABASE.md
├── PRODUCT/
│   ├── PAGES.md
│   ├── COMPONENTS.md
│   └── FEATURES.md
├── DEVELOPMENT/
│   ├── DEVELOPMENT_RULES.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
└── PROMPTS/
    └── MASTER_IMPLEMENTATION_PROMPT.md
```

---

# Autosave

Planning answers should autosave.

Recommended behavior:

* Save on field blur
* Save before navigation
* Save before page unload when possible

Never lose completed planning answers because the user navigated backward.

---

# Navigation

Users should be able to:

* Move forward
* Move backward
* Jump to completed phases
* Return to unfinished phases

Unfinished phases should not permanently block navigation.

---

# Validation

Validation should happen at two levels.

### Field Validation

Examples:

```text
Project name required
Problem statement required
Project type required
```

### Planning Validation

Detect:

* Missing decisions
* Contradictions
* Undefined stack
* Missing pages
* Missing authentication decision
* Missing database decision
* Missing deployment decision

---

# Readiness Score

The score should be calculated from planning completeness.

Example:

```text
Project       10%
Product       15%
UX            10%
Design        15%
Frontend      15%
Backend       10%
Database      10%
Architecture  15%
```

Total:

```text
100%
```

The exact weighting can be changed later.

---

# Accessibility

Minimum requirements:

* Keyboard navigation
* Visible focus
* Semantic HTML
* Labels for all controls
* Screen-reader-friendly navigation
* Sufficient contrast
* Reduced motion support
* No interaction dependent solely on color

---

# Performance

The planner should feel instant.

Avoid unnecessary:

* API requests
* Re-renders
* Large client-side bundles
* Animation-heavy effects

Markdown parsing should be lightweight.

ZIP generation should happen asynchronously if files become large.

---

# Security

Never trust pasted AI output.

Sanitize:

* Filenames
* Markdown rendering
* HTML
* Script tags
* Embedded content

Prevent:

* Path traversal
* Arbitrary file creation
* Stored XSS
* Unsafe HTML rendering

Never execute content from generated Markdown.

---

# Error Recovery

Every major operation needs a recoverable error state.

Examples:

```text
Failed to save project
[Retry]

Failed to process AI response
[Try again]

Some documents are missing
[Generate missing-files prompt]

ZIP generation failed
[Retry download]
```

---

# Offline / Draft Behavior

If practical, retain unsaved form state locally.

The user should not lose a 30-minute planning session because of a temporary connection failure.

---

# No AI API Requirement

The following must work without any AI provider integration:

* Creating project
* Planning
* Selecting technologies
* Defining pages
* Defining components
* Defining database
* Generating prompt
* Copying prompt
* Pasting AI response
* Parsing response
* Viewing Markdown
* Downloading ZIP

---

## `actions.md`

# Actions

## Navigation Actions

### Start Planning

```text
startPlanning()
```

Creates a new project and navigates to:

```text
/plan/project
```

---

### Continue

```text
continueToNextStep()
```

Validates current phase and moves to the next phase.

---

### Back

```text
goToPreviousStep()
```

Moves to the previous phase.

---

### Save Draft

```text
saveProjectDraft()
```

Persists current planning state.

---

# Project Actions

### Create Project

```text
createProject()
```

Creates a project record.

---

### Update Project

```text
updateProject()
```

Updates project metadata.

---

### Delete Project

```text
deleteProject()
```

Deletes project and associated generated documents.

Should require confirmation.

---

# Planning Actions

### Save Answer

```text
savePlanningAnswer()
```

Stores an individual planning answer.

---

### Select Option

```text
selectPlanningOption()
```

Updates a single-choice planning field.

---

### Toggle Option

```text
togglePlanningOption()
```

Adds/removes an option from a multi-select field.

---

### Add Page

```text
addPage()
```

Creates a project page definition.

---

### Edit Page

```text
updatePage()
```

Updates page definition.

---

### Remove Page

```text
removePage()
```

Removes page definition.

---

### Add Component

```text
addComponent()
```

Creates reusable component definition.

---

### Add Feature

```text
addFeature()
```

Creates feature definition.

---

### Add Database Table

```text
addDatabaseTable()
```

Creates database table definition.

---

### Add Database Relationship

```text
addDatabaseRelationship()
```

Creates relationship between tables.

---

# Planning Validation

### Validate Phase

```text
validatePhase()
```

Checks required fields.

Returns:

```text
valid
errors[]
warnings[]
```

---

### Calculate Readiness

```text
calculateReadiness()
```

Returns percentage and incomplete sections.

---

### Detect Planning Gaps

```text
detectPlanningGaps()
```

Checks for missing important decisions.

---

# Prompt Actions

### Generate Prompt

```text
generatePlanningPrompt()
```

Uses the user's structured planning data.

It must not call an AI API.

The output is a deterministic prompt template populated with project data.

---

### Copy Prompt

```text
copyPrompt()
```

Copies the generated prompt to the clipboard.

After success:

```text
Copied
```

---

# AI Response Actions

### Paste Response

User pastes external AI output into the response input.

---

### Process Response

```text
processAIResponse()
```

Pipeline:

```text
Raw Response
    ↓
Parse file markers
    ↓
Validate filenames
    ↓
Extract Markdown
    ↓
Detect duplicates
    ↓
Detect missing files
    ↓
Store documents
```

---

### Validate Response

```text
validateAIResponse()
```

Returns:

```text
detectedFiles[]
missingFiles[]
invalidFiles[]
duplicates[]
```

---

### Generate Missing Files Prompt

```text
generateMissingFilesPrompt()
```

Creates a smaller prompt containing only missing documents.

Example:

```text
Generate the following missing documents:

DATABASE.md
TESTING.md
SECURITY.md
```

---

# Blueprint Actions

### Open Document

```text
openDocument()
```

Displays Markdown content.

---

### Copy Document

```text
copyDocument()
```

Copies a Markdown document.

---

### Search Documents

```text
searchDocuments()
```

Searches generated Markdown files.

---

### Download Blueprint

```text
downloadBlueprint()
```

Creates ZIP archive and downloads it.

---

### Regenerate ZIP

```text
regenerateBlueprintZip()
```

Creates a fresh archive from stored documents.

---

# User Feedback Actions

### Show Toast

```text
showToast()
```

Used for lightweight feedback.

---

### Show Error

```text
showError()
```

Displays recoverable errors.

---

### Show Confirmation

```text
showConfirmation()
```

Used before destructive operations.

---

# Keyboard Actions

Recommended shortcuts:

```text
Cmd/Ctrl + Enter
Continue

Cmd/Ctrl + S
Save draft

Esc
Close modal

Cmd/Ctrl + K
Command menu

Cmd/Ctrl + Shift + C
Copy current document
```

Shortcuts must never interfere with normal text editing.

---

# Action Principles

Actions should be:

* predictable
* reversible where possible
* immediately acknowledged
* keyboard accessible
* safe against accidental destructive behavior

Never silently discard user planning data.

---

# I would also add these files

Your original list says **“etc.”**, and for this particular product there are a few files I think are actually essential.

### `typography.md`

Defines the exact type scale, weights, line heights and letter spacing.

### `spacing.md`

Defines the spacing system:

```text
4
8
12
16
20
24
32
40
48
64
80
96
128
```

### `responsive.md`

Defines desktop/tablet/mobile behavior.

### `states.md`

Defines every:

```text
Loading
Empty
Error
Success
Disabled
Selected
Hover
Focus
```

state.

### `prompt-contract.md`

This is **especially important** for your architecture. It defines the exact format your generated prompt asks the external AI to return.

### `markdown-schema.md`

Defines every Markdown file and exactly what sections each document must contain.

### `zip-structure.md`

Defines the final downloadable project structure.

### `data-model.md`

Defines your actual application database/entities.

### `validation.md`

Defines planning validation and AI-response validation.

### `security.md`

Defines how pasted AI output and Markdown are safely handled.

### `README.md`

Explains Blueprint itself and how the generated project blueprint should be used.

The most important relationship is:

```text
theme.md
colors.md
typography.md
spacing.md
responsive.md
        ↓
   DESIGN SYSTEM
        ↓
components.md
        ↓
pages.md
        ↓
flow.md
        ↓
specs.md
        ↓
actions.md
        ↓
prompt-contract.md
        ↓
markdown-schema.md
        ↓
AI RESPONSE
        ↓
PROJECT BLUEPRINT ZIP
```

That gives you a **real product specification**, rather than just a collection of UI notes.
