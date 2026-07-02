---
layout: page
title: the value of the mortgage refinancing option
permalink: /data/mortgage-option-value/
description: Replication package for "How Much Is the Option to Refinance Worth, and Who Captures the Realized Gains?"
nav: false
---

**How Much Is the Option to Refinance Worth, and Who Captures the Realized Gains?**
Adam Looney · working paper, 2026

A 30-year fixed-rate mortgage is cheaper than its contract rate suggests: the borrower can refinance into a cheaper loan if rates fall and keep the old one if they rise. This paper prices that option from the borrower's side in every month since 1990, compares it with what the market charges for the same prepayment risk, and measures the gains households actually realized by exercising it as rates fell — and who captured them. The option lowers expected financing cost by about a third of a percentage point on average, and by more than a full point when rates are high; exercising it delivered households roughly **\$3.3 trillion** in present-value gains over 1990–2024, a windfall recorded in no income or wealth statistic and shared unevenly across income and race.

**Paper:** [PDF](/assets/pdf/wp/looney-mortgage-option-value.pdf)
&nbsp;·&nbsp; **Replication code:** [github.com/adamlooney/refinancing-option-replication](https://github.com/adamlooney/refinancing-option-replication)

<!-- TODO: add the Zenodo DOI once minted from the v1.0.0 release. -->

## What's included

- All analysis code (Python), organized as a tiered pipeline.
- `reproduce.py` — a single command that runs everything available end to end and assembles the paper's figures, tables, and numbers.
- `REPLICATION.md` — full instructions.
- The committed numbers manifest, so the paper's exact figures are reproducible even without the restricted inputs below.

No restricted or licensed data is redistributed.

## Data availability

The analysis is organized in three tiers by the data each part needs.

| Tier | Reproduces | Data | How to obtain |
| :--- | :--- | :--- | :--- |
| **A** | The option-value series (ex-ante results) | Federal Reserve (FRED) interest-rate series | Fetched automatically with a free [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html). |
| **B** | The realized gains and their distribution | Survey of Consumer Finances; Freddie Mac loan-level data; pre-2018 HMDA | Free, downloaded by the user. Post-2018 HMDA is automatic. |
| **C** | The comparison with the market's option price | Bloomberg current-coupon MBS yield and OAS | Proprietary (Bloomberg Terminal); cannot be redistributed. |

Tier A runs start to finish with nothing but the free FRED key. Tiers B and C run only if you supply their inputs; otherwise those stages skip themselves and the paper still compiles from the packaged numbers. Full acquisition instructions are in `REPLICATION.md`.

## Running it

```bash
python -m pip install -r requirements.txt
cp .env.example .env          # then add your free FRED API key
python reproduce.py           # runs everything available, builds the paper
python reproduce.py --list-data      # shows the data map and what is present
```

## Citation

```bibtex
@unpublished{looney2026refi,
  author = {Looney, Adam},
  title  = {How Much Is the Option to Refinance Worth, and Who
            Captures the Realized Gains?},
  year   = {2026},
  note   = {Working paper, University of Utah and the
            Brookings Institution},
  url    = {https://www.adamlooney.com/data/mortgage-option-value}
}
```
