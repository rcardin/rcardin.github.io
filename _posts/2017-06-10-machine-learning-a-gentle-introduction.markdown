---
layout: post
title:  "Machine Learning: A gentle introduction"
date:   2017-06-10 11:53:12
comments: true
categories: machine-learning artificial-intelligence
tags:
    - machine-learning
    - ai
summary: "Looking at the last Google and Apple conventions it was clear to all: if in the past years the main buzz words in the information technology field were IoT and Big Data, the catch'em all word of this year is without a doubt Machine Learning. What does this word exactly means? Are we talking about artificial intelligence? Somebody is trying to build Skynet to ruin the world? Machine will steal my job in the future? Know your enemy, they said. So let's try to understand what Machine Learning really means."
social-share: true
social-title: "Machine Learning: A gentle introduction"
social-tags: "machinelearning, ArtificialIntelligence"
math: true
---

Looking at the last Google and Apple conventions it was clear to all: if in the past years the main buzz words in the information technology field were _IoT_ and _Big Data_, the _catch'em all_ word  of this year is without a doubt _Machine Learning_. What does this word exactly means? Are we talking about artificial intelligence? Somebody is trying to build Skynet to ruin the world? Machine will steal my job in the future? "Know your enemy", they said. So let's try to understand what Machine Learning really means.

![I am your friendly metal neighbour!!!](/assets/2017-06-10/skynet.jpg)

#### Definitions
The task we are going to accomplish is not simple. So, let's start from the begining: What does _machine learning_ refer to.

> Machine Learning is a discipline of Artificial Intelligence, that is responsible to study and develop algorithms that allows machines to learn information. In detail, the learning process is done using an inductive approach, that tries to extract rules and behavioural patterns from huge amount of data.

The types of information used by the algorithms (_learner_) identify the following categorization of machine learning algorithms, which are:

 1. **Supervised learning**: The learner a set of given couples (_input_, _output_) to learn a function \\(f\\) that maps _input_ to _output_. The above couples are called _supervisions_ and using them the learner tries to find the function that approximately performs like \\(f\\). Supervisions must be available at the beginning of the learning process.
 2. **Unsupervised learning**: In this kind of learning process, the function \\(f\\) is learned by the learner using solely the _input_s given to the learner. There is no information relative to the output of the function \\(f\\). In this type of learning process, the learner tries to approximate the probability distribution of the given inputs. 
 3. **Reinforcement learning**: Given an environment which an agent can interact with, and given a set of positive and negative returns the environment can give to the age, the objective in this case is to find a policy of action of the agent that maximizes the values of the above returns.

Given the above definitions, we can now move on. In this post I will focus on _supervised learning_. Let's move on.

#### Supervised learning
We said that in this king of learning we need a set of couples of inputs and outputs that we called supervisions. Someone has to give us this infomation, otherwise it is not possible to learn anything using this approach. We can call it the _oracle_.


