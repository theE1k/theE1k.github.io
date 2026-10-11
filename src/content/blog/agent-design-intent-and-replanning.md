---
title: 'Study notes on agent design: intent recognition, planning and replanning'
description: 'What I learned, and what I got wrong, in the first seven lessons of an agent system design course.'
pubDate: 2026-10-11
tags: ['ai-agents']
---

These are notes from the first seven lessons of a Chinese-language course on agent system design interviews (Geek Time's "AI Agent 系统设计面试现场"). The running example is a shopping assistant. I answered diagnostic questions out loud without notes, and recorded where I was wrong.

The explanations below are in my own words and reflect my current understanding. I have not built a production agent with this pipeline yet.

## The pipeline, in order

```text
user input -> normalisation -> intent recognition -> load -> execute
```

I got the order wrong the first time by putting intent recognition first.

**Normalisation** comes before anything else. "The denim one is nice, is there something better value?" cannot be classified until "the denim one" is resolved against the conversation. Two things I missed:

- It has two depths. A first pass uses only the conversation history. Anything that needs the user's profile or a tool result can only happen later, inside the execution loop.
- "Better value" has to end up as something a tool can take, such as a price range, or the same price with a higher quality tier. If it cannot be pinned down, ask.

**Intent recognition** outputs a label, the slots and a confidence. It does not answer the user.

**Load** is the step I forgot entirely on a retest: the intent decides which prompt, which tools and which context go into the window. An after-sales question should not carry the user's shopping profile.

## Why not let the agent loop work it out?

My first answer was only "to load the right prompt". The fuller answer:

- The intent picks the tools and the context, not just the prompt.
- A separate step can be measured on its own. When an answer is bad, you can tell whether classification was wrong or execution was.
- It gives the system a clear boundary to test and debug.

## Three layers

1. **No model call.** Buttons, exact matches, rules. I answered "coreference resolution" here twice, which mixes up this layer with normalisation. A match in this layer saves only the classification call. The main model still runs afterwards.
2. **A small, fast model** that handles most inputs and reports a confidence.
3. **A strong model** for inputs with several intents or heavy dependence on context.

What moves an input from layer two to layer three is the confidence band: accept when it is high, clarify or escalate when it is not. Two cautions I had not considered: a model's self-reported confidence is not a real probability, and the thresholds have to be tuned on a test set.

## Clarifying, declining, and constraints

- **Hard and soft constraints.** "Under 100" is hard. "Preferably jeans" is soft. If nothing satisfies both, relax the soft one and tell the user you did. I got the relaxing right and forgot the telling.
- **Missing slots.** I suggested filling them from the user's profile before asking, which saves a question. What I left out is that when the profile cannot fill them, the system has to ask, ideally with options to tap.
- **Persistence.** Constraints should be kept separately and included on every call, so that they survive a long conversation.
- **Declining.** Some inputs are outside what the assistant does, and saying so is a valid output.

## When accuracy drops

The scenario: five intents grew to sixty, and "compare" keeps being confused with "recommend".

**Too many intents.** I got as far as grouping them into a hierarchy. Other options are retrieving the top few candidate intents first and letting the model choose among those, or selecting few-shot examples dynamically. A hierarchy costs extra calls.

**Overlapping intents.** I had no answer at first. The steps:

1. Check whether the overlap actually causes failures downstream. If both intents lead to an acceptable result, leave it.
2. Otherwise either split out a third intent, or merge the two and extract a parameter that code then branches on.

The line worth remembering: model the difference as a parameter, not as an intent.

## Evaluating it

I started with "store past conversations and re-check after changes". What a proper evaluation has:

- Accuracy per intent, because the long tail hides inside an average.
- Slot accuracy, especially for required slots.
- Separate numbers for declining and for clarifying.
- A test set that covers standard phrasing, colloquial phrasing, missing slots, out-of-scope inputs and easily confused pairs.
- Online signals. A next turn that says "that is not what I meant" is a label for the previous turn.
- Overall task success, since correct classification is not the goal in itself.

## Plans

A plan has five parts: the goal, hard constraints, missing information, checkpoints, and candidate paths with a rule for choosing between them.

Two mistakes from a gift-buying example:

- I listed "birthday present, for a man" as soft constraints. Those are known facts.
- I wanted to infer the recipient's brand preference from the buyer's profile. For a gift, the buyer's profile describes the wrong person.

## Five ways to correct course

Clarify, retry, replan, roll back, abort. I could name two at first and three a few days later, and once put "decline" in the list, which belongs to intent recognition.

The distinction I kept blurring is retry versus replan. The test is whether the plan changes. A retry repeats the same step and suits transient failures. If a tool is going to stay unavailable, retrying is wrong, and the choice is to replan or abort.

## Replanning

**When to replan.** Either the context changed, for example the user added a requirement, or an assumption the plan relied on turned out to be false. I could give examples of the second but could not name the category.

**What a replan should look like.** I was given a flawed replan and found two of its six problems. All six:

- A new constraint from the user never made it into the new plan.
- A hard constraint was changed without asking the user.
- It claimed the goal had changed, with no evidence.
- It restarted the search from scratch and threw away finished work. The change should be as small as possible.
- Steps disappeared without explanation.
- It did not sort steps into kept, modified and cancelled, with a reason for each.

**Probing before committing.** Probe the step whose failure would block everything after it, usually an external tool. A probe must have no side effects, so a write step is probed with a dry run or a read-only check.

## Backtracking

Three points are easy to conflate: where the failure showed up, where the root cause is, and where to roll back to.

- Results computed from an invalid result are tainted even though the steps that produced them did nothing wrong.
- A checkpoint that passed does not prove the step was right.
- If a wrong fact was written into the user's profile, it has to be corrected, or it will come back.

**Oscillation.** A log that goes A, B, A, B is not a retry loop. It is replanning without memory. The fix is to record why each path failed and which paths have been tried, and to keep the list of candidate paths, so that a third option can be chosen.

**What not to leave to the model.** Counting attempts, marking results as invalid, and walking the dependency graph to find what is affected downstream. These are deterministic, so code should do them. I missed the third.

## A habit I am fixing

When a question has two parts, I tend to answer the first and stop. It happened eight times across these sessions, almost always on open "list the ways" questions. With a concrete case in front of me, such as a broken log or a flawed plan, I answered every part. I now ask for case-based questions, and I check that the answer covers each part before I stop.

## Next

Lesson eight is on the think, act, observe loop. After that come context management, retrieval and evaluation, and then one full design exercise from end to end.
