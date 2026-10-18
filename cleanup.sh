#!/bin/sh
# Run from the repo root AFTER copying the files in this zip. Removes the stray update folders that were
# never meant to live in the repo (they are superseded by this cumulative update).
git rm -r --ignore-unmatch seo-update-wordle-solver seo-update-home-and-anagram home-seo-update \
  5-Letters-Word 5-Letters-Word-seo 5-Letters-Word-optimized five-letter-word-finder
