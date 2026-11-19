# CS7IS3 Assignment 2: Student Guide

Build a Lucene search engine for the TREC "Assignment Two" collection (about 528,000 news and government documents from the Financial Times, FBIS, the Federal Register and the LA Times). Every time you push to your team's repository, your code is built, run and scored automatically, and your score appears on the [live leaderboard](/).

The leaderboard is **practice**: push as often as you like and compete to improve your system. Your **final grade** is decided separately, after the deadline, on topics you haven't been scored on (see [Final submission](/final-grades)).

## 1. Register your team

1. Every member needs a **GitHub account**. Any account works; [create one](https://github.com/signup) if you don't have one.
2. **One person** registers the whole team on the [registration page](/register): a team name, the number of members (3–6), and each member's full name, Trinity email and GitHub username.
3. Your team gets a **private repository**, `ca-assignments/2026-team-<your-team-name>`, created from the starter pack. Each member receives a **GitHub invitation**: accept it from the email or from your [GitHub notifications](https://github.com/notifications).

Made a mistake when registering? Contact the course team rather than registering again.

## 2. Set up your repository

```bash
git clone https://github.com/ca-assignments/2026-team-<your-team-name>.git
cd 2026-team-<your-team-name>
```

Then download the dataset and extract it so that an `Assignment Two/` folder sits in the repository root:

- 📥 [Download the Assignment Two dataset](https://drive.google.com/file/d/17HXFUsKifeCoSobvfgQuNv6ctPz6K0z9/view?usp=sharing)

`Assignment Two/` is in `.gitignore`. **Never commit it**: the grader has its own copy, and large repositories are rejected.

You'll need **Java 17 or newer**, **Maven 3.9+** and **Python 3**.

### What's in the starter pack

| File | Purpose |
|---|---|
| `src/main/java/org/cs7is3/App.java` | Command-line entry point. Already done; don't change the commands |
| `src/main/java/org/cs7is3/Indexer.java` | **Your job:** build the Lucene index |
| `src/main/java/org/cs7is3/Searcher.java` | **Your job:** search every topic and write the run file |
| `pom.xml` | Maven build (Java 17, Lucene 9.9.2). Don't rename the jar or the main class |
| `topics` | The 50 search topics (401–450) |
| `qrels.assignment2.part1` | Relevance judgements for topics 401–425, for checking scores locally |
| `tools/evaluate.py` | The scoring script. The grader uses exactly the same one |
| `tools/check_run.py` | Checks your run file's format |
| `run-local.sh` | Runs everything the grader does, on your machine |

## 3. Develop and test locally

```bash
./run-local.sh                 # build, index, search, check and score
SKIP_INDEX=1 ./run-local.sh    # re-run only the search, reusing the index
```

`run-local.sh` builds the jar, indexes `Assignment Two/`, searches all topics, checks `runs/student.run`, and scores it with the part-1 judgements. **Your local score on topics 401–425 is the same number the leaderboard will show.**

## 4. Push to get on the leaderboard

Push to the **`main`** branch. Pushes to other branches aren't graded, so use branches for experiments.

A **"CS7IS3 grader"** check appears next to your commit on GitHub (the dot, ✓ or ✗ beside the latest commit). Click **Details** to see its result:

- **Grading…** while it runs (usually a few minutes)
- **MAP 0.xxxx** with a table of metrics, and your score on the [leaderboard](/)
- **Failed at build / index / search / check** with the last lines of the error

If you push again before grading starts, only your newest commit is graded. A failed run doesn't remove your previous score from the leaderboard.

### What the grader runs

In a clean environment, with **no network access**:

```bash
mvn clean package
java -jar target/cs7is3-search-1.0.0.jar index  --docs <dataset> --index <index>
java -jar target/cs7is3-search-1.0.0.jar search --index <index> --topics <topics> --output <run file> --numDocs 1000
```

The grader chooses all the paths, and it uses **its own copy of the topics file**. Always read paths from the command-line options, and never rely on specific topic numbers or wording.

### Limits

| Step | Limit |
|---|---|
| Build | 10 minutes |
| Indexing | 20 minutes |
| Searching all topics | 5 minutes |
| Java memory | 8 GB |
| Repository size | 50 MB (no dataset, indexes or run files) |
| Network | None. Maven dependencies for the versions in `pom.xml` are pre-installed; **ask before adding a dependency** |

A simple BM25 indexer takes about a minute on a laptop, so these limits leave plenty of room.

## Run file format

One line per document, at most 1000 per topic, best first:

```
401 Q0 FBIS3-10082 1 12.3456 my-run
```

The columns are: topic number, the literal text `Q0`, the document's `DOCNO`, rank, score and a run tag.

- **Documents are ranked by score**, highest first, as in `trec_eval`. The rank column is ignored.
- **Each document may appear only once per topic.**
- **Every topic needs results.** A topic with no results scores 0.

Check your file before pushing:

```bash
python3 tools/check_run.py runs/student.run
```

## Metrics

The leaderboard ranks teams by **MAP** (mean average precision) and also shows P@5. `tools/evaluate.py` also reports P@10, P@20, P@100, recall, MRR, R-precision and nDCG at several cut-offs.

## Rules

- **Don't use relevance judgements in your system.** That includes the part-1 file and any public TREC judgements. Hard-coding results, reading a qrels file, or tuning against document lists is cheating. The grader rejects repositories containing qrels-style files or long lists of document IDs, and the final code is reviewed.
- **Keep the commands, jar name and main class unchanged.**
- **Only commit source code and small configuration files.** No dataset, indexes or run files.
- **Work only in your own team's repository**, and don't share code between teams.

## Troubleshooting

| Problem | What to check |
|---|---|
| No invitation | Check your [GitHub notifications](https://github.com/notifications) and the email address on your GitHub account. Still nothing? Contact the course team with your team name |
| Fails at build | Run `mvn clean package` locally and make sure `target/cs7is3-search-1.0.0.jar` is created |
| Fails at index | Read the error lines in the check's details. Make sure a single bad document can't stop the run, and watch memory use |
| Fails at check | Look for duplicate documents, missing topics, or lines without 6 columns |
| Rejected by the scan | Remove qrels files, document-ID lists and large files from the repository (and its latest commit) |
| MAP is 0 | Make sure your docnos match `<DOCNO>` exactly, with no spaces, and that topic numbers come from the topics file |
| Not on the leaderboard | Make sure you pushed to `main` and that the grader check passed |

## Contact

Rameez Qureshi, moquresh@tcd.ie
