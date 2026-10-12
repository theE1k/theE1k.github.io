---
title: 'What a paradigm shift looks like in a paper'
description: 'Kaiming He tells his group to aim for paradigm shifts, not "apply X to Y" papers. Four of his papers show what that means in practice.'
pubDate: 2026-10-12
tags: []
lang: 'en'
---

## Where this came from

I recently listened to a Chinese podcast with three students who came up through olympiad competitions and now study at Tsinghua and MIT. Two of them work with Kaiming He. Most of the episode was general talk about AI and university, and I didn't take much from it.

The part I kept thinking about afterwards was a comment about how Kaiming steers the group. He tells them to aim for paradigm shifts and to avoid papers that take an existing method and apply it somewhere new. I wanted to work out what that difference looks like in practice, using his own papers as the examples.

## Applying X to Y

Most papers I read follow the same recipe. Take a method that already worked somewhere, such as a Transformer or a contrastive loss, run it on a new dataset or task, and report a gain of a point or two.

That work can be useful. Someone has to check that a method transfers, and the numbers are real. But when I finish reading, I believe the same things about the field that I believed before. The method was already trusted, and now there is one more place where it works. The paper answers "does it also work here?", and the answer is usually yes, which is part of why it changes so little.

## Four examples from Kaiming He's papers

ResNet (2015). Very deep networks were hard to train in a way that looked fundamental. Adding layers to a plain network made the training error go up, which can't be overfitting, because a deeper model could in principle copy the shallower one and add identity layers. ResNet added shortcut connections so each block learns a correction on top of an identity mapping. ImageNet models went from about 20 layers to 152, and residual connections are now in almost every deep architecture, Transformers included.

MAE (2021). Masked prediction had taken over NLP through BERT, but it hadn't worked as well on images. Pixels are redundant, so a model can fill a small hole by copying its neighbours and learn little. MAE masked 75% of the image patches, ran the encoder on the visible quarter only, and used a small decoder to rebuild the pixels. The high mask ratio made the task hard enough to be worth learning, and skipping the masked patches made pretraining about three times faster.

Noise conditioning (2025). Diffusion models get the noise level as an input, and nearly everyone treated it as required. A paper from his group, "Is Noise Conditioning Necessary for Denoising Generative Models?", simply removed it. Most models degraded only a little, and some barely changed. The students on the podcast mentioned this one as an example of subtraction.

JiT (2025). Image diffusion models usually run in the latent space of a pretrained autoencoder, or in pixel space with extra tricks. "Back to Basics: Let Denoising Generative Models Denoise" argues that the network should predict the clean image directly, since clean images lie on a low-dimensional manifold and noise does not. With that change, a plain Transformer on large patches of raw pixels generates good images with no tokenizer and no pretraining. One of the students described it as having a single principle that matters, and the paper's job is to show that nothing else does.

## The pattern underneath

Each paper starts from something people relied on without testing much: that depth hurts training, that masking suits text better than images, that the network must be told the noise level, that pixel-space generation needs a latent space or a pile of tricks. Then it breaks that assumption with the smallest change that can do it.

The smallness is part of the argument. If one shortcut connection fixes depth, the problem was in how the network was set up, and a paper that stacked five tricks on top would never have shown that. A simple method also travels. Other people can drop it into their own work without inheriting a fragile recipe.

This explains the students' point about ablations. In a paper that starts from a plain baseline and adds one change at a time, you can see which change carries the result. If the gain disappears when you vary other parts of the model, you probably found a quirk of your setup and not a principle. Subtraction is the same test run the other way. Removing a component and watching nothing break tells you more about a model than adding one and gaining half a point.

## Limits, and using this outside research

Most good papers are not paradigm shifts, and treating this as the bar for every project would be a good way to never finish anything. I'm also looking at the papers that turned out to matter. Plenty of attempts to overturn an assumption end up confirming it, and I have no idea how often that happens in Kaiming's group before something like MAE comes out.

I still think the habit is useful when I'm not writing papers. If I describe a project in an interview as "I built RAG over the company's documents," that is X applied to Y. A stronger answer names an assumption I actually tested, something like: we assumed retrieval needed an intent classifier in front of it, I tried removing it, and the system got simpler without losing accuracy. That only works if it happened, so the habit has to start during the work. Keep asking which part is doing the job, and try taking things out.
