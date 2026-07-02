---
layout: page
title: smaller families and global absolute poverty
permalink: /data/global-fertility/
description: Replication package for "Smaller Families and the Fall in Global Absolute Poverty"
nav: false
---

**Smaller Families and the Fall in Global Absolute Poverty**
Adam Looney · working paper

The number of people living below the World Bank's \$3.00/day line fell by about 1.5 billion between 1990 and 2019, a decline conventionally credited to economic growth. Because the line divides household consumption by household size, falling fertility raises measured consumption per person mechanically. Transporting the children-per-mother distribution across household surveys for 22 developing countries that were home to 85% of the 1990 poor, the paper finds falling family size lifted about 167 million people over the line — 14% of the combined poverty decline, ranging from 7% (Ghana) to 44% (Mexico).

**Paper:** [PDF](/assets/pdf/wp/looney-global-fertility.pdf)
&nbsp;·&nbsp; **Replication code:** [github.com/adamlooney/global-fertility-poverty](https://github.com/adamlooney/global-fertility-poverty)

The repository contains all code that constructs the World Bank PIP series, ingests and harmonizes each household survey, runs the rank-preserving children transport and the Datt–Ravallion decomposition, and generates every table, figure, and number in the paper. Licensed survey microdata is not redistributed; the repository documents how to obtain each source, including download scripts where a public API exists and request templates where a license is required.

## Citation

```bibtex
@unpublished{looney2026globalfertility,
  author = {Looney, Adam},
  title  = {Smaller Families and the Fall in Global Absolute Poverty},
  year   = {2026},
  note   = {Working paper, University of Utah and the Brookings Institution},
  url    = {https://www.adamlooney.com/data/global-fertility}
}
```
