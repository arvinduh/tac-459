---
title: Runway Incursion Analysis
term: spring-2025
team:
  [
    Christopher Kuzion,
    Anisha Reddy,
    Andrew Levy,
    Hannah Bogen,
    Rianna Herzlinger,
    Tommaso Morini Bianzino,
    Andre Rodrigues,
    Souheil Moudarres,
  ]
summary: >-
  Topic modeling of NASA ASRS runway incursion reports to surface contributing
  factors, with an interactive incident dashboard.
images: [./1.webp, ./2.webp, ./3.webp]
---

An NLP-driven aviation safety project that automates the analysis of runway
incursion narratives from NASA's ASRS database, surfacing recurring human,
procedural, and environmental contributing factors and tracking how they evolve
over time. Includes an interactive dashboard for filtering incident data by
state and date range.

## How it was built

Preprocesses ASRS narratives by normalizing aviation-specific jargon (FAA/NBAA
abbreviations, ICAO and IATA airport codes), then applies two unsupervised topic
models — LDA via gensim and BERTopic with sentence-transformers, UMAP, and
HDBSCAN — and benchmarks the resulting clusters against hand-coded human-factor
categories.
