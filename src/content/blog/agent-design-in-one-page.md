---
title: 'Agent design in one page'
description: 'An agent is a model in a loop with tools. The design work is in everything around the model.'
pubDate: 2026-10-11
tags: ['ai-agents']
---

This is my current map of agent design, after working through a course on the subject and a lot of reading. It is a summary of how I now think about it. I have built LLM workflows and retrieval tools, but not yet a production agent of the kind described here.

## What an agent is

An agent is **a model in a loop with tools**. It reads the situation, chooses an action, sees the result, and repeats until it decides it is finished.

The model is the part you do not design. Agent design is about everything around it: what the model gets to see, what it is allowed to do, when it stops, and how anyone knows whether it worked.

## First decision: do you need one

A fixed workflow, where code decides the steps and the model fills them in, is cheaper, faster and far easier to test. An agent earns its place only when the path cannot be known in advance.

Most real systems are a mix: a workflow on the outside, with a loop inside the one step that needs it.

## The shape of a request

1. **Understand.** Turn what the user typed into something precise: resolve references, work out what kind of request it is, extract the constraints.
2. **Prepare.** Based on that, choose the instructions, tools and context the model will get.
3. **Plan.** For anything with several steps, state the goal, the constraints, what is still unknown and where to check progress.
4. **Act and observe.** The loop itself.
5. **Correct.** When something goes wrong, choose between asking, retrying, replanning, undoing or stopping.
6. **Evaluate.** Decide whether the task was done, not whether the calls succeeded.

## Four questions behind every design choice

**Context: what does the model see?** The window is small and everything in it competes for attention. Most quality problems are context problems: the right fact was missing, or was buried under irrelevant ones. State, conversation history and long-term memory are three different things and should be managed separately.

**Control: who decides?** Some decisions are judgement and belong to the model. Others are bookkeeping: counting attempts, enforcing a budget, tracking which results are no longer valid. Those belong in code. A common mistake is asking the model to do the bookkeeping.

**Termination: when does it stop?** A loop needs limits on steps, time and cost, and a way to notice that it is no longer making progress. An agent that alternates between two failing approaches is not retrying. It is looping without memory.

**Trust: what is it allowed to do, and what does it believe?** Tool results are input from the outside world and can be wrong or hostile. Actions with side effects need to be safe to repeat, and the risky ones need a person to approve them.

## Failure is the normal case

A plan is a set of assumptions. When one turns out to be false, the useful response is the smallest one that fixes it: keep what is still valid, redo what depended on the broken assumption, and say what changed and why. Starting again from scratch is the expensive default.

It also matters where you look. The step that failed is often not the step that was wrong.

## You cannot improve what you cannot see

- Measure each stage on its own as well as the whole. Otherwise a bad answer cannot be traced to its cause.
- Keep a test set that includes the awkward cases, not only the typical ones.
- Treat "the tool call succeeded" and "the task succeeded" as different facts.
- Give every request one identifier that links its model calls and tool calls, so a failure can be replayed.

## Where backend experience carries over

Much of this is familiar from ordinary backend work: idempotent operations, explicit state, permissions, audit logs, timeouts and retries. The model is new. The discipline around it is not.

That is also where I think the durable work is. Models will keep improving, and the scaffolding that compensates for their weaknesses will keep shrinking. The decisions about what a system may do on its own, and how its work is checked, will stay.
