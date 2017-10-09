---
layout: post
title:  "Resove me, Implicitly"
date:   2017-10-15 13:22:45
comments: true
categories: design scala
tags:
    - design pattern
    - dependency injection
    - scala
summary: "Reading my posts you can easily find that there is a topic that cares about me a lot: Dependency management in development process. There is a feature of the Scala programming language that I liked since the beginning. Without any external library, it is possible to successfully implement vary  depenency injection mechanisms. In the past I wrote about the Cake pattern. Now it's time to talk about dependenct injection through the use of implicits. Let this race starts!"
social-share: true
social-title: "Resove me, Implicitly"
social-tags: "Scala, designpattern, programming"
math: false
---

Reading my posts you can easily find that there is a topic that cares about me a lot: Dependency management in development process. There is a feature of the Scala programming language that I liked since the beginning. Without any external library, it is possible to successfully implement vary  depenency injection mechanisms. In the past I wrote about the [Cake pattern](http://rcardin.github.io/design/2014/08/28/eat-that-cake.html). Now it's time to talk about dependenct injection through the use of implicits. Let this race starts!

## The problem: dependency injection
### Dependency
I have wrote many times about this topic, then I will not make a long introduction. To summarize, every time a component needs to send a message to another component, a dependency is defined between them. Components may be packages, classes, functions and so on. Dependency between two components can have many levels of strenght. If you want a complete explanation of the dependency concept, have a look at this post: [Dependency.](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html).
// TODO Make an example.
