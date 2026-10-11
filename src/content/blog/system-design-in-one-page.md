---
title: 'System design in one page'
description: 'After three weeks of practice problems, the whole subject reduces to a few questions and a few ladders.'
pubDate: 2026-10-11
tags: ['system-design']
---

After three weeks of system design practice, the problems have stopped looking different from each other. A URL shortener, a news feed, a click counter and a rate limiter are the same few decisions in a different order. This is my current map of the subject. It is a learner's summary, not a claim of experience at scale.

## What the subject is

System design is deciding **where state lives, who is allowed to change it, and what happens when something fails**, with numbers deciding between the options.

Everything else is detail on top of those three questions.

## One process

Every problem goes through the same steps:

1. What must users be able to do, and what is out of scope.
2. What qualities matter, each with a number: scale, latency, consistency or availability.
3. The nouns in the system and the interface between client and server.
4. The simplest design that works.
5. The two or three places where that design breaks, and what to change there.

The first four steps are almost mechanical. The fifth is where the thinking is.

## Four ladders

Most of step five is climbing one of four ladders. The rule on each is the same: start at the bottom, and move up only when a number says the current rung is not enough.

**Reads are too slow or too many.** Fix the query and its index, then add read replicas, then a cache, then a CDN. Each rung trades freshness for speed.

**Writes are too many.** Batch them, then put a queue in front, then partition the data, then change to a storage engine built for appending. Each rung trades simplicity, and usually some query flexibility, for throughput.

**Two things must not both happen.** Make the check and the change a single atomic statement, then let a constraint enforce it, then use a lock, and across machines add an idempotency key. Each rung is more expensive and more fragile than the one below.

**The work takes longer than a request.** Accept it, return immediately, do it in a worker, record progress, and let the client ask or be told. Once steps depend on each other, add explicit states and a way to resume.

## Three facts that shape everything

**A transaction ends at the edge of one database.** Across services there is no rollback. What replaces it is a recorded state for each step, handlers that are safe to repeat, and a compensating action for when repeating cannot help.

**Anything sent over a network may arrive twice, late, or never.** So every important operation needs a timeout, a retry policy with backoff, and a way to recognise a repeat.

**Averages hide the hard part.** One celebrity account, one viral post or one popular advert breaks a design that handles the average comfortably. Ask where the hot spot is.

## The trade-offs that keep coming back

- **Consistency or availability**, decided per feature. Selling the last ticket needs one answer. Showing a like count does not.
- **Fresh or fast.** Every cache is a decision about how stale is acceptable.
- **Simple or scalable.** An internal tool for five thousand people needs one database and a backup, not a message bus.

There is rarely a correct answer. There is a default, a reason to leave it, and the price of leaving.

## What I would tell myself at the start

Know the default for each situation and say it first. Then say what would make you move off it, and what that costs. Use a number to decide. Most of what looks like deep knowledge in this subject is that habit applied consistently.
