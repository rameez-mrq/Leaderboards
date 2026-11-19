# Final submission

Your final grade comes from a single, separate grading run after the deadline. It isn't the score on the live leaderboard.

## What is graded

- **Your team's last commit on `main` before the deadline.** The deadline will be announced on the course page.
- It's graded on **topics you haven't been scored on**, with **hidden relevance judgements**. Expect your final score to differ from your leaderboard score: different topics vary in difficulty.
- The grader uses the same commands, limits and scoring script as the leaderboard (see the [Student Guide](/guide)). The topic numbers in the topics file it gives your program are changed, so your system must work from each topic's text alone.

## There is nothing extra to submit

Keep pushing to `main` as usual. There are no files to add and no forms to fill in.

## At the deadline

1. **Your repository becomes read-only.** You can still view and clone it, but not push.
2. The course team runs final grading on every team's last commit before the deadline.
3. On that commit, the **"CS7IS3 grader"** check shows **"Final submission received"**. No scores are shown.
4. Results are published later through the usual course channels.

## Before the deadline

- [ ] The grader check on your **latest commit on `main`** is green, with a MAP on the leaderboard.
- [ ] `./run-local.sh` works from a fresh clone (only the dataset added).
- [ ] Indexing and searching fit comfortably within the limits (20 and 5 minutes).
- [ ] Your system reads paths and topics from the command line. Nothing is hard-coded to topic numbers.
- [ ] No relevance judgements, document-ID lists, datasets, indexes or run files are committed.

## If your final run fails

If your final commit fails to build or run in the final grading, the course team will contact your team. You may be allowed **one supervised resubmission**: make only the minimal fix needed, and explain it precisely in the commit message.

## Academic integrity

Using relevance judgements in any form (the part-1 file, the public TREC judgements, or results copied from them) scores **zero**. The final grading includes checks for this, and the code of top-scoring teams is reviewed.

## Contact

Rameez Qureshi, moquresh@tcd.ie
