# PropertyPulse AI — Requirements

An AI-driven real estate opportunity engine that analyzes properties to provide investors with actionable insights and automation tools.

This is the source of truth for what you are building. Your Claude Code prompts
point here. If you sharpen a requirement, edit it — your version is the real one.

| Kind | Meaning |
|---|---|
| Functional | something the system does |
| Safety | a guardrail, with a check that enforces it |
| Reliability | how it behaves when something fails |
| Constraint | a technology or vendor you must use — context, not a task |

## Action Recommendation

### REQ-004 — Functional · must

The system must generate a recommended action for each property based on its Opportunity Score.

Fulfilled by: STORY-002

## AI Agents

### REQ-006 — Functional · must

The system must include a Research Agent to gather property history, comparable properties, and neighborhood trends.

Fulfilled by: STORY-004

### REQ-007 — Functional · must

The system must include a Deal Analyst to calculate ARV, rehab assumptions, and potential returns.

Fulfilled by: STORY-005

### REQ-008 — Functional · must

The system must include an Outreach Agent to generate communication materials for contacting property owners.

Fulfilled by: STORY-006

### REQ-009 — Functional · must

The system must include a Negotiation Agent to suggest offers and negotiation strategies.

Fulfilled by: STORY-007

### REQ-010 — Functional · must

The system must include a Due Diligence Agent to create inspection checklists and identify potential issues.

Fulfilled by: STORY-012

### REQ-011 — Functional · must

The system must include a Disposition Agent to suggest strategies for wholesaling, renting, or flipping properties.

Fulfilled by: STORY-013

## AI Workspace

### REQ-005 — Functional · must

The system must create an AI workspace for properties when a user selects 'Work This Deal'.

Fulfilled by: STORY-003

## Business Model

### REQ-017 — Non-functional · should

The system must monetize through investor subscriptions and transaction-based fees.

_Not yet fulfilled by any story._

## Image Recognition

### REQ-014 — Functional · must

The system must support image recognition to identify properties from user-uploaded photos.

Fulfilled by: STORY-009

## Monetization

### REQ-018 — Functional · should

The system must allow users to purchase detailed Opportunity Reports for individual properties.

Fulfilled by: STORY-011

## Opportunity Explanation

### REQ-012 — Functional · must

The system must provide a 'Why Now?' explanation for each property to justify its current opportunity status.

Fulfilled by: STORY-014

## Opportunity Feed

### REQ-013 — Functional · must

The system must allow users to view a 'Top 20 Opportunities This Week' list based on their input criteria.

Fulfilled by: STORY-008

## Property Analysis

### REQ-002 — Functional · must

The system must continuously analyze properties and assign an Opportunity Score from 0–100.

Fulfilled by: STORY-001

### REQ-003 — Functional · must

The system must provide an AI Assessment for each property, detailing potential acquisition strategies.

Fulfilled by: STORY-002

## Trust and Safety

### REQ-015 — Safety · must

The system must flag uncertain opportunities for human review.

Fulfilled by: STORY-010

### REQ-016 — Safety · must

The system must provide a clear rationale for decisions made in property recommendations.

Fulfilled by: STORY-015

## User Input

### REQ-001 — Functional · must

The system must allow users to select a city, ZIP code, neighborhood, or investment strategy for property analysis.

Fulfilled by: STORY-001
