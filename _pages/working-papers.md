---
layout: page
permalink: /working-papers/
title: working papers
description: Work in progress and unpublished papers.
nav: false
nav_order: 3
noindex: true
sitemap: false
---

<!-- Hidden from the navbar (nav: false) as of September 2026 — the papers are
     not ready to be public. The page still resolves at /working-papers/ so the
     URL can be shared directly; it stays noindex + out of the sitemap. To put it
     back in the navbar, set nav: true. Note that four of these papers are also
     linked from their /data/ landing pages, which ARE indexed. -->

<!-- _pages/working-papers.md -->
<!-- Entries are drawn from _bibliography/working_papers.bib (separate from the
     research page, which reads papers.bib). Update that file to add or edit papers.
     Entries carry hide_date = {true} so no year is displayed; the year field is
     kept in the bib file only to sort newest-first (and file order breaks ties
     within a year). The wp-list class hides the year group headings. -->

<div class="publications wp-list">

{% bibliography -f working_papers %}

</div>
