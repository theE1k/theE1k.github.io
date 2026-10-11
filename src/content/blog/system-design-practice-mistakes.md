---
title: 'Mistakes I keep making in system design practice'
description: 'Three weeks of practice problems, and the same handful of errors: components in the requirements, totals mistaken for rates, and reaching for a lock first.'
pubDate: 2026-10-11
tags: ['system-design']
---

I have been working through system design problems for about three weeks, mostly following the Hello Interview course: a URL shortener, a news aggregator, an ad click aggregator, a rate limiter, plus deep dives on Redis, Kafka and PostgreSQL. After each session I write down what I got wrong.

Reading the log back, most of the entries are the same few mistakes repeating. This post lists them with the rule I now use for each. The examples are my own wrong answers.

## 1. Putting components in the requirements

Asked for non-functional requirements, I wrote "Redis" and "CDN". I did this on three problems in a row.

A requirement is a quality the system must have, with a number attached. A component is one way to meet it. What fixed it for me was asking "what is this for?" about every line, and using four prompts:

- How big is it? Users, requests per second, data volume.
- How fast must the main action be?
- Where does it need consistency, and where is availability enough?
- What is special about this problem? For a news feed it is freshness.

Functional requirements get the same treatment: three lines that start with "users can", not a description of what the servers do.

## 2. Not saying what is out of scope

I skipped "what we are not building" three times running. Worse, on the URL shortener the interviewer said links cannot be edited, and I added editing back three separate times, in the API and again in the design.

What works: write the whole chain of features first, then circle the part the question is about and name the rest as out of scope.

## 3. Totals mistaken for rates

My estimates were wrong more often than they were right, nearly always the same way.

- 20 million orders a day: I said 30,000 writes per second. It is about 230.
- 500 million redirects a day: I forgot a factor of five.
- 10 million concurrent users at 100,000 connections per server: I said ten servers. It is a hundred.

Three habits that helped:

- Two anchors: one million a day is roughly 12 a second, and a billion rows of 1 KB is 1 TB.
- After computing, check that every number in the question was used.
- Say the result out loud and ask whether it changes the design. An estimate that does not change anything is not worth doing.

The first time I got a "how many servers" question fully right was on day twelve.

## 4. Stopping after the first correct move

A question would describe three symptoms and I would fix one. A slow homepage: I said "cache it in Redis" and stopped.

The fuller answer is an order, with a reason for moving to each next step: fix the query and indexes first, then read replicas, then a cache, then a CDN for content that is the same for everyone. Each step exists because the one before it runs out.

The rule: for every symptom in the question, name one mechanism. If a symptom has no mechanism against it, the answer is not finished.

## 5. Describing the implementation, not the contract

For a redirect endpoint I said "it returns the long URL". The contract is a 302 with a `Location` header, and whether it is 301 or 302 matters, because a permanent redirect gets cached by browsers and you lose the ability to expire links or count clicks.

I also put verbs in paths and passed the user ID in the request body, where it should come from the authenticated session.

## 6. Caching the entity but not the list

I had already stated the principle myself: cache the smallest unit, entities plus lists of IDs. Then on the news feed I cached individual articles and had no answer for "how do you know which twenty to fetch?".

For a feed, the list is the thing to cache. One sorted set per region, with the article ID as the member and the publish time as the score, written when an article is ingested and trimmed to the newest couple of thousand.

Past that window the query falls back to the database, and this is where I was wrong three sessions in a row. I kept saying the primary key would make it fast. It needs a composite index of `(region, published_at, id)`: the equality column first, then the sort column, then the ID as a tiebreaker. The cursor condition belongs in the `WHERE` clause as well.

## 7. Reaching for a lock first

Given "check, then update" code, my reflex was `SELECT ... FOR UPDATE`. On a coupon problem that reflex reproduced the exact deadlock pattern I had been taught earlier in the same session.

The order I try to use now:

- Can the check and the write be one conditional statement? `UPDATE ... SET stock = stock - 1 WHERE stock > 0` needs no explicit lock.
- Can a unique constraint do the checking? "One coupon per user" is a unique index, not a query.
- Is there a limit across many child rows, such as total refunds against an order? Keep the running total on the parent row and do a conditional update there, instead of trying to lock a range of child rows.
- Is there an external call? Move to an intermediate state and commit, call outside the transaction with an idempotency key, then finish based on the result.

Row locks are for when I truly must read, compute and then write, and even then by primary key with nothing slow inside the transaction.

## 8. Read, compute, write as three steps

The same mistake in a different place. For a token bucket in Redis I read the count, computed the new value in the application and wrote it back. Two requests can both read the old value and both pass.

It has to be one atomic step, which in Redis means a Lua script. A lock release is the same shape: store an owner token as the lock's value, and compare and delete in one script, so that a slow worker cannot delete a lock that now belongs to someone else. The database constraint stays as the backstop either way.

## 9. Treating a cross-service flow as a transaction

Asked how to move money across two shards, I said "open a transaction". A database transaction lives on one connection to one database. Across services there is no rollback, least of all after an external payment has gone through.

What I actually did in past work, and should have said, is a state per step stored in the database, idempotent handlers, a scheduled scan for stuck records, and a compensating action such as a refund when retrying cannot help. I also learned to separate failures worth retrying from business failures that need compensation.

## 10. Giving up at an unfamiliar name

Twice I said "I have not used that, so I do not know" about a column store and a wide-column database. Both times the question only needed arithmetic. 500 ads, one row a minute, for a year is about 260 million rows, which is why you roll up to daily rows for long ranges. I got there with one hint.

A smaller version of that problem was familiar from work: a dashboard that computed everything at query time and ran out of memory, fixed by pre-aggregating on a schedule. Saying "I have seen a smaller version of this" is a better start than "I do not know".

## What has improved

- Estimates: wrong twice in three at the start, then one full pass, and the recent ones no longer quote a total as a rate.
- Scope: I now state what is out, though I still add things back.
- Requirements: no components in them for the last two problems.
- The fallback index: wrong, wrong, half right, nearly right. I still forgot the ID tiebreaker the last time.

The pattern across all ten is that I usually knew the piece of knowledge. What was missing was the habit of saying the default first, then the trade-off, and of finishing the answer.
