---
title: Legal Document Processor
term: spring-2025
team:
  [
    Evans Chun,
    Elissa Martial,
    Will Macdonald,
    Nikhil Murthy,
    Arian Mirzamaani,
    Dylan Chen,
  ]
summary: >-
  Summarizes legal PDFs extractively (BERT with MMR) or abstractively (T5), with
  optional legal entity extraction.
images: [./1.webp, ./2.webp, ./3.webp]
---

An AI-powered legal document summarizer aimed at corporate law firms, legal aid
clinics, and government agencies that need to quickly digest long PDFs. Users
upload a contract, brief, or judgment and choose between an extractive or
abstractive summary, with optional named-entity extraction for legally relevant
entities.

## How it was built

Extracts text from PDFs with PyMuPDF, then offers two summarization paths: an
extractive pipeline that embeds sentences with BERT and selects them via Maximal
Marginal Relevance (MMR) to balance relevance against redundancy, and an
abstractive pipeline using Google's T5-small for paraphrased summaries. spaCy
(en_core_web_sm) handles legal NER, and Gradio provides the interactive web UI.
