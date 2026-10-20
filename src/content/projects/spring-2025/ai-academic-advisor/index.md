---
title: AI Academic Advisor
term: spring-2025
team:
  [
    Iliyan Hariyani,
    Fawny Arnyek,
    David Wang,
    Arvin Duh,
    Aum Patel,
    Anna Schwedt,
  ]
summary: >-
  A USC course chatbot that answers questions about classes and builds
  personalized weekly schedules from Schedule of Classes data.
images: [./1.webp, ./2.webp, ./3.webp]
---

A USC-specific chatbot that lets students explore course information through
natural conversation and generates personalized weekly schedules based on their
preferences and constraints, simplifying an otherwise overwhelming
course-selection process across complex prerequisites, GE requirements, and unit
caps.

## How it was built

Implements a modified RAG architecture with a tool-using LLM agent backed by a
custom Cache layer that pulls course data on demand from the USC Schedule of
Classes (SOC) API and falls back to scraping when needed, with chat-history
memory and live schedule updates from the agent's responses.
