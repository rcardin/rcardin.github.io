---
layout: post
title:  "A Cameo that is worth an Oscar"
date:   2017-11-20 17:13:01
comments: true
categories: akka scala design-pattern
tags:
    - design pattern
    - akka
    - scala
summary: "Rarely, during my life as a developer, I found pre-packaged solutions that fits my problem so well. Design patterns are abstraction of both problems and solutions. So, they often need some kind of customization on the specific problem. While I was developing my concrete instance of Actorbase specification, I came across the Cameo pattern. It enlighted my way and my vision about how to use Actors profitably. Let's see how and why."
social-share: true
social-title: "A Cameo that is worth an Oscar"
social-tags: "Akka, Scala, designpatterns"
math: false
---

Rarely, during my life as a developer, I found pre-packaged solutions that fits my problem so well. Design patterns are abstraction of both problems and solutions. So, they often need some kind of customization on the specific problem. While I was developing my concrete instance of [Actorbase specification](http://rcardin.github.io/database/actor-model/reactive/akka/scala/2016/02/07/actorbase-or-the-persistence-chaos.html), I came across the **Cameo pattern**. It enlighted my way and my vision about how to use Actors profitably. Let's see how and why.

## The problem: capturing context
Jamie Allen, in his short but worthwhile book [Effective Akka](http://shop.oreilly.com/product/0636920028789.do), begins the chapter dedicated to Actors patterns with the following words:

> One of the most difficult tasks in asynchronous programming is trying to capture context so that the state of the world at the time the task was started can be accurately represented at the time the task finishes.

This is exactly the problem we are trying to resolve. 

Actors often model long-lived asynchronous processes, in which a response in the future corresponds to a message sent earlier. Meanwhile, the context of execution of the Actoer could be changed. In the case of an Actor, its context is represented by all the mutable variables owned by the Actor itself. A notable example is the `sender` variable that stores the sender of the current message being processed by an Actor.

### Context handling in Actorbase actors

Let's make a concrete example. In Actorbase there are two types of Actors among the others: `StoreFinder` and `Storekeeper`. Each Actor of type `StoreFinder` represents a _distributed map_ or a _table_, but it does not phisically store the key-value couples. This information is stored by `Storekeeper` Actors. So, each `StoreFinder` owns a distributed set of its key-value couples, which means that owns a set of `Storekeeper` Actors that stores the information for it.


## References
- [Chapter 2: Patterns of Actor Usage, The Cameo Pattern. Effective Akka, Patterns and Best Practices,	Jamie Allen, August 2013, O'Reilly Media](http://shop.oreilly.com/product/0636920028789.do)